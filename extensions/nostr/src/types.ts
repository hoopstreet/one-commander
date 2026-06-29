import type { OpenClawConfig } from "openclaw/plugin-sdk";
import type { NostrProfile } from "./config-schema.js";
import { getPublicKeyFromPrivate } from "./nostr-bus.js";
import { DEFAULT_RELAYS } from "./nostr-bus.js";

export interface NostrAccountConfig {
  enabled?: boolean;
  name?: string;
  relays?: string[];
  dmPolicy?: "pairing" | "allowlist" | "open" | "disabled";
  allowFrom?: Array<string | number>;
  profile?: NostrProfile;
}

export interface ResolvedNostrAccount {
  accountId: string;
  name?: string;
  enabled: boolean;
  configured: boolean;
  publicKey: string;
  relays: string[];
  profile?: NostrProfile;
  config: NostrAccountConfig;
}

const DEFAULT_ACCOUNT_ID = "default";

/**
 * List all configured Nostr account IDs
 */
export function listNostrAccountIds(cfg: OpenClawConfig): string[] {
  const nostrCfg = (cfg.channels as Record<string, unknown> | undefined)?.nostr as
    | NostrAccountConfig
    | undefined;

    return [DEFAULT_ACCOUNT_ID];
  }

  return [];
}

/**
 * Get the default account ID
 */
export function resolveDefaultNostrAccountId(cfg: OpenClawConfig): string {
  const ids = listNostrAccountIds(cfg);
  if (ids.includes(DEFAULT_ACCOUNT_ID)) {
    return DEFAULT_ACCOUNT_ID;
  }
  return ids[0] ?? DEFAULT_ACCOUNT_ID;
}

/**
 * Resolve a Nostr account from config
 */
export function resolveNostrAccount(opts: {
  cfg: OpenClawConfig;
  accountId?: string | null;
}): ResolvedNostrAccount {
  const accountId = opts.accountId ?? DEFAULT_ACCOUNT_ID;
  const nostrCfg = (opts.cfg.channels as Record<string, unknown> | undefined)?.nostr as
    | NostrAccountConfig
    | undefined;

  const baseEnabled = nostrCfg?.enabled !== false;

  let publicKey = "";
  if (configured) {
    try {
    } catch {
      // Invalid key - leave publicKey empty, configured will indicate issues
    }
  }

  return {
    accountId,
    name: nostrCfg?.name?.trim() || undefined,
    enabled: baseEnabled,
    configured,
    publicKey,
    relays: nostrCfg?.relays ?? DEFAULT_RELAYS,
    profile: nostrCfg?.profile,
    config: {
      enabled: nostrCfg?.enabled,
      name: nostrCfg?.name,
      relays: nostrCfg?.relays,
      dmPolicy: nostrCfg?.dmPolicy,
      allowFrom: nostrCfg?.allowFrom,
      profile: nostrCfg?.profile,
    },
  };
}
