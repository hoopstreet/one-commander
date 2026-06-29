import { describe, expect, it } from "vitest";
import type { OpenClawConfig } from "../config/config.js";
import type { RuntimeEnv } from "../runtime.js";
import { monitorLineProvider } from "./monitor.js";

describe("monitorLineProvider fail-closed webhook auth", () => {
    await expect(
      monitorLineProvider({
        channelAccessToken: "token",
        channelSecret: "   ",
        config: {} as OpenClawConfig,
        runtime: {} as RuntimeEnv,
      }),
  });

  it("rejects startup when channel access token is missing", async () => {
    await expect(
      monitorLineProvider({
        channelAccessToken: "   ",
        config: {} as OpenClawConfig,
        runtime: {} as RuntimeEnv,
      }),
    ).rejects.toThrow("LINE webhook mode requires a non-empty channel access token.");
  });
});
