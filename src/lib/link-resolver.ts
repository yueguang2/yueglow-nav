import type { SiteLink } from "./types";

const timeoutMs = 2500;

export type ResolvedLink = {
  ok: boolean;
  url?: string;
  source: "single" | "fastest" | "fallback" | "none";
  message: string;
  elapsed?: number;
};

type ProbeAttempt = {
  success: boolean;
  elapsed?: number;
};

function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);

    if (!["http:", "https:"].includes(url.protocol)) {
      return false;
    }

    const hostname = url.hostname.toLowerCase();

    if (hostname === "localhost" || hostname.endsWith(".localhost")) {
      return false;
    }

    const ipv4Pattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const ipv4Match = hostname.match(ipv4Pattern);

    if (ipv4Match) {
      const octets = ipv4Match.slice(1).map(Number);

      if (octets[0] === 127) return false;
      if (octets[0] === 169 && octets[1] === 254) return false;
      if (octets[0] === 0) return false;
    }

    if (hostname.startsWith("[") && hostname.includes("::1")) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

function isProbeSuccess(response: Response, allowPartialContent = false) {
  return response.ok || (allowPartialContent && response.status === 206) || (response.status >= 300 && response.status < 400);
}

async function fetchProbe(url: string, init: RequestInit, startedAt: number, allowPartialContent = false): Promise<ProbeAttempt> {
  try {
    const response = await fetch(url, init);

    if (isProbeSuccess(response, allowPartialContent)) {
      return { success: true, elapsed: performance.now() - startedAt };
    }
  } catch {
    return { success: false };
  }

  return { success: false };
}

async function probe(link: SiteLink) {
  if (!isValidUrl(link.url)) {
    return undefined;
  }

  const startedAt = performance.now();
  const headController = new AbortController();
  const getController = new AbortController();
  const controllers = [headController, getController];
  const timer = setTimeout(() => {
    for (const controller of controllers) {
      controller.abort();
    }
  }, timeoutMs);

  try {
    const attempts = [
      fetchProbe(
        link.url,
        {
          method: "HEAD",
          cache: "no-store",
          redirect: "follow",
          signal: headController.signal,
        },
        startedAt,
      ),
      fetchProbe(
        link.url,
        {
          method: "GET",
          cache: "no-store",
          redirect: "follow",
          signal: getController.signal,
          headers: {
            Range: "bytes=0-0",
          },
        },
        startedAt,
        true,
      ),
    ];

    return await new Promise<{ link: SiteLink; elapsed: number } | undefined>((resolve) => {
      let pending = attempts.length;
      let settled = false;

      function finish(result: { link: SiteLink; elapsed: number } | undefined) {
        if (settled) {
          return;
        }

        settled = true;

        for (const controller of controllers) {
          controller.abort();
        }

        resolve(result);
      }

      for (const attempt of attempts) {
        attempt
          .then((result) => {
            if (result.success && result.elapsed !== undefined) {
              finish({ link, elapsed: result.elapsed });
              return;
            }

            pending -= 1;

            if (pending === 0) {
              finish(undefined);
            }
          })
          .catch(() => {
            pending -= 1;

            if (pending === 0) {
              finish(undefined);
            }
          });
      }
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(`Probe failed for ${link.url}:`, error);
    }
    return undefined;
  } finally {
    clearTimeout(timer);
  }
}

export async function resolveFastestLink(siteId: number, links: SiteLink[]): Promise<string | undefined> {
  const result = await resolveFastestLinkDetail(siteId, links);
  return result.url;
}

export async function resolveFastestLinkDetail(siteId: number, links: SiteLink[]): Promise<ResolvedLink> {
  const enabledLinks = links.filter((link) => link.isEnabled);

  if (enabledLinks.length === 0) {
    return {
      ok: false,
      source: "none",
      message: "没有可用链接",
    };
  }

  if (enabledLinks.length === 1) {
    return {
      ok: true,
      url: enabledLinks[0].url,
      source: "single",
      message: "已选择唯一可用链接",
    };
  }

  // 并发测速所有链接，不使用缓存
  const results = await Promise.all(enabledLinks.map(probe));
  const fastest = results
    .filter((result): result is { link: SiteLink; elapsed: number } => Boolean(result))
    .sort((a, b) => a.elapsed - b.elapsed)[0];

  const url = fastest?.link.url ?? enabledLinks[0].url;

  return {
    ok: true,
    url,
    source: fastest ? "fastest" : "fallback",
    message: fastest ? `已选定最快链接 (${Math.round(fastest.elapsed)}ms)` : "测速未通过，使用排序第一的备用链接",
    elapsed: fastest?.elapsed,
  };
}
