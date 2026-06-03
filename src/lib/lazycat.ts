const enabledValues = new Set(["true", "1", "yes", "on"]);

function readBooleanEnv(name: string) {
  return enabledValues.has((process.env[name] ?? "").trim().toLowerCase());
}

export function isLazycatOidcLoginEnabled() {
  return readBooleanEnv("LAZYCAT_OIDC_LOGIN_ENABLED");
}

export function isLazycatPasswordlessLoginEnabled() {
  return readBooleanEnv("LAZYCAT_PASSWORDLESS_LOGIN_ENABLED");
}
