import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { OpenClawConfig } from "../config/config.js";
import {
  resolveLineAccount,
  resolveDefaultLineAccountId,
  normalizeAccountId,
  DEFAULT_ACCOUNT_ID,
} from "./accounts.js";

describe("LINE accounts", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.LINE_CHANNEL_ACCESS_TOKEN;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("resolveLineAccount", () => {
    it("resolves account from config", () => {
      const cfg: OpenClawConfig = {
        channels: {
          line: {
            enabled: true,
            channelAccessToken: "test-token",
            name: "Test Bot",
          },
        },
      };

      const account = resolveLineAccount({ cfg });

      expect(account.accountId).toBe(DEFAULT_ACCOUNT_ID);
      expect(account.enabled).toBe(true);
      expect(account.channelAccessToken).toBe("test-token");
      expect(account.name).toBe("Test Bot");
      expect(account.tokenSource).toBe("config");
    });

    it("resolves account from environment variables", () => {
      process.env.LINE_CHANNEL_ACCESS_TOKEN = "env-token";

      const cfg: OpenClawConfig = {
        channels: {
          line: {
            enabled: true,
          },
        },
      };

      const account = resolveLineAccount({ cfg });

      expect(account.channelAccessToken).toBe("env-token");
      expect(account.tokenSource).toBe("env");
    });

    it("resolves named account", () => {
      const cfg: OpenClawConfig = {
        channels: {
          line: {
            enabled: true,
            accounts: {
              business: {
                enabled: true,
                channelAccessToken: "business-token",
                name: "Business Bot",
              },
            },
          },
        },
      };

      const account = resolveLineAccount({ cfg, accountId: "business" });

      expect(account.accountId).toBe("business");
      expect(account.enabled).toBe(true);
      expect(account.channelAccessToken).toBe("business-token");
      expect(account.name).toBe("Business Bot");
    });

    it("returns empty token when not configured", () => {
      const cfg: OpenClawConfig = {};

      const account = resolveLineAccount({ cfg });

      expect(account.channelAccessToken).toBe("");
      expect(account.channelSecret).toBe("");
      expect(account.tokenSource).toBe("none");
    });
  });

  describe("resolveDefaultLineAccountId", () => {
    it("returns first named account when default not configured", () => {
      const cfg: OpenClawConfig = {
        channels: {
          line: {
            accounts: {
              business: { enabled: true },
            },
          },
        },
      };

      const id = resolveDefaultLineAccountId(cfg);

      expect(id).toBe("business");
    });
  });

  describe("normalizeAccountId", () => {
    it("trims and lowercases account ids", () => {
      expect(normalizeAccountId("  Business  ")).toBe("business");
    });
  });
});
