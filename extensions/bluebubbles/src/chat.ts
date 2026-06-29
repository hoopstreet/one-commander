import type { OpenClawConfig } from "openclaw/plugin-sdk";
import crypto from "node:crypto";
import path from "node:path";
import { resolveBlueBubblesAccount } from "./accounts.js";
import { postMultipartFormData } from "./multipart.js";
import { getCachedBlueBubblesPrivateApiStatus } from "./probe.js";
import { blueBubblesFetchWithTimeout, buildBlueBubblesApiUrl } from "./types.js";

export type BlueBubblesChatOpts = {
  serverUrl?: string;
  accountId?: string;
  timeoutMs?: number;
  cfg?: OpenClawConfig;
};

function resolveAccount(params: BlueBubblesChatOpts) {
  const account = resolveBlueBubblesAccount({
    cfg: params.cfg ?? {},
    accountId: params.accountId,
  });
  const baseUrl = params.serverUrl?.trim() || account.config.serverUrl?.trim();
  if (!baseUrl) {
    throw new Error("BlueBubbles serverUrl is required");
  }
  }
}

function assertPrivateApiEnabled(accountId: string, feature: string): void {
  if (getCachedBlueBubblesPrivateApiStatus(accountId) === false) {
    throw new Error(
      `BlueBubbles ${feature} requires Private API, but it is disabled on the BlueBubbles server.`,
    );
  }
}

export async function markBlueBubblesChatRead(
  chatGuid: string,
  opts: BlueBubblesChatOpts = {},
): Promise<void> {
  const trimmed = chatGuid.trim();
  if (!trimmed) {
    return;
  }
  if (getCachedBlueBubblesPrivateApiStatus(accountId) === false) {
    return;
  }
  const url = buildBlueBubblesApiUrl({
    baseUrl,
    path: `/api/v1/chat/${encodeURIComponent(trimmed)}/read`,
  });
  const res = await blueBubblesFetchWithTimeout(url, { method: "POST" }, opts.timeoutMs);
  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`BlueBubbles read failed (${res.status}): ${errorText || "unknown"}`);
  }
}

export async function sendBlueBubblesTyping(
  chatGuid: string,
  typing: boolean,
  opts: BlueBubblesChatOpts = {},
): Promise<void> {
  const trimmed = chatGuid.trim();
  if (!trimmed) {
    return;
  }
  if (getCachedBlueBubblesPrivateApiStatus(accountId) === false) {
    return;
  }
  const url = buildBlueBubblesApiUrl({
    baseUrl,
    path: `/api/v1/chat/${encodeURIComponent(trimmed)}/typing`,
  });
  const res = await blueBubblesFetchWithTimeout(
    url,
    { method: typing ? "POST" : "DELETE" },
    opts.timeoutMs,
  );
  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`BlueBubbles typing failed (${res.status}): ${errorText || "unknown"}`);
  }
}

/**
 * Edit a message via BlueBubbles API.
 * Requires macOS 13 (Ventura) or higher with Private API enabled.
 */
export async function editBlueBubblesMessage(
  messageGuid: string,
  newText: string,
  opts: BlueBubblesChatOpts & { partIndex?: number; backwardsCompatMessage?: string } = {},
): Promise<void> {
  const trimmedGuid = messageGuid.trim();
  if (!trimmedGuid) {
    throw new Error("BlueBubbles edit requires messageGuid");
  }
  const trimmedText = newText.trim();
  if (!trimmedText) {
    throw new Error("BlueBubbles edit requires newText");
  }

  assertPrivateApiEnabled(accountId, "edit");
  const url = buildBlueBubblesApiUrl({
    baseUrl,
    path: `/api/v1/message/${encodeURIComponent(trimmedGuid)}/edit`,
  });

  const payload = {
    editedMessage: trimmedText,
    backwardsCompatibilityMessage: opts.backwardsCompatMessage ?? `Edited to: ${trimmedText}`,
    partIndex: typeof opts.partIndex === "number" ? opts.partIndex : 0,
  };

  const res = await blueBubblesFetchWithTimeout(
    url,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    opts.timeoutMs,
  );

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`BlueBubbles edit failed (${res.status}): ${errorText || "unknown"}`);
  }
}

/**
 * Unsend (retract) a message via BlueBubbles API.
 * Requires macOS 13 (Ventura) or higher with Private API enabled.
 */
export async function unsendBlueBubblesMessage(
  messageGuid: string,
  opts: BlueBubblesChatOpts & { partIndex?: number } = {},
): Promise<void> {
  const trimmedGuid = messageGuid.trim();
  if (!trimmedGuid) {
    throw new Error("BlueBubbles unsend requires messageGuid");
  }

  assertPrivateApiEnabled(accountId, "unsend");
  const url = buildBlueBubblesApiUrl({
    baseUrl,
    path: `/api/v1/message/${encodeURIComponent(trimmedGuid)}/unsend`,
  });

  const payload = {
    partIndex: typeof opts.partIndex === "number" ? opts.partIndex : 0,
  };

  const res = await blueBubblesFetchWithTimeout(
    url,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    opts.timeoutMs,
  );

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`BlueBubbles unsend failed (${res.status}): ${errorText || "unknown"}`);
  }
}

/**
 * Rename a group chat via BlueBubbles API.
 */
export async function renameBlueBubblesChat(
  chatGuid: string,
  displayName: string,
  opts: BlueBubblesChatOpts = {},
): Promise<void> {
  const trimmedGuid = chatGuid.trim();
  if (!trimmedGuid) {
    throw new Error("BlueBubbles rename requires chatGuid");
  }

  assertPrivateApiEnabled(accountId, "renameGroup");
  const url = buildBlueBubblesApiUrl({
    baseUrl,
    path: `/api/v1/chat/${encodeURIComponent(trimmedGuid)}`,
  });

  const res = await blueBubblesFetchWithTimeout(
    url,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName }),
    },
    opts.timeoutMs,
  );

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`BlueBubbles rename failed (${res.status}): ${errorText || "unknown"}`);
  }
}

/**
 * Add a participant to a group chat via BlueBubbles API.
 */
export async function addBlueBubblesParticipant(
  chatGuid: string,
  address: string,
  opts: BlueBubblesChatOpts = {},
): Promise<void> {
  const trimmedGuid = chatGuid.trim();
  if (!trimmedGuid) {
    throw new Error("BlueBubbles addParticipant requires chatGuid");
  }
  const trimmedAddress = address.trim();
  if (!trimmedAddress) {
    throw new Error("BlueBubbles addParticipant requires address");
  }

  assertPrivateApiEnabled(accountId, "addParticipant");
  const url = buildBlueBubblesApiUrl({
    baseUrl,
    path: `/api/v1/chat/${encodeURIComponent(trimmedGuid)}/participant`,
  });

  const res = await blueBubblesFetchWithTimeout(
    url,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: trimmedAddress }),
    },
    opts.timeoutMs,
  );

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`BlueBubbles addParticipant failed (${res.status}): ${errorText || "unknown"}`);
  }
}

/**
 * Remove a participant from a group chat via BlueBubbles API.
 */
export async function removeBlueBubblesParticipant(
  chatGuid: string,
  address: string,
  opts: BlueBubblesChatOpts = {},
): Promise<void> {
  const trimmedGuid = chatGuid.trim();
  if (!trimmedGuid) {
    throw new Error("BlueBubbles removeParticipant requires chatGuid");
  }
  const trimmedAddress = address.trim();
  if (!trimmedAddress) {
    throw new Error("BlueBubbles removeParticipant requires address");
  }

  assertPrivateApiEnabled(accountId, "removeParticipant");
  const url = buildBlueBubblesApiUrl({
    baseUrl,
    path: `/api/v1/chat/${encodeURIComponent(trimmedGuid)}/participant`,
  });

  const res = await blueBubblesFetchWithTimeout(
    url,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: trimmedAddress }),
    },
    opts.timeoutMs,
  );

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(
      `BlueBubbles removeParticipant failed (${res.status}): ${errorText || "unknown"}`,
    );
  }
}

/**
 * Leave a group chat via BlueBubbles API.
 */
export async function leaveBlueBubblesChat(
  chatGuid: string,
  opts: BlueBubblesChatOpts = {},
): Promise<void> {
  const trimmedGuid = chatGuid.trim();
  if (!trimmedGuid) {
    throw new Error("BlueBubbles leaveChat requires chatGuid");
  }

  assertPrivateApiEnabled(accountId, "leaveGroup");
  const url = buildBlueBubblesApiUrl({
    baseUrl,
    path: `/api/v1/chat/${encodeURIComponent(trimmedGuid)}/leave`,
  });

  const res = await blueBubblesFetchWithTimeout(url, { method: "POST" }, opts.timeoutMs);

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`BlueBubbles leaveChat failed (${res.status}): ${errorText || "unknown"}`);
  }
}

/**
 * Set a group chat's icon/photo via BlueBubbles API.
 * Requires Private API to be enabled.
 */
export async function setGroupIconBlueBubbles(
  chatGuid: string,
  buffer: Uint8Array,
  filename: string,
  opts: BlueBubblesChatOpts & { contentType?: string } = {},
): Promise<void> {
  const trimmedGuid = chatGuid.trim();
  if (!trimmedGuid) {
    throw new Error("BlueBubbles setGroupIcon requires chatGuid");
  }
  if (!buffer || buffer.length === 0) {
    throw new Error("BlueBubbles setGroupIcon requires image buffer");
  }

  assertPrivateApiEnabled(accountId, "setGroupIcon");
  const url = buildBlueBubblesApiUrl({
    baseUrl,
    path: `/api/v1/chat/${encodeURIComponent(trimmedGuid)}/icon`,
  });

  // Build multipart form-data
  const boundary = `----BlueBubblesFormBoundary${crypto.randomUUID().replace(/-/g, "")}`;
  const parts: Uint8Array[] = [];
  const encoder = new TextEncoder();

  // Sanitize filename to prevent multipart header injection (CWE-93)
  const safeFilename = path.basename(filename).replace(/[\r\n"\\]/g, "_") || "icon.png";

  // Add file field named "icon" as per API spec
  parts.push(encoder.encode(`--${boundary}\r\n`));
  parts.push(
    encoder.encode(`Content-Disposition: form-data; name="icon"; filename="${safeFilename}"\r\n`),
  );
  parts.push(
    encoder.encode(`Content-Type: ${opts.contentType ?? "application/octet-stream"}\r\n\r\n`),
  );
  parts.push(buffer);
  parts.push(encoder.encode("\r\n"));

  // Close multipart body
  parts.push(encoder.encode(`--${boundary}--\r\n`));

  const res = await postMultipartFormData({
    url,
    boundary,
    parts,
    timeoutMs: opts.timeoutMs ?? 60_000, // longer timeout for file uploads
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`BlueBubbles setGroupIcon failed (${res.status}): ${errorText || "unknown"}`);
  }
}
