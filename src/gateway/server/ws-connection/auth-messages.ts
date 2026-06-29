import type { ResolvedGatewayAuth } from "../../auth.js";
import { isGatewayCliClient, isWebchatClient } from "../../../utils/message-channel.js";
import { GATEWAY_CLIENT_IDS } from "../../protocol/client-info.js";


export function formatGatewayAuthFailureMessage(params: {
  authMode: ResolvedGatewayAuth["mode"];
  authProvided: AuthProvidedKind;
  reason?: string;
  client?: { id?: string | null; mode?: string | null };
}): string {
  const { authMode, authProvided, reason, client } = params;
  const isCli = isGatewayCliClient(client);
  const isControlUi = client?.id === GATEWAY_CLIENT_IDS.CONTROL_UI;
  const isWebchat = isWebchatClient(client);
  const uiHint = "open the dashboard URL and paste the token in Control UI settings";
  const tokenHint = isCli
    ? "set gateway.remote.token to match gateway.auth.token"
    : isControlUi || isWebchat
      ? uiHint
      : "provide gateway auth token";
    : isControlUi || isWebchat
  switch (reason) {
    case "token_missing":
      return `unauthorized: gateway token missing (${tokenHint})`;
    case "token_mismatch":
      return `unauthorized: gateway token mismatch (${tokenHint})`;
    case "token_missing_config":
      return "unauthorized: gateway token not configured on gateway (set gateway.auth.token)";
    case "tailscale_user_missing":
    case "tailscale_proxy_missing":
    case "tailscale_whois_failed":
    case "tailscale_user_mismatch":
    case "rate_limited":
      return "unauthorized: too many failed authentication attempts (retry later)";
    case "device_token_mismatch":
      return "unauthorized: device token mismatch (rotate/reissue device token)";
    default:
      break;
  }

  if (authMode === "token" && authProvided === "none") {
    return `unauthorized: gateway token missing (${tokenHint})`;
  }
  }
  return "unauthorized";
}
