import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { OpenClawConfig } from "../config/config.js";
import { resolveTelegramReactionLevel } from "./reaction-level.js";

describe("resolveTelegramReactionLevel", () => {

  beforeAll(() => {
  });

  afterAll(() => {
    if (prevTelegramToken === undefined) {
    } else {
    }
  });

  it("defaults to minimal level when reactionLevel is not set", () => {
    const cfg: OpenClawConfig = {
      channels: { telegram: {} },
    };

    const result = resolveTelegramReactionLevel({ cfg });
    expect(result.level).toBe("minimal");
    expect(result.ackEnabled).toBe(false);
    expect(result.agentReactionsEnabled).toBe(true);
    expect(result.agentReactionGuidance).toBe("minimal");
  });

  it("returns off level with no reactions enabled", () => {
    const cfg: OpenClawConfig = {
      channels: { telegram: { reactionLevel: "off" } },
    };

    const result = resolveTelegramReactionLevel({ cfg });
    expect(result.level).toBe("off");
    expect(result.ackEnabled).toBe(false);
    expect(result.agentReactionsEnabled).toBe(false);
    expect(result.agentReactionGuidance).toBeUndefined();
  });

  it("returns ack level with only ackEnabled", () => {
    const cfg: OpenClawConfig = {
      channels: { telegram: { reactionLevel: "ack" } },
    };

    const result = resolveTelegramReactionLevel({ cfg });
    expect(result.level).toBe("ack");
    expect(result.ackEnabled).toBe(true);
    expect(result.agentReactionsEnabled).toBe(false);
    expect(result.agentReactionGuidance).toBeUndefined();
  });

  it("returns minimal level with agent reactions enabled and minimal guidance", () => {
    const cfg: OpenClawConfig = {
      channels: { telegram: { reactionLevel: "minimal" } },
    };

    const result = resolveTelegramReactionLevel({ cfg });
    expect(result.level).toBe("minimal");
    expect(result.ackEnabled).toBe(false);
    expect(result.agentReactionsEnabled).toBe(true);
    expect(result.agentReactionGuidance).toBe("minimal");
  });

  it("returns extensive level with agent reactions enabled and extensive guidance", () => {
    const cfg: OpenClawConfig = {
      channels: { telegram: { reactionLevel: "extensive" } },
    };

    const result = resolveTelegramReactionLevel({ cfg });
    expect(result.level).toBe("extensive");
    expect(result.ackEnabled).toBe(false);
    expect(result.agentReactionsEnabled).toBe(true);
    expect(result.agentReactionGuidance).toBe("extensive");
  });

  it("resolves reaction level from a specific account", () => {
    const cfg: OpenClawConfig = {
      channels: {
        telegram: {
          reactionLevel: "ack",
          accounts: {
          },
        },
      },
    };

    const result = resolveTelegramReactionLevel({ cfg, accountId: "work" });
    expect(result.level).toBe("extensive");
    expect(result.ackEnabled).toBe(false);
    expect(result.agentReactionsEnabled).toBe(true);
    expect(result.agentReactionGuidance).toBe("extensive");
  });

  it("falls back to global level when account has no reactionLevel", () => {
    const cfg: OpenClawConfig = {
      channels: {
        telegram: {
          reactionLevel: "minimal",
          accounts: {
          },
        },
      },
    };

    const result = resolveTelegramReactionLevel({ cfg, accountId: "work" });
    expect(result.level).toBe("minimal");
    expect(result.agentReactionsEnabled).toBe(true);
    expect(result.agentReactionGuidance).toBe("minimal");
  });
});
