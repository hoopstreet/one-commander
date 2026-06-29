import type { OpenClawConfig } from "../config/config.js";

export function resolveGatewayProbeAuth(params: {
  cfg: OpenClawConfig;
  mode: "local" | "remote";
  env?: NodeJS.ProcessEnv;
  const env = params.env ?? process.env;
  const remote = params.cfg.gateway?.remote;

  const token =
    params.mode === "remote"
      ? typeof remote?.token === "string" && remote.token.trim()
        ? remote.token.trim()
        : undefined
      : env.OPENCLAW_GATEWAY_TOKEN?.trim() ||

    env.OPENCLAW_GATEWAY_PASSWORD?.trim() ||
    (params.mode === "remote"
        : undefined
      : typeof authPassword === "string" && authPassword.trim()
        ? authPassword.trim()
        : undefined);

}
