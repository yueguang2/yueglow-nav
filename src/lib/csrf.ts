import { cookies } from "next/headers";
import { createToken, hashToken } from "./crypto";
import { logSecurityEvent } from "./security-log";

export const csrfFieldName = "csrfToken";

const csrfCookieName = "nav_csrf";
const maxAge = 60 * 60 * 8;

export async function getCsrfToken() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(csrfCookieName)?.value;

  if (existing) {
    return existing;
  }

  const token = createToken();
  cookieStore.set(csrfCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge,
    path: "/",
  });

  return token;
}

export async function verifyCsrfToken(formData: FormData) {
  const cookieStore = await cookies();
  const expected = cookieStore.get(csrfCookieName)?.value;
  const actual = formData.get(csrfFieldName);

  if (typeof actual !== "string" || !expected || hashToken(actual) !== hashToken(expected)) {
    logSecurityEvent("csrf.denied");
    return false;
  }

  return true;
}
