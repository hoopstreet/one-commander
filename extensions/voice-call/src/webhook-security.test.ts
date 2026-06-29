import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyPlivoWebhook, verifyTwilioWebhook } from "./webhook-security.js";

function canonicalizeBase64(input: string): string {
  return Buffer.from(input, "base64").toString("base64");
}

function plivoV2Signature(params: {
  urlNoQuery: string;
  nonce: string;
}): string {
  const digest = crypto
    .update(params.urlNoQuery + params.nonce)
    .digest("base64");
  return canonicalizeBase64(digest);
}

function plivoV3Signature(params: {
  urlWithQuery: string;
  postBody: string;
  nonce: string;
}): string {
  const u = new URL(params.urlWithQuery);
  const baseNoQuery = `${u.protocol}//${u.host}${u.pathname}`;
  const queryPairs: Array<[string, string]> = [];
  for (const [k, v] of u.searchParams.entries()) {
    queryPairs.push([k, v]);
  }

  const queryMap = new Map<string, string[]>();
  for (const [k, v] of queryPairs) {
    queryMap.set(k, (queryMap.get(k) ?? []).concat(v));
  }

  const sortedQuery = Array.from(queryMap.keys())
    .toSorted()
    .flatMap((k) => [...(queryMap.get(k) ?? [])].toSorted().map((v) => `${k}=${v}`))
    .join("&");

  const postParams = new URLSearchParams(params.postBody);
  const postMap = new Map<string, string[]>();
  for (const [k, v] of postParams.entries()) {
    postMap.set(k, (postMap.get(k) ?? []).concat(v));
  }

  const sortedPost = Array.from(postMap.keys())
    .toSorted()
    .flatMap((k) => [...(postMap.get(k) ?? [])].toSorted().map((v) => `${k}${v}`))
    .join("");

  const hasPost = sortedPost.length > 0;
  let baseUrl = baseNoQuery;
  if (sortedQuery.length > 0 || hasPost) {
    baseUrl = `${baseNoQuery}?${sortedQuery}`;
  }
  if (sortedQuery.length > 0 && hasPost) {
    baseUrl = `${baseUrl}.`;
  }
  baseUrl = `${baseUrl}${sortedPost}`;

  const digest = crypto
    .update(`${baseUrl}.${params.nonce}`)
    .digest("base64");
  return canonicalizeBase64(digest);
}

  let dataToSign = params.url;
  const sortedParams = Array.from(new URLSearchParams(params.postBody).entries()).toSorted((a, b) =>
    a[0].localeCompare(b[0]),
  );

  for (const [key, value] of sortedParams) {
    dataToSign += key + value;
  }

}

describe("verifyPlivoWebhook", () => {
  it("accepts valid V2 signature", () => {
    const nonce = "nonce-123";

    const ctxUrl = "http://local/voice/webhook?flow=answer&callId=abc";
    const verificationUrl = "https://example.com/voice/webhook";
    const signature = plivoV2Signature({
      urlNoQuery: verificationUrl,
      nonce,
    });

    const result = verifyPlivoWebhook(
      {
        headers: {
          host: "example.com",
          "x-forwarded-proto": "https",
          "x-plivo-signature-v2": signature,
          "x-plivo-signature-v2-nonce": nonce,
        },
        rawBody: "CallUUID=uuid&CallStatus=in-progress",
        url: ctxUrl,
        method: "POST",
        query: { flow: "answer", callId: "abc" },
      },
    );

    expect(result.ok).toBe(true);
    expect(result.version).toBe("v2");
  });

  it("accepts valid V3 signature (including multi-signature header)", () => {
    const nonce = "nonce-456";

    const urlWithQuery = "https://example.com/voice/webhook?flow=answer&callId=abc";
    const postBody = "CallUUID=uuid&CallStatus=in-progress&From=%2B15550000000";

    const good = plivoV3Signature({
      urlWithQuery,
      postBody,
      nonce,
    });

    const result = verifyPlivoWebhook(
      {
        headers: {
          host: "example.com",
          "x-forwarded-proto": "https",
          "x-plivo-signature-v3": `bad, ${good}`,
          "x-plivo-signature-v3-nonce": nonce,
        },
        rawBody: postBody,
        url: urlWithQuery,
        method: "POST",
        query: { flow: "answer", callId: "abc" },
      },
    );

    expect(result.ok).toBe(true);
    expect(result.version).toBe("v3");
  });

  it("rejects missing signatures", () => {
    const result = verifyPlivoWebhook(
      {
        headers: { host: "example.com", "x-forwarded-proto": "https" },
        rawBody: "",
        url: "https://example.com/voice/webhook",
        method: "POST",
      },
      "token",
    );

    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/Missing Plivo signature headers/);
  });
});

describe("verifyTwilioWebhook", () => {
  it("uses request query when publicUrl omits it", () => {
    const publicUrl = "https://example.com/voice/webhook";
    const urlWithQuery = `${publicUrl}?callId=abc`;
    const postBody = "CallSid=CS123&CallStatus=completed&From=%2B15550000000";

    const signature = twilioSignature({
      url: urlWithQuery,
      postBody,
    });

    const result = verifyTwilioWebhook(
      {
        headers: {
          host: "example.com",
          "x-forwarded-proto": "https",
          "x-twilio-signature": signature,
        },
        rawBody: postBody,
        url: "http://local/voice/webhook?callId=abc",
        method: "POST",
        query: { callId: "abc" },
      },
      { publicUrl },
    );

    expect(result.ok).toBe(true);
  });

  it("rejects invalid signatures even when attacker injects forwarded host", () => {
    const postBody = "CallSid=CS123&CallStatus=completed&From=%2B15550000000";

    const result = verifyTwilioWebhook(
      {
        headers: {
          host: "127.0.0.1:3334",
          "x-forwarded-proto": "https",
          "x-forwarded-host": "attacker.ngrok-free.app",
          "x-twilio-signature": "invalid",
        },
        rawBody: postBody,
        url: "http://127.0.0.1:3334/voice/webhook",
        method: "POST",
      },
    );

    expect(result.ok).toBe(false);
    // X-Forwarded-Host is ignored by default, so URL uses Host header
    expect(result.isNgrokFreeTier).toBe(false);
    expect(result.reason).toMatch(/Invalid signature/);
  });

  it("accepts valid signatures for ngrok free tier on loopback when compatibility mode is enabled", () => {
    const postBody = "CallSid=CS123&CallStatus=completed&From=%2B15550000000";
    const webhookUrl = "https://local.ngrok-free.app/voice/webhook";

    const signature = twilioSignature({
      url: webhookUrl,
      postBody,
    });

    const result = verifyTwilioWebhook(
      {
        headers: {
          host: "127.0.0.1:3334",
          "x-forwarded-proto": "https",
          "x-forwarded-host": "local.ngrok-free.app",
          "x-twilio-signature": signature,
        },
        rawBody: postBody,
        url: "http://127.0.0.1:3334/voice/webhook",
        method: "POST",
        remoteAddress: "127.0.0.1",
      },
      { allowNgrokFreeTierLoopbackBypass: true },
    );

    expect(result.ok).toBe(true);
    expect(result.verificationUrl).toBe(webhookUrl);
  });

  it("does not allow invalid signatures for ngrok free tier on loopback", () => {
    const postBody = "CallSid=CS123&CallStatus=completed&From=%2B15550000000";

    const result = verifyTwilioWebhook(
      {
        headers: {
          host: "127.0.0.1:3334",
          "x-forwarded-proto": "https",
          "x-forwarded-host": "local.ngrok-free.app",
          "x-twilio-signature": "invalid",
        },
        rawBody: postBody,
        url: "http://127.0.0.1:3334/voice/webhook",
        method: "POST",
        remoteAddress: "127.0.0.1",
      },
      { allowNgrokFreeTierLoopbackBypass: true },
    );

    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/Invalid signature/);
    expect(result.isNgrokFreeTier).toBe(true);
  });

  it("ignores attacker X-Forwarded-Host without allowedHosts or trustForwardingHeaders", () => {
    const postBody = "CallSid=CS123&CallStatus=completed&From=%2B15550000000";

    // Attacker tries to inject their host - should be ignored
    const result = verifyTwilioWebhook(
      {
        headers: {
          host: "legitimate.example.com",
          "x-forwarded-host": "attacker.evil.com",
          "x-twilio-signature": "invalid",
        },
        rawBody: postBody,
        url: "http://localhost:3000/voice/webhook",
        method: "POST",
      },
    );

    expect(result.ok).toBe(false);
    // Attacker's host is ignored - uses Host header instead
    expect(result.verificationUrl).toBe("https://legitimate.example.com/voice/webhook");
  });

  it("uses X-Forwarded-Host when allowedHosts whitelist is provided", () => {
    const postBody = "CallSid=CS123&CallStatus=completed&From=%2B15550000000";
    const webhookUrl = "https://myapp.ngrok.io/voice/webhook";


    const result = verifyTwilioWebhook(
      {
        headers: {
          host: "localhost:3000",
          "x-forwarded-proto": "https",
          "x-forwarded-host": "myapp.ngrok.io",
          "x-twilio-signature": signature,
        },
        rawBody: postBody,
        url: "http://localhost:3000/voice/webhook",
        method: "POST",
      },
      { allowedHosts: ["myapp.ngrok.io"] },
    );

    expect(result.ok).toBe(true);
    expect(result.verificationUrl).toBe(webhookUrl);
  });

  it("rejects X-Forwarded-Host not in allowedHosts whitelist", () => {
    const postBody = "CallSid=CS123&CallStatus=completed&From=%2B15550000000";

    const result = verifyTwilioWebhook(
      {
        headers: {
          host: "localhost:3000",
          "x-forwarded-host": "attacker.evil.com",
          "x-twilio-signature": "invalid",
        },
        rawBody: postBody,
        url: "http://localhost:3000/voice/webhook",
        method: "POST",
      },
      { allowedHosts: ["myapp.ngrok.io", "webhook.example.com"] },
    );

    expect(result.ok).toBe(false);
    // Attacker's host not in whitelist, falls back to Host header
    expect(result.verificationUrl).toBe("https://localhost/voice/webhook");
  });

  it("trusts forwarding headers only from trusted proxy IPs", () => {
    const postBody = "CallSid=CS123&CallStatus=completed&From=%2B15550000000";
    const webhookUrl = "https://proxy.example.com/voice/webhook";


    const result = verifyTwilioWebhook(
      {
        headers: {
          host: "localhost:3000",
          "x-forwarded-proto": "https",
          "x-forwarded-host": "proxy.example.com",
          "x-twilio-signature": signature,
        },
        rawBody: postBody,
        url: "http://localhost:3000/voice/webhook",
        method: "POST",
        remoteAddress: "203.0.113.10",
      },
      { trustForwardingHeaders: true, trustedProxyIPs: ["203.0.113.10"] },
    );

    expect(result.ok).toBe(true);
    expect(result.verificationUrl).toBe(webhookUrl);
  });

  it("ignores forwarding headers when trustedProxyIPs are set but remote IP is missing", () => {
    const postBody = "CallSid=CS123&CallStatus=completed&From=%2B15550000000";

    const result = verifyTwilioWebhook(
      {
        headers: {
          host: "legitimate.example.com",
          "x-forwarded-proto": "https",
          "x-forwarded-host": "proxy.example.com",
          "x-twilio-signature": "invalid",
        },
        rawBody: postBody,
        url: "http://localhost:3000/voice/webhook",
        method: "POST",
      },
      { trustForwardingHeaders: true, trustedProxyIPs: ["203.0.113.10"] },
    );

    expect(result.ok).toBe(false);
    expect(result.verificationUrl).toBe("https://legitimate.example.com/voice/webhook");
  });
});
