import type { Route } from "next";

export type AdminBasePath = "/admin/categories" | "/admin/sites" | "/admin/themes";
export type AdminRoute = Route<string>;

const allowedBasePaths = new Set<AdminBasePath>(["/admin/categories", "/admin/sites", "/admin/themes"]);

export function parsePage(value: string | number | undefined | null) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function route(value: string): AdminRoute {
  return value as AdminRoute;
}

export function pageHref(basePath: AdminBasePath, page: number, params: Record<string, string | number | undefined> = {}): AdminRoute {
  const query = new URLSearchParams();
  const normalizedPage = parsePage(page);

  if (normalizedPage > 1) {
    query.set("page", String(normalizedPage));
  }

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  }

  const suffix = query.toString();
  return route(suffix ? `${basePath}?${suffix}` : basePath);
}

export function normalizePageParam(basePath: AdminBasePath, requestedPage: number, actualPage: number, params: Record<string, string | undefined> = {}) {
  const requested = parsePage(requestedPage);
  const actual = parsePage(actualPage);

  if (requested === actual) {
    return null;
  }

  return pageHref(basePath, actual, params);
}

export function sanitizeReturnTo(value: FormDataEntryValue | string | null | undefined, fallback: AdminBasePath): AdminRoute {
  if (typeof value !== "string" || !value.startsWith("/admin/")) {
    return route(fallback);
  }

  try {
    const url = new URL(value, "http://admin.local");
    const path = url.pathname as AdminBasePath;

    if (!allowedBasePaths.has(path)) {
      return route(fallback);
    }

    const page = parsePage(url.searchParams.get("page"));
    const result = new URLSearchParams();

    if (page > 1) {
      result.set("page", String(page));
    }

    const query = result.toString();
    return route(query ? `${path}?${query}` : path);
  } catch {
    return route(fallback);
  }
}

export function withMessage(returnTo: string, message: string): AdminRoute {
  const url = new URL(returnTo, "http://admin.local");
  url.searchParams.set("message", message);
  return route(`${url.pathname}${url.search}`);
}
