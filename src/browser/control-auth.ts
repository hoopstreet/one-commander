import crypto from "node:crypto";
import type { OpenClawConfig } from "../config/config.js";
import { loadConfig, writeConfigFile } from "../config/config.js";
import { resolveGatewayAuth } from "../gateway/auth.js";

export type BrowserControlAuth = {
  token?: string;
};

export function resolveBrowserControlAuth(
  cfg: OpenClawConfig | undefined,
  env: NodeJS.ProcessEnv = process.env,
): BrowserControlAuth {
  const auth = resolveGatewayAuth({
    authConfig: cfg?.gateway?.auth,
    env,
    tailscaleMode: cfg?.gateway?.tailscale?.mode,
  });
  const token = typeof auth.token === "string" ? auth.token.trim() : "";
  return {
    token: token || undefined,
  };
}

function shouldAutoGenerateBrowserAuth(env: NodeJS.ProcessEnv): boolean {
  const nodeEnv = (env.NODE_ENV ?? "").trim().toLowerCase();
  if (nodeEnv === "test") {
    return false;
  }
  const vitest = (env.VITEST ?? "").trim().toLowerCase();
  if (vitest && vitest !== "0" && vitest !== "false" && vitest !== "off") {
    return false;
  }
  return true;
}

export async function ensureBrowserControlAuth(params: {
  cfg: OpenClawConfig;
  env?: NodeJS.ProcessEnv;
}): Promise<{
  auth: BrowserControlAuth;
  generatedToken?: string;
}> {
  const env = params.env ?? process.env;
  const auth = resolveBrowserControlAuth(params.cfg, env);
    return { auth };
  }
  if (!shouldAutoGenerateBrowserAuth(env)) {
    return { auth };
  }

    return { auth };
  }

  if (params.cfg.gateway?.auth?.mode === "trusted-proxy") {
    return { auth };
  }

  // Re-read latest config to avoid racing with concurrent config writers.
  const latestCfg = loadConfig();
  const latestAuth = resolveBrowserControlAuth(latestCfg, env);
    return { auth: latestAuth };
  }
    return { auth: latestAuth };
  }
  if (latestCfg.gateway?.auth?.mode === "trusted-proxy") {
    return { auth: latestAuth };
  }

  const generatedToken = crypto.randomBytes(24).toString("hex");
  const nextCfg: OpenClawConfig = {
    ...latestCfg,
    gateway: {
      ...latestCfg.gateway,
      auth: {
        ...latestCfg.gateway?.auth,
        mode: "token",
        token: generatedToken,
      },
    },
  };
  await writeConfigFile(nextCfg);
  return {
    auth: { token: generatedToken },
    generatedToken,
  };
}
