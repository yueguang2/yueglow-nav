const truthyValues = new Set(["true", "1", "yes", "on"]);

export function readBooleanEnv(name: string, defaultValue = false) {
  const value = process.env[name];

  if (value === undefined) {
    return defaultValue;
  }

  return truthyValues.has(value.trim().toLowerCase());
}

export function readCsvEnv(name: string) {
  return (process.env[name] ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export function readHostSetEnv(name: string) {
  return new Set(
    readCsvEnv(name).map((value) => {
      try {
        return new URL(value.includes("://") ? value : `https://${value}`).host.toLowerCase();
      } catch {
        return value.toLowerCase();
      }
    }),
  );
}
