import dns from "node:dns/promises";
import net from "node:net";
import { readHostSetEnv } from "./runtime-config";

export type UrlSafety = {
  ok: boolean;
  url?: URL;
  reason?: string;
  isPrivate?: boolean;
};

const privateDomainSuffixes = [".localhost", ".local", ".lan", ".internal", ".home.arpa"];

function isPrivateIpv4(hostname: string) {
  const parts = hostname.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return false;
  }

  const [a, b] = parts;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function isPrivateIpv6(hostname: string) {
  const normalized = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  return normalized === "::1" || normalized.startsWith("fe80:") || normalized.startsWith("fc") || normalized.startsWith("fd");
}

export function classifyUrl(value: string): UrlSafety {
  try {
    const url = new URL(value);

    if (!["http:", "https:"].includes(url.protocol)) {
      return { ok: false, reason: "unsupported-protocol" };
    }

    const hostname = url.hostname.toLowerCase();
    const ipVersion = net.isIP(hostname);
    const isPrivate =
      hostname === "localhost" ||
      privateDomainSuffixes.some((suffix) => hostname.endsWith(suffix)) ||
      (ipVersion === 4 && isPrivateIpv4(hostname)) ||
      (ipVersion === 6 && isPrivateIpv6(hostname));

    return { ok: true, url, isPrivate };
  } catch {
    return { ok: false, reason: "invalid-url" };
  }
}

export function isProbeHostAllowed(url: URL) {
  const allowedHosts = readHostSetEnv("SMART_LINK_PROBE_ALLOWED_HOSTS");

  if (allowedHosts.size === 0) {
    return net.isIP(url.hostname) !== 0;
  }

  return allowedHosts.has(url.host.toLowerCase()) || allowedHosts.has(url.hostname.toLowerCase());
}

export async function canServerProbeUrl(value: string) {
  const classified = classifyUrl(value);

  if (!classified.ok || !classified.url || classified.isPrivate) {
    return { ok: false, reason: classified.reason ?? "private-target" };
  }

  if (!isProbeHostAllowed(classified.url)) {
    return { ok: false, reason: "host-not-allowlisted" };
  }

  if (net.isIP(classified.url.hostname) !== 0) {
    return { ok: true };
  }

  try {
    const records = await dns.lookup(classified.url.hostname, { all: true });
    const hasPrivateAddress = records.some((record) => {
      const address = record.family === 6 ? `[${record.address}]` : record.address;
      return classifyUrl(`${classified.url!.protocol}//${address}`).isPrivate;
    });

    return hasPrivateAddress ? { ok: false, reason: "dns-private-address" } : { ok: true };
  } catch {
    return { ok: false, reason: "dns-lookup-failed" };
  }
}
