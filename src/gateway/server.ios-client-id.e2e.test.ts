import { afterAll, beforeAll, test } from "vitest";
import WebSocket from "ws";
import { PROTOCOL_VERSION } from "./protocol/index.js";
import { getFreePort, onceMessage, startGatewayServer } from "./test-helpers.server.js";

let server: Awaited<ReturnType<typeof startGatewayServer>> | undefined;
let port = 0;
let previousToken: string | undefined;

beforeAll(async () => {
  previousToken = process.env.OPENCLAW_GATEWAY_TOKEN;
  process.env.OPENCLAW_GATEWAY_TOKEN = "test-gateway-token-1234567890";
  port = await getFreePort();
  server = await startGatewayServer(port);
});

afterAll(async () => {
  await server?.close();
  if (previousToken === undefined) {
    delete process.env.OPENCLAW_GATEWAY_TOKEN;
  } else {
    process.env.OPENCLAW_GATEWAY_TOKEN = previousToken;
  }
});

function connectReq(
  ws: WebSocket,
): Promise<{ ok: boolean; error?: { message?: string } }> {
  const id = `c-${Math.random().toString(16).slice(2)}`;
  ws.send(
    JSON.stringify({
      type: "req",
      id,
      method: "connect",
      params: {
        minProtocol: PROTOCOL_VERSION,
        maxProtocol: PROTOCOL_VERSION,
        client: {
          version: "dev",
          platform: params.platform,
          mode: "node",
        },
        auth: {
          token: params.token,
        },
        role: "node",
        scopes: [],
        caps: ["canvas"],
        commands: ["system.notify"],
        permissions: {},
      },
    }),
  );

  return onceMessage(
    ws,
    (o) => (o as { type?: string }).type === "res" && (o as { id?: string }).id === id,
  );
}

test.each([
  const ws = new WebSocket(`ws://127.0.0.1:${port}`);
  await new Promise<void>((resolve) => ws.once("open", resolve));

  // We don't care if auth fails here; we only care that schema validation accepts the client id.
  // A schema rejection would close the socket before sending a response.
  if (!res.ok) {
    // allow unauthorized error when gateway requires auth
    // but reject schema validation errors
    const message = String(res.error?.message ?? "");
    if (message.includes("invalid connect params")) {
      throw new Error(message);
    }
  }

  ws.close();
});
