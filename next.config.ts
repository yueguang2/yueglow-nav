import type { NextConfig } from "next";

const defaultDevOriginHosts = ["ailab.heiyu.space", "192.168.31.177"];
const defaultServerActionOriginHosts = [
  "ailab.heiyu.space",
  "ailab.heiyu.space:3000",
  "192.168.31.177",
  "192.168.31.177:3000",
];

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
