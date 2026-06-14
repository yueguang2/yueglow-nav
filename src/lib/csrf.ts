import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { createToken } from "./crypto";
import { logSecurityEvent } from "./security-log";

export const csrfFieldName = "csrfToken";

const maxAgeMs = 1000 * 60 * 60 * 8;
const processSecret = randomBytes(32).toString("hex");

export function getCsrfToken() {
  const payload = `${Date.now()}.${createToken()}`;
  return `${payload}.${signPayload(payload)}`;
}

export function verifyCsrfToken(formData: FormData) {
  const actual = formData.get(csrfFieldName);

  if (typeof actual !== "string" || !isValidToken(actual)) {
    logSecurityEvent("csrf.denied");
    return false;
  }

  return true;
}

function isValidToken(token: string) {
  const parts = token.split(".");

  if (parts.length !== 3) {
    return false;
  }

  const [issuedAtValue, nonce, signature] = parts;
  const issuedAt = Number(issuedAtValue);

  if (!Number.isFinite(issuedAt) || Date.now() - issuedAt > maxAgeMs || Date.now() < issuedAt) {
    return false;
  }

  const payload = `${issuedAtValue}.${nonce}`;
  const expected = signPayload(payload);
  const actualBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

function signPayload(payload: string) {
  return createHmac("sha256", getCsrfSecret()).update(payload).digest("hex");
}

function getCsrfSecret() {
  return process.env.APP_SECRET || process.env.CSRF_SECRET || processSecret;
}
