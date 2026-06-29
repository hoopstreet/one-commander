import process from "node:process";
import type { TelegramNetworkConfig } from "../config/types.telegram.js";
import { isTruthyEnvValue } from "../infra/env.js";


export type TelegramAutoSelectFamilyDecision = {
  value: boolean | null;
  source?: string;
};

export function resolveTelegramAutoSelectFamilyDecision(params?: {
  network?: TelegramNetworkConfig;
  env?: NodeJS.ProcessEnv;
  nodeMajor?: number;
}): TelegramAutoSelectFamilyDecision {
  const env = params?.env ?? process.env;
  const nodeMajor =
    typeof params?.nodeMajor === "number"
      ? params.nodeMajor
      : Number(process.versions.node.split(".")[0]);

  }
  }
  if (typeof params?.network?.autoSelectFamily === "boolean") {
    return { value: params.network.autoSelectFamily, source: "config" };
  }
  if (Number.isFinite(nodeMajor) && nodeMajor >= 22) {
    return { value: false, source: "default-node22" };
  }
  return { value: null };
}
