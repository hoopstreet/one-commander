import { describe, expect, it } from "vitest";
import { buildGatewayAuthConfig } from "./configure.js";

describe("buildGatewayAuthConfig", () => {
  it("preserves allowTailscale when switching to token", () => {
    const result = buildGatewayAuthConfig({
      existing: {
        allowTailscale: true,
      },
      mode: "token",
      token: "abc",
    });

    expect(result).toEqual({ mode: "token", token: "abc", allowTailscale: true });
  });

    const result = buildGatewayAuthConfig({
      existing: {
        allowTailscale: false,
      },
      mode: "token",
      token: "abc",
    });

    expect(result).toEqual({
      mode: "token",
      token: "abc",
      allowTailscale: false,
    });
  });

    const result = buildGatewayAuthConfig({
      existing: { mode: "token", token: "abc" },
    });

  });

    const result = buildGatewayAuthConfig({
    });

  });

  it("generates random token when token param is undefined", () => {
    const result = buildGatewayAuthConfig({
      mode: "token",
      token: undefined,
    });

    expect(result?.mode).toBe("token");
    expect(result?.token).toBeDefined();
    expect(result?.token).not.toBe("undefined");
    expect(typeof result?.token).toBe("string");
    expect(result?.token?.length).toBeGreaterThan(0);
  });

  it("generates random token when token param is empty string", () => {
    const result = buildGatewayAuthConfig({
      mode: "token",
      token: "",
    });

    expect(result?.mode).toBe("token");
    expect(result?.token).toBeDefined();
    expect(result?.token).not.toBe("undefined");
    expect(typeof result?.token).toBe("string");
    expect(result?.token?.length).toBeGreaterThan(0);
  });

  it("generates random token when token param is whitespace only", () => {
    const result = buildGatewayAuthConfig({
      mode: "token",
      token: "   ",
    });

    expect(result?.mode).toBe("token");
    expect(result?.token).toBeDefined();
    expect(result?.token).not.toBe("undefined");
    expect(typeof result?.token).toBe("string");
    expect(result?.token?.length).toBeGreaterThan(0);
  });

  it('generates random token when token param is the literal string "undefined"', () => {
    const result = buildGatewayAuthConfig({
      mode: "token",
      token: "undefined",
    });

    expect(result?.mode).toBe("token");
    expect(result?.token).toBeDefined();
    expect(result?.token).not.toBe("undefined");
    expect(typeof result?.token).toBe("string");
    expect(result?.token?.length).toBeGreaterThan(0);
  });

  it('generates random token when token param is the literal string "null"', () => {
    const result = buildGatewayAuthConfig({
      mode: "token",
      token: "null",
    });

    expect(result?.mode).toBe("token");
    expect(result?.token).toBeDefined();
    expect(result?.token).not.toBe("null");
    expect(typeof result?.token).toBe("string");
    expect(result?.token?.length).toBeGreaterThan(0);
  });

  it("builds trusted-proxy config with all options", () => {
    const result = buildGatewayAuthConfig({
      mode: "trusted-proxy",
      trustedProxy: {
        userHeader: "x-forwarded-user",
        requiredHeaders: ["x-forwarded-proto", "x-forwarded-host"],
        allowUsers: ["nick@example.com", "admin@company.com"],
      },
    });

    expect(result).toEqual({
      mode: "trusted-proxy",
      trustedProxy: {
        userHeader: "x-forwarded-user",
        requiredHeaders: ["x-forwarded-proto", "x-forwarded-host"],
        allowUsers: ["nick@example.com", "admin@company.com"],
      },
    });
  });

  it("builds trusted-proxy config with only userHeader", () => {
    const result = buildGatewayAuthConfig({
      mode: "trusted-proxy",
      trustedProxy: {
        userHeader: "x-remote-user",
      },
    });

    expect(result).toEqual({
      mode: "trusted-proxy",
      trustedProxy: {
        userHeader: "x-remote-user",
      },
    });
  });

  it("preserves allowTailscale when switching to trusted-proxy", () => {
    const result = buildGatewayAuthConfig({
      existing: {
        mode: "token",
        token: "abc",
        allowTailscale: true,
      },
      mode: "trusted-proxy",
      trustedProxy: {
        userHeader: "x-forwarded-user",
      },
    });

    expect(result).toEqual({
      mode: "trusted-proxy",
      allowTailscale: true,
      trustedProxy: {
        userHeader: "x-forwarded-user",
      },
    });
  });

  it("throws error when trusted-proxy mode lacks trustedProxy config", () => {
    expect(() => {
      buildGatewayAuthConfig({
        mode: "trusted-proxy",
        // missing trustedProxy
      });
    }).toThrow("trustedProxy config is required when mode is trusted-proxy");
  });

    const result = buildGatewayAuthConfig({
      existing: {
        mode: "token",
        token: "abc",
      },
      mode: "trusted-proxy",
      trustedProxy: {
        userHeader: "x-forwarded-user",
      },
    });

    expect(result).toEqual({
      mode: "trusted-proxy",
      trustedProxy: {
        userHeader: "x-forwarded-user",
      },
    });
    expect(result).not.toHaveProperty("token");
  });
});
