import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createToken, hashToken } from "./crypto";
import { csrfFieldName, getCsrfToken, verifyCsrfToken } from "./csrf";
import { resolveFastestLinkDetail } from "./link-resolver";
import { isAllowedOidcEndpoint } from "./oidc";
import { classifyUrl } from "./url-security";
import { colorSchema } from "./validation";
import type { SiteLink } from "./types";

function testLink(url: string, sortOrder: number): SiteLink {
  return {
    id: sortOrder,
    siteId: 1,
    label: `Link ${sortOrder}`,
    url,
    sortOrder,
    isEnabled: true,
    createdAt: "",
    updatedAt: "",
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("url security", () => {
  it("classifies public and private targets", () => {
    expect(classifyUrl("https://example.com").ok).toBe(true);
    expect(classifyUrl("http://127.0.0.1:3000").isPrivate).toBe(true);
    expect(classifyUrl("http://192.168.1.10").isPrivate).toBe(true);
    expect(classifyUrl("http://service.local").isPrivate).toBe(true);
    expect(classifyUrl("ftp://example.com").ok).toBe(false);
  });
});

describe("smart link fallback", () => {
  it("falls back to the first valid enabled link when probes are blocked", async () => {
    const result = await resolveFastestLinkDetail(1, [
      testLink("https://example.com/one", 10),
      testLink("https://example.com/two", 20),
    ]);

    expect(result.ok).toBe(true);
    expect(result.source).toBe("fallback");
    expect(result.url).toBe("https://example.com/one");
  });

  it("skips invalid fallback links", async () => {
    const result = await resolveFastestLinkDetail(1, [
      testLink("ftp://example.com/one", 10),
      testLink("https://example.com/two", 20),
    ]);

    expect(result.ok).toBe(true);
    expect(result.source).toBe("fallback");
    expect(result.url).toBe("https://example.com/two");
  });

  it("fails when every enabled link is invalid", async () => {
    const result = await resolveFastestLinkDetail(1, [
      testLink("ftp://example.com/one", 10),
      testLink("notaurl", 20),
    ]);

    expect(result.ok).toBe(false);
    expect(result.source).toBe("none");
    expect(result.url).toBeUndefined();
  });
});

describe("theme persistence", () => {
  async function withTempDb<T>(callback: (dbModule: typeof import("./db")) => T | Promise<T>) {
    const previousDataDir = process.env.DATA_DIR;
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "yueglow-nav-test-"));

    process.env.DATA_DIR = dir;
    vi.resetModules();

    const dbModule = await import("./db");

    try {
      return await callback(dbModule);
    } finally {
      dbModule.closeDbForTests();
      if (previousDataDir === undefined) {
        delete process.env.DATA_DIR;
      } else {
        process.env.DATA_DIR = previousDataDir;
      }
      fs.rmSync(dir, { recursive: true, force: true });
      vi.resetModules();
    }
  }

  it("activates ocean by default for a new database", async () => {
    await withTempDb((db) => {
      expect(db.getActiveTheme()?.slug).toBe("ocean");
    });
  });

  it("preserves glass and minimal ui styles", async () => {
    await withTempDb((db) => {
      expect(db.getThemeBySlug("misty-glass")?.uiStyle).toBe("glass");
      expect(db.getThemeBySlug("pure-minimal")?.uiStyle).toBe("minimal");
    });
  });

  it("falls back unknown ui styles to wechat", async () => {
    await withTempDb((db) => {
      const database = db.getDb();
      database.prepare("UPDATE themes SET ui_style = 'unknown-style' WHERE slug = 'ocean'").run();

      expect(db.getThemeBySlug("ocean")?.uiStyle).toBe("wechat");
    });
  });

  it("preserves an existing single active theme during maintenance", async () => {
    await withTempDb((db) => {
      const wechat = db.getThemeBySlug("wechat");
      expect(wechat).toBeDefined();

      db.activateTheme(wechat!.id);
      db.ensureDefaultTheme();

      expect(db.getActiveTheme()?.slug).toBe("wechat");
    });
  });
});

describe("theme color validation", () => {
  it("allows strict colors and rejects css injection", () => {
    expect(colorSchema.safeParse("#ffffff").success).toBe(true);
    expect(colorSchema.safeParse("rgb(255, 0, 12)").success).toBe(true);
    expect(colorSchema.safeParse("rgba(255, 0, 12, 0.5)").success).toBe(true);
    expect(colorSchema.safeParse("rgba(255, 0, 12, 2)").success).toBe(false);
    expect(colorSchema.safeParse("red;}</style><script>alert(1)</script>").success).toBe(false);
  });
});

describe("oidc endpoint validation", () => {
  it("requires https in production", () => {
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    expect(isAllowedOidcEndpoint("https://issuer.example.com/token")).toBe(true);
    expect(isAllowedOidcEndpoint("http://issuer.example.com/token")).toBe(false);
    process.env.NODE_ENV = previous;
  });
});

describe("token hashing", () => {
  it("does not store raw session tokens", () => {
    const token = createToken();
    const hashed = hashToken(token);
    expect(hashed).not.toBe(token);
    expect(hashed).toHaveLength(64);
    expect(hashToken(token)).toBe(hashed);
  });
});

describe("csrf tokens", () => {
  it("accepts signed tokens and rejects tampering", () => {
    const token = getCsrfToken();
    const formData = new FormData();
    formData.set(csrfFieldName, token);

    expect(verifyCsrfToken(formData)).toBe(true);

    const tampered = new FormData();
    tampered.set(csrfFieldName, token.replace(/\.[^.]+$/, ".bad"));

    expect(verifyCsrfToken(tampered)).toBe(false);
  });
});
