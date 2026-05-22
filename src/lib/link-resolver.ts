import type { SiteLink } from "./types";

const timeoutMs = 2500;
const cacheTtlMs = 1000 * 60 * 5;

type CacheEntry = {
  url: string;
  expiresAt: number;
};

export type ResolvedLink = {
  ok: boolean;
  url?: string;
  source: "cache" | "single" | "fastest" | "fallback" | "none";
  message: string;
};

const speedCache = new Map<number, CacheEntry>();

function cacheKey(siteId: number) {
  return siteId;
}

async function probe(link: SiteLink) {
  const startedAt = performance.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const head = await fetch(link.url, {
      method: "HEAD",
      cache: "no-store",
      redirect: "follow",
      signal: controller.signal,
    });

    if (head.ok || (head.status >= 300 && head.status < 400)) {
      return { link, elapsed: performance.now() - startedAt };
    }
  } catch {
    // Some sites block HEAD. Fall back to GET below.
  } finally {
    clearTimeout(timer);
  }

  const fallbackController = new AbortController();
  const fallbackTimer = setTimeout(() => fallbackController.abort(), timeoutMs);

  try {
    const response = await fetch(link.url, {
      method: "GET",
      cache: "no-store",
      redirect: "follow",
      signal: fallbackController.signal,
      headers: {
        Range: "bytes=0-0",
      },
    });

    if (response.ok || response.status === 206 || (response.status >= 300 && response.status < 400)) {
      return { link, elapsed: performance.now() - startedAt };
    }
  } catch {
    return undefined;
  } finally {
    clearTimeout(fallbackTimer);
  }

  return undefined;
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

  const key = cacheKey(siteId);
  const cached = speedCache.get(key);

  if (cached && cached.expiresAt > Date.now() && enabledLinks.some((link) => link.url === cached.url)) {
    return {
      ok: true,
      url: cached.url,
      source: "cache",
      message: "已使用近期测速结果",
    };
  }

  if (enabledLinks.length === 1) {
    speedCache.set(key, { url: enabledLinks[0].url, expiresAt: Date.now() + cacheTtlMs });
    return {
      ok: true,
      url: enabledLinks[0].url,
      source: "single",
      message: "已选择唯一可用链接",
    };
  }

  const results = await Promise.all(enabledLinks.map(probe));
  const fastest = results
    .filter((result): result is { link: SiteLink; elapsed: number } => Boolean(result))
    .sort((a, b) => a.elapsed - b.elapsed)[0];

  const url = fastest?.link.url ?? enabledLinks[0].url;
  speedCache.set(key, { url, expiresAt: Date.now() + cacheTtlMs });

  return {
    ok: true,
    url,
    source: fastest ? "fastest" : "fallback",
    message: fastest ? "已选定最快可用链接" : "测速未通过，使用排序第一的备用链接",
  };
}
