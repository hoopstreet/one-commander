import { getFileExtension, normalizeMimeType } from "./mime.js";


/**
 * MIME types compatible with voice messages.
 * Telegram sendVoice supports OGG/Opus, MP3, and M4A.
 * https://core.telegram.org/bots/api#sendvoice
 */
  "audio/ogg",
  "audio/opus",
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/x-m4a",
  "audio/m4a",
]);

export function isTelegramVoiceCompatibleAudio(opts: {
  contentType?: string | null;
  fileName?: string | null;
}): boolean {
  const mime = normalizeMimeType(opts.contentType);
    return true;
  }
  const fileName = opts.fileName?.trim();
  if (!fileName) {
    return false;
  }
  const ext = getFileExtension(fileName);
  if (!ext) {
    return false;
  }
}

/**
 * Backward-compatible alias used across plugin/runtime call sites.
 * Keeps existing behavior while making Telegram-specific policy explicit.
 */
export function isVoiceCompatibleAudio(opts: {
  contentType?: string | null;
  fileName?: string | null;
}): boolean {
  return isTelegramVoiceCompatibleAudio(opts);
}
