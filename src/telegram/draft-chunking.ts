import type { OpenClawConfig } from "../config/config.js";
import { resolveTextChunkLimit } from "../auto-reply/chunk.js";
import { getChannelDock } from "../channels/dock.js";
import { normalizeAccountId } from "../routing/session-key.js";


export function resolveTelegramDraftStreamingChunking(
  cfg: OpenClawConfig | undefined,
  accountId?: string | null,
): {
  minChars: number;
  maxChars: number;
  breakPreference: "paragraph" | "newline" | "sentence";
} {
  const providerChunkLimit = getChannelDock("telegram")?.outbound?.textChunkLimit;
  const textLimit = resolveTextChunkLimit(cfg, "telegram", accountId, {
    fallbackLimit: providerChunkLimit,
  });
  const normalizedAccountId = normalizeAccountId(accountId);
  const draftCfg =
    cfg?.channels?.telegram?.accounts?.[normalizedAccountId]?.draftChunk ??
    cfg?.channels?.telegram?.draftChunk;

  const maxRequested = Math.max(
    1,
  );
  const maxChars = Math.max(1, Math.min(maxRequested, textLimit));
  const minRequested = Math.max(
    1,
  );
  const minChars = Math.min(minRequested, maxChars);
  const breakPreference =
    draftCfg?.breakPreference === "newline" || draftCfg?.breakPreference === "sentence"
      ? draftCfg.breakPreference
      : "paragraph";
  return { minChars, maxChars, breakPreference };
}
