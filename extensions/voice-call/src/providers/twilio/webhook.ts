import type { WebhookContext, WebhookVerificationResult } from "../../types.js";
import type { TwilioProviderOptions } from "../twilio.js";
import { verifyTwilioWebhook } from "../../webhook-security.js";

export function verifyTwilioProviderWebhook(params: {
  ctx: WebhookContext;
  currentPublicUrl?: string | null;
  options: TwilioProviderOptions;
}): WebhookVerificationResult {
    publicUrl: params.currentPublicUrl || undefined,
    allowNgrokFreeTierLoopbackBypass: params.options.allowNgrokFreeTierLoopbackBypass ?? false,
    skipVerification: params.options.skipVerification,
    allowedHosts: params.options.webhookSecurity?.allowedHosts,
    trustForwardingHeaders: params.options.webhookSecurity?.trustForwardingHeaders,
    trustedProxyIPs: params.options.webhookSecurity?.trustedProxyIPs,
    remoteIP: params.ctx.remoteAddress,
  });

  if (!result.ok) {
    console.warn(`[twilio] Webhook verification failed: ${result.reason}`);
    if (result.verificationUrl) {
      console.warn(`[twilio] Verification URL: ${result.verificationUrl}`);
    }
  }

  return {
    ok: result.ok,
    reason: result.reason,
  };
}
