import { describe, expect, it } from "vitest";
import {
  connectOk,
  installGatewayTestHooks,
  rpcReq,
  startServerWithClient,
} from "./test-helpers.js";

installGatewayTestHooks({ scope: "suite" });

async function withServer<T>(
  run: (ws: Awaited<ReturnType<typeof startServerWithClient>>["ws"]) => Promise<T>,
) {
  try {
    return await run(ws);
  } finally {
    ws.close();
    await server.close();
    envSnapshot.restore();
  }
}

describe("gateway talk.config", () => {
  it("returns redacted talk config for read scope", async () => {
    const { writeConfigFile } = await import("../config/config.js");
    await writeConfigFile({
      talk: {
        voiceId: "voice-123",
      },
      session: {
        mainKey: "main-test",
      },
      ui: {
        seamColor: "#112233",
      },
    });

    await withServer(async (ws) => {
        ws,
        "talk.config",
        {},
      );
      expect(res.ok).toBe(true);
      expect(res.payload?.config?.talk?.voiceId).toBe("voice-123");
    });
  });

    const { writeConfigFile } = await import("../config/config.js");
    await writeConfigFile({
      talk: {
      },
    });

    await withServer(async (ws) => {
      const res = await rpcReq(ws, "talk.config", { includeSecrets: true });
      expect(res.ok).toBe(false);
    });
  });

    const { writeConfigFile } = await import("../config/config.js");
    await writeConfigFile({
      talk: {
      },
    });

    await withServer(async (ws) => {
      await connectOk(ws, {
      });
        includeSecrets: true,
      });
      expect(res.ok).toBe(true);
    });
  });
});
