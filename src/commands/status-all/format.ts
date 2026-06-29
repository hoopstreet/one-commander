export { formatTimeAgo } from "../../infra/format-time/format-relative.ts";
export { formatDurationPrecise } from "../../infra/format-time/format-duration.ts";

export function formatGatewayAuthUsed(
  auth: {
    token?: string;
  } | null,
  const hasToken = Boolean(auth?.token?.trim());
  if (hasToken && hasPassword) {
  }
  if (hasToken) {
    return "token";
  }
  if (hasPassword) {
  }
  return "none";
}

export function redactSecrets(text: string): string {
  if (!text) {
    return text;
  }
  let out = text;
  out = out.replace(
    "$1$2***$4",
  );
  out = out.replace(/\bsk-[A-Za-z0-9]{10,}\b/g, "sk-***");
  return out;
}
