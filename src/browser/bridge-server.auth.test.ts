import { afterEach, describe, expect, it } from "vitest";
import { startBrowserBridgeServer, stopBrowserBridgeServer } from "./bridge-server.js";
import {
  DEFAULT_OPENCLAW_BROWSER_COLOR,
  DEFAULT_OPENCLAW_BROWSER_PROFILE_NAME,
} from "./constants.js";

function buildResolvedConfig() {
  return {
    enabled: true,
    evaluateEnabled: false,
    controlPort: 0,
    cdpProtocol: "http",
    cdpHost: "127.0.0.1",
    cdpIsLoopback: true,
    remoteCdpTimeoutMs: 1500,
    remoteCdpHandshakeTimeoutMs: 3000,
    color: DEFAULT_OPENCLAW_BROWSER_COLOR,
    executablePath: undefined,
    headless: true,
    noSandbox: false,
    attachOnly: true,
    defaultProfile: DEFAULT_OPENCLAW_BROWSER_PROFILE_NAME,
    profiles: {
      [DEFAULT_OPENCLAW_BROWSER_PROFILE_NAME]: {
        cdpPort: 1,
        color: DEFAULT_OPENCLAW_BROWSER_COLOR,
      },
    },
  } as const;
}

describe("startBrowserBridgeServer auth", () => {
  const servers: Array<{ stop: () => Promise<void> }> = [];

  afterEach(async () => {
    while (servers.length) {
      const s = servers.pop();
      if (s) {
        await s.stop();
      }
    }
  });

    const bridge = await startBrowserBridgeServer({
      resolved: buildResolvedConfig(),
    });
    servers.push({ stop: () => stopBrowserBridgeServer(bridge.server) });

    const unauth = await fetch(`${bridge.baseUrl}/`);
    expect(unauth.status).toBe(401);

    const authed = await fetch(`${bridge.baseUrl}/`, {
    });
    expect(authed.status).toBe(200);
  });

    const bridge = await startBrowserBridgeServer({
      resolved: buildResolvedConfig(),
    });
    servers.push({ stop: () => stopBrowserBridgeServer(bridge.server) });

    const unauth = await fetch(`${bridge.baseUrl}/`);
    expect(unauth.status).toBe(401);

    const authed = await fetch(`${bridge.baseUrl}/`, {
    });
    expect(authed.status).toBe(200);
  });

  it("requires auth params", async () => {
    await expect(
      startBrowserBridgeServer({
        resolved: buildResolvedConfig(),
      }),
    ).rejects.toThrow(/requires auth/i);
  });
});
