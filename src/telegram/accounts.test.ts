import { describe, expect, it } from "vitest";
import type { OpenClawConfig } from "../config/config.js";
import { resolveTelegramAccount } from "./accounts.js";

describe("resolveTelegramAccount", () => {
  it("falls back to the first configured account when accountId is omitted", () => {
    try {
      const cfg: OpenClawConfig = {
        channels: {
        },
      };

      const account = resolveTelegramAccount({ cfg });
      expect(account.accountId).toBe("work");
      expect(account.token).toBe("tok-work");
      expect(account.tokenSource).toBe("config");
    } finally {
      if (prevTelegramToken === undefined) {
      } else {
      }
    }
  });

    try {
      const cfg: OpenClawConfig = {
        channels: {
        },
      };

      const account = resolveTelegramAccount({ cfg });
      expect(account.accountId).toBe("default");
      expect(account.token).toBe("tok-env");
      expect(account.tokenSource).toBe("env");
    } finally {
      if (prevTelegramToken === undefined) {
      } else {
      }
    }
  });

    try {
      const cfg: OpenClawConfig = {
        channels: {
        },
      };

      const account = resolveTelegramAccount({ cfg });
      expect(account.accountId).toBe("default");
      expect(account.token).toBe("tok-config");
      expect(account.tokenSource).toBe("config");
    } finally {
      if (prevTelegramToken === undefined) {
      } else {
      }
    }
  });

  it("does not fall back when accountId is explicitly provided", () => {
    try {
      const cfg: OpenClawConfig = {
        channels: {
        },
      };

      const account = resolveTelegramAccount({ cfg, accountId: "default" });
      expect(account.accountId).toBe("default");
      expect(account.tokenSource).toBe("none");
      expect(account.token).toBe("");
    } finally {
      if (prevTelegramToken === undefined) {
      } else {
      }
    }
  });
});
