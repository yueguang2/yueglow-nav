import { cookies } from "next/headers";
import { createAdmin, getAdminByUsername } from "./db";
import { setSession } from "./auth";
import { createToken, hashPassword } from "./crypto";

const stateCookieName = "nav_oidc_state";
const stateMaxAgeSeconds = 10 * 60;
const redirectPath = "/auth/oidc/callback";

type OidcTokenResponse = {
  access_token?: string;
  token_type?: string;
  id_token?: string;
  error?: string;
  error_description?: string;
};

type OidcUserInfo = {
  sub?: string;
  email?: string;
  name?: string;
  preferred_username?: string;
  groups?: string[] | string;
};

export function getOidcConfig() {
  const clientId = process.env.OIDC_CLIENT_ID || process.env.LAZYCAT_AUTH_OIDC_CLIENT_ID;
  const clientSecret = process.env.OIDC_CLIENT_SECRET || process.env.LAZYCAT_AUTH_OIDC_CLIENT_SECRET;
  const authUri = process.env.OIDC_AUTH_URI || process.env.LAZYCAT_AUTH_OIDC_AUTH_URI;
  const tokenUri = process.env.OIDC_TOKEN_URI || process.env.LAZYCAT_AUTH_OIDC_TOKEN_URI;
  const userinfoUri = process.env.OIDC_USERINFO_URI || process.env.LAZYCAT_AUTH_OIDC_USERINFO_URI;

  if (!clientId || !clientSecret || !authUri || !tokenUri || !userinfoUri) {
    return undefined;
  }

  return { clientId, clientSecret, authUri, tokenUri, userinfoUri };
}

export function isOidcEnabled() {
  return Boolean(getOidcConfig());
}

export function getOidcRedirectUri(request: Request) {
  const baseUrl = getExternalBaseUrl(request);
  return new URL(redirectPath, baseUrl).toString();
}

export function getExternalUrl(path: string, request: Request) {
  return new URL(path, getExternalBaseUrl(request)).toString();
}

export async function createOidcLoginUrl(request: Request) {
  const config = getOidcConfig();

  if (!config) {
    throw new Error("OIDC is not configured");
  }

  const state = createToken();
  const cookieStore = await cookies();
  cookieStore.set(stateCookieName, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: stateMaxAgeSeconds,
    path: "/",
  });

  const loginUrl = new URL(config.authUri);
  loginUrl.searchParams.set("client_id", config.clientId);
  loginUrl.searchParams.set("redirect_uri", getOidcRedirectUri(request));
  loginUrl.searchParams.set("response_type", "code");
  loginUrl.searchParams.set("scope", "openid profile email groups");
  loginUrl.searchParams.set("state", state);

  return loginUrl;
}

export async function verifyOidcState(state: string | null) {
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(stateCookieName)?.value;
  cookieStore.delete(stateCookieName);

  return Boolean(state && expectedState && state === expectedState);
}

export async function exchangeOidcCode(code: string, request: Request) {
  const config = getOidcConfig();

  if (!config) {
    throw new Error("OIDC is not configured");
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: getOidcRedirectUri(request),
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });

  const response = await fetch(config.tokenUri, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      accept: "application/json",
    },
    body,
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => ({}))) as OidcTokenResponse;

  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description || payload.error || "OIDC token exchange failed");
  }

  return payload.access_token;
}

export async function fetchOidcUserInfo(accessToken: string) {
  const config = getOidcConfig();

  if (!config) {
    throw new Error("OIDC is not configured");
  }

  const response = await fetch(config.userinfoUri, {
    headers: {
      accept: "application/json",
      authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => ({}))) as OidcUserInfo;

  if (!response.ok || !payload.sub) {
    throw new Error("OIDC userinfo request failed");
  }

  return payload;
}

export function isOidcAdmin(userInfo: OidcUserInfo) {
  const groups = userInfo.groups;

  if (Array.isArray(groups)) {
    return groups.includes("ADMIN");
  }

  return typeof groups === "string" && groups.split(/[,\s]+/).includes("ADMIN");
}

export async function signInOidcAdmin(userInfo: OidcUserInfo) {
  const username = normalizeUsername(userInfo.preferred_username || userInfo.email || userInfo.name || userInfo.sub);
  let admin = getAdminByUsername(username);

  if (!admin) {
    const result = createAdmin(username, hashPassword(createToken()));
    admin = {
      id: Number(result.lastInsertRowid),
      username,
      passwordHash: "",
      createdAt: new Date().toISOString(),
    };
  }

  await setSession(admin.id);
}

function normalizeUsername(value?: string) {
  const username = (value || "lazycat-admin").trim().replace(/[^\w.@-]+/g, "-").replace(/^-+|-+$/g, "");
  return username || "lazycat-admin";
}

function getExternalBaseUrl(request: Request) {
  const requestUrl = new URL(request.url);
  const appDomain = process.env.LAZYCAT_APP_DOMAIN;
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const host = appDomain || forwardedHost || request.headers.get("host") || requestUrl.host;
  const protocol = appDomain || forwardedHost ? "https" : forwardedProto || requestUrl.protocol.replace(/:$/, "");

  return `${protocol}://${host}`;
}
