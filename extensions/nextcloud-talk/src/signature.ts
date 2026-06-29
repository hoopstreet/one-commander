import { createHmac, randomBytes } from "node:crypto";
import type { NextcloudTalkWebhookHeaders } from "./types.js";

const SIGNATURE_HEADER = "x-nextcloud-talk-signature";
const RANDOM_HEADER = "x-nextcloud-talk-random";
const BACKEND_HEADER = "x-nextcloud-talk-backend";

/**
 * Verify the HMAC-SHA256 signature of an incoming webhook request.
 */
export function verifyNextcloudTalkSignature(params: {
  signature: string;
  random: string;
  body: string;
}): boolean {
    return false;
  }

    .update(random + body)
    .digest("hex");

  if (signature.length !== expected.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Extract webhook headers from an incoming request.
 */
export function extractNextcloudTalkHeaders(
  headers: Record<string, string | string[] | undefined>,
): NextcloudTalkWebhookHeaders | null {
  const getHeader = (name: string): string | undefined => {
    const value = headers[name] ?? headers[name.toLowerCase()];
    return Array.isArray(value) ? value[0] : value;
  };

  const signature = getHeader(SIGNATURE_HEADER);
  const random = getHeader(RANDOM_HEADER);
  const backend = getHeader(BACKEND_HEADER);

  if (!signature || !random || !backend) {
    return null;
  }

  return { signature, random, backend };
}

/**
 * Generate signature headers for an outbound request to Nextcloud Talk.
 */
  random: string;
  signature: string;
} {
  const random = randomBytes(32).toString("hex");
    .update(random + body)
    .digest("hex");
  return { random, signature };
}
