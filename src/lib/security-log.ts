type SecurityEvent =
  | "auth.login_failed"
  | "auth.rate_limited"
  | "oidc.denied"
  | "csrf.denied"
  | "ssrf.blocked";

export function logSecurityEvent(event: SecurityEvent, details: Record<string, string | number | boolean | undefined> = {}) {
  const safeDetails = Object.fromEntries(
    Object.entries(details).filter(([, value]) => value !== undefined && value !== ""),
  );

  console.warn(`[security] ${event}`, safeDetails);
}
