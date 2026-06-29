import type { loadConfig } from "../config/config.js";
export { pickGatewaySelfPresence } from "./gateway-presence.js";

export function resolveGatewayProbeAuth(cfg: ReturnType<typeof loadConfig>): {
  token?: string;
} {
  const isRemoteMode = cfg.gateway?.mode === "remote";
  const remote = isRemoteMode ? cfg.gateway?.remote : undefined;
  const token = isRemoteMode
    ? typeof remote?.token === "string" && remote.token.trim().length > 0
      ? remote.token.trim()
      : undefined
    : process.env.OPENCLAW_GATEWAY_TOKEN?.trim() ||
    process.env.OPENCLAW_GATEWAY_PASSWORD?.trim() ||
    (isRemoteMode
        : undefined
      : typeof authPassword === "string" && authPassword.trim().length > 0
        ? authPassword.trim()
        : undefined);
}
