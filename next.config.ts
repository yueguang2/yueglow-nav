import type { NextConfig } from "next";

const defaultDevOriginHosts: string[] = [];
const defaultServerActionOriginHosts: string[] = [];

function parseOriginList(value: string | undefined, mode: "hostname" | "host") {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      try {
        const parsed = new URL(item.includes("://") ? item : `http://${item}`);
        return mode === "hostname" ? parsed.hostname : parsed.host;
      } catch {
        return item.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
      }
    });
}

function unique(values: string[]) {
  return Array.from(new Set(values));
}

const nextConfig: NextConfig = {
  typedRoutes: true,
  output: "standalone",
  async headers() {
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy-Report-Only", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  allowedDevOrigins: unique([
    ...defaultDevOriginHosts,
    ...parseOriginList(process.env.NEXT_ALLOWED_DEV_ORIGINS, "hostname"),
  ]),
  experimental: {
    serverActions: {
      allowedOrigins: unique([
        ...defaultServerActionOriginHosts,
        ...parseOriginList(process.env.NEXT_SERVER_ACTION_ALLOWED_ORIGINS, "host"),
      ]),
    },
  },
};

export default nextConfig;
