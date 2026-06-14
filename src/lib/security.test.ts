import { describe, expect, it } from "vitest";
import { createToken, hashToken } from "./crypto";
import { isAllowedOidcEndpoint } from "./oidc";
import { classifyUrl } from "./url-security";
import { colorSchema } from "./validation";

describe("url security", () => {
  it("classifies public and private targets", () => {
    expect(classifyUrl("https://example.com").ok).toBe(true);
    expect(classifyUrl("http://127.0.0.1:3000").isPrivate).toBe(true);
    expect(classifyUrl("http://192.168.1.10").isPrivate).toBe(true);
    expect(classifyUrl("http://service.local").isPrivate).toBe(true);
    expect(classifyUrl("ftp://example.com").ok).toBe(false);
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
