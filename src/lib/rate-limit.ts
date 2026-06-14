import { headers } from "next/headers";
import { readBooleanEnv } from "./runtime-config";
import { logSecurityEvent } from "./security-log";

type Entry = {
  count: number;
  resetAt: number;
};

const attempts = new Map<string, Entry>();
const windowMs = 15 * 60 * 1000;
const maxAttempts = 8;

function cleanup(now: number) {
  for (const [key, entry] of attempts) {
    if (entry.resetAt <= now) {
      attempts.delete(key);
    }
  }
}

export async function getClientRateLimitKey(username: string) {
  const headerStore = await headers();
  const trustedProxy = readBooleanEnv("TRUST_PROXY_HEADERS");
  const ip = trustedProxy
    ? headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || headerStore.get("x-real-ip") || "unknown"
    : headerStore.get("x-real-ip") || "direct";

  return `${ip}:${username.trim().toLowerCase() || "unknown"}`;
}

export function checkRateLimit(key: string) {
  const now = Date.now();
  cleanup(now);
  const entry = attempts.get(key);

  if (entry && entry.count >= maxAttempts && entry.resetAt > now) {
    logSecurityEvent("auth.rate_limited", { key });
    return false;
  }

  return true;
}

export function recordFailedAttempt(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || entry.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  entry.count += 1;
}

export function clearFailedAttempts(key: string) {
  attempts.delete(key);
}
