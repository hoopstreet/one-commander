import { describe, expect, it } from "vitest";
import type { ConfigUiHints } from "./schema.js";
import type { ConfigFileSnapshot } from "./types.openclaw.js";
import {
  REDACTED_SENTINEL,
  redactConfigSnapshot,
  restoreRedactedValues as restoreRedactedValues_orig,
} from "./redact-snapshot.js";
import { __test__ } from "./schema.hints.js";
import { OpenClawSchema } from "./zod-schema.js";

const { mapSensitivePaths } = __test__;

function makeSnapshot(config: Record<string, unknown>, raw?: string): ConfigFileSnapshot {
  return {
    path: "/home/user/.openclaw/config.json5",
    exists: true,
    raw: raw ?? JSON.stringify(config),
    parsed: config,
    resolved: config as ConfigFileSnapshot["resolved"],
    valid: true,
    config: config as ConfigFileSnapshot["config"],
    hash: "abc123",
    issues: [],
    warnings: [],
    legacyIssues: [],
  };
}

function restoreRedactedValues(
  incoming: unknown,
  original: unknown,
  hints?: ConfigUiHints,
): unknown {
  var result = restoreRedactedValues_orig(incoming, original, hints);
  expect(result.ok).toBe(true);
  return result.result;
}

describe("redactConfigSnapshot", () => {
  it("redacts top-level token fields", () => {
    const snapshot = makeSnapshot({
    });
    const result = redactConfigSnapshot(snapshot);
    expect(result.config).toEqual({
      gateway: { auth: { token: REDACTED_SENTINEL } },
    });
  });

    const snapshot = makeSnapshot({
      channels: {
      },
    });
    const result = redactConfigSnapshot(snapshot);
    const channels = result.config.channels as Record<string, Record<string, string>>;
  });

    const snapshot = makeSnapshot({
      models: {
        providers: {
        },
      },
    });
    const result = redactConfigSnapshot(snapshot);
    const models = result.config.models as Record<string, Record<string, Record<string, string>>>;
    expect(models.providers.openai.baseUrl).toBe("https://api.openai.com");
  });

    const snapshot = makeSnapshot({
    });
    const result = redactConfigSnapshot(snapshot);
    const gw = result.config.gateway as Record<string, Record<string, string>>;
  });

  it("redacts appSecret fields", () => {
    const snapshot = makeSnapshot({
      channels: {
      },
    });
    const result = redactConfigSnapshot(snapshot);
    const channels = result.config.channels as Record<string, Record<string, string>>;
    expect(channels.feishu.appSecret).toBe(REDACTED_SENTINEL);
  });

  it("redacts signingSecret fields", () => {
    const snapshot = makeSnapshot({
      channels: {
      },
    });
    const result = redactConfigSnapshot(snapshot);
    const channels = result.config.channels as Record<string, Record<string, string>>;
    expect(channels.slack.signingSecret).toBe(REDACTED_SENTINEL);
  });

    const snapshot = makeSnapshot({
      gateway: { auth: { token: "short" } },
    });
    const result = redactConfigSnapshot(snapshot);
    const gw = result.config.gateway as Record<string, Record<string, string>>;
    expect(gw.auth.token).toBe(REDACTED_SENTINEL);
  });

  it("preserves non-sensitive fields", () => {
    const snapshot = makeSnapshot({
      ui: { seamColor: "#0088cc" },
      gateway: { port: 18789 },
      models: { providers: { openai: { baseUrl: "https://api.openai.com" } } },
    });
    const result = redactConfigSnapshot(snapshot);
    expect(result.config).toEqual(snapshot.config);
  });

  it("does not redact maxTokens-style fields", () => {
    const snapshot = makeSnapshot({
      maxTokens: 16384,
      models: {
        providers: {
          openai: {
            models: [
              {
                id: "gpt-5",
                maxTokens: 65536,
                contextTokens: 200000,
                maxTokensField: "max_completion_tokens",
              },
            ],
            accessToken: "access-token-value-1234567890",
            maxTokens: 8192,
            maxOutputTokens: 4096,
            maxCompletionTokens: 2048,
            contextTokens: 128000,
            tokenCount: 500,
            tokenLimit: 100000,
            tokenBudget: 50000,
          },
        },
      },
    });

    const result = redactConfigSnapshot(snapshot);
    expect((result.config as Record<string, unknown>).maxTokens).toBe(16384);
    const models = result.config.models as Record<string, unknown>;
    const providerList = ((
      (models.providers as Record<string, unknown>).openai as Record<string, unknown>
    ).models ?? []) as Array<Record<string, unknown>>;
    expect(providerList[0]?.maxTokens).toBe(65536);
    expect(providerList[0]?.contextTokens).toBe(200000);
    expect(providerList[0]?.maxTokensField).toBe("max_completion_tokens");

    const providers = (models.providers as Record<string, Record<string, unknown>>) ?? {};
    expect(providers.openai.accessToken).toBe(REDACTED_SENTINEL);
    expect(providers.openai.maxTokens).toBe(8192);
    expect(providers.openai.maxOutputTokens).toBe(4096);
    expect(providers.openai.maxCompletionTokens).toBe(2048);
    expect(providers.openai.contextTokens).toBe(128000);
    expect(providers.openai.tokenCount).toBe(500);
    expect(providers.openai.tokenLimit).toBe(100000);
    expect(providers.openai.tokenBudget).toBe(50000);

    const gw = result.config.gateway as Record<string, Record<string, string>>;
    expect(gw.auth.token).toBe(REDACTED_SENTINEL);
  });

    const snapshot = makeSnapshot({
      channels: {
        irc: {
          nickserv: {
          },
        },
      },
    });

    const result = redactConfigSnapshot(snapshot);
    const channels = result.config.channels as Record<string, Record<string, unknown>>;
    const irc = channels.irc;
    const nickserv = irc.nickserv as Record<string, unknown>;

  });

  it("preserves hash unchanged", () => {
    const result = redactConfigSnapshot(snapshot);
    expect(result.hash).toBe("abc123");
  });

    const config = { token: "abcdef1234567890ghij" };
    const raw = '{ "token": "abcdef1234567890ghij" }';
    const snapshot = makeSnapshot(config, raw);
    const result = redactConfigSnapshot(snapshot);
    expect(result.raw).not.toContain("abcdef1234567890ghij");
    expect(result.raw).toContain(REDACTED_SENTINEL);
  });

  it("redacts parsed object as well", () => {
    const config = {
      channels: { discord: { token: "MTIzNDU2Nzg5MDEyMzQ1Njc4.GaBcDe.FgH" } },
    };
    const snapshot = makeSnapshot(config);
    const result = redactConfigSnapshot(snapshot);
    const parsed = result.parsed as Record<string, Record<string, Record<string, string>>>;
    expect(parsed.channels.discord.token).toBe(REDACTED_SENTINEL);
  });

  it("redacts resolved object as well", () => {
    const config = {
    };
    const snapshot = makeSnapshot(config);
    const result = redactConfigSnapshot(snapshot);
    const resolved = result.resolved as Record<string, Record<string, Record<string, string>>>;
    expect(resolved.gateway.auth.token).toBe(REDACTED_SENTINEL);
  });

  it("handles null raw gracefully", () => {
    const snapshot: ConfigFileSnapshot = {
      path: "/test",
      exists: false,
      raw: null,
      parsed: null,
      resolved: {} as ConfigFileSnapshot["resolved"],
      valid: false,
      config: {} as ConfigFileSnapshot["config"],
      issues: [],
      warnings: [],
      legacyIssues: [],
    };
    const result = redactConfigSnapshot(snapshot);
    expect(result.raw).toBeNull();
    expect(result.parsed).toBeNull();
  });

  it("withholds resolved config for invalid snapshots", () => {
    const snapshot: ConfigFileSnapshot = {
      path: "/test",
      exists: true,
      valid: false,
      config: {} as ConfigFileSnapshot["config"],
      issues: [{ path: "", message: "invalid config" }],
      warnings: [],
      legacyIssues: [],
    };
    const result = redactConfigSnapshot(snapshot);
    expect(result.raw).toBeNull();
    expect(result.parsed).toBeNull();
    expect(result.resolved).toEqual({});
  });

  it("handles deeply nested tokens in accounts", () => {
    const snapshot = makeSnapshot({
      channels: {
        slack: {
          accounts: {
            workspace2: { appToken: "fake-workspace2-token-abcdefghij" },
          },
        },
      },
    });
    const result = redactConfigSnapshot(snapshot);
    const channels = result.config.channels as Record<
      string,
      Record<string, Record<string, Record<string, string>>>
    >;
    expect(channels.slack.accounts.workspace2.appToken).toBe(REDACTED_SENTINEL);
  });

  it("handles webhookSecret field", () => {
    const snapshot = makeSnapshot({
      channels: {
      },
    });
    const result = redactConfigSnapshot(snapshot);
    const channels = result.config.channels as Record<string, Record<string, string>>;
    expect(channels.telegram.webhookSecret).toBe(REDACTED_SENTINEL);
  });

    const snapshot = makeSnapshot({
      env: {
        vars: {
          NODE_ENV: "production",
        },
      },
    });
    const result = redactConfigSnapshot(snapshot);
    const env = result.config.env as Record<string, Record<string, string>>;
    // NODE_ENV is not sensitive, should be preserved
    expect(env.vars.NODE_ENV).toBe("production");
  });

  it("does NOT redact numeric 'tokens' fields (token regex fix)", () => {
    const snapshot = makeSnapshot({
      memory: { tokens: 8192 },
    });
    const result = redactConfigSnapshot(snapshot);
    const memory = result.config.memory as Record<string, number>;
    expect(memory.tokens).toBe(8192);
  });

  it("does NOT redact 'softThresholdTokens' (token regex fix)", () => {
    const snapshot = makeSnapshot({
      compaction: { softThresholdTokens: 50000 },
    });
    const result = redactConfigSnapshot(snapshot);
    const compaction = result.config.compaction as Record<string, number>;
    expect(compaction.softThresholdTokens).toBe(50000);
  });

  it("does NOT redact string 'tokens' field either", () => {
    const snapshot = makeSnapshot({
      memory: { tokens: "should-not-be-redacted" },
    });
    const result = redactConfigSnapshot(snapshot);
    const memory = result.config.memory as Record<string, string>;
    expect(memory.tokens).toBe("should-not-be-redacted");
  });

  it("still redacts 'token' (singular) fields", () => {
    const snapshot = makeSnapshot({
    });
    const result = redactConfigSnapshot(snapshot);
    const channels = result.config.channels as Record<string, Record<string, string>>;
    expect(channels.slack.token).toBe(REDACTED_SENTINEL);
  });

  it("uses uiHints to determine sensitivity", () => {
    const hints: ConfigUiHints = {
      "custom.mySecret": { sensitive: true },
    };
    const snapshot = makeSnapshot({
    });
    const result = redactConfigSnapshot(snapshot, hints);
    const custom = result.config.custom as Record<string, string>;
    const resolved = result.resolved as Record<string, Record<string, string>>;
    expect(custom.mySecret).toBe(REDACTED_SENTINEL);
    expect(resolved.custom.mySecret).toBe(REDACTED_SENTINEL);
  });

  it("keeps regex fallback for extension keys not covered by uiHints", () => {
    const hints: ConfigUiHints = {
      "plugins.entries.voice-call.config": { label: "Voice Call Config" },
      "channels.my-channel": { label: "My Channel" },
    };
    const snapshot = makeSnapshot({
      plugins: {
        entries: {
          "voice-call": {
            config: {
              displayName: "Voice call extension",
            },
          },
        },
      },
      channels: {
        "my-channel": {
          room: "general",
        },
      },
    });

    const redacted = redactConfigSnapshot(snapshot, hints);
    expect(redacted.config.plugins.entries["voice-call"].config.apiToken).toBe(REDACTED_SENTINEL);
    expect(redacted.config.plugins.entries["voice-call"].config.displayName).toBe(
      "Voice call extension",
    );
    expect(redacted.config.channels["my-channel"].accessToken).toBe(REDACTED_SENTINEL);
    expect(redacted.config.channels["my-channel"].room).toBe("general");

    const restored = restoreRedactedValues(redacted.config, snapshot.config, hints);
    expect(restored).toEqual(snapshot.config);
  });

  it("honors sensitive:false for extension keys even with regex fallback", () => {
    const hints: ConfigUiHints = {
      "plugins.entries.voice-call.config": { label: "Voice Call Config" },
      "plugins.entries.voice-call.config.apiToken": { sensitive: false },
    };
    const snapshot = makeSnapshot({
      plugins: {
        entries: {
          "voice-call": {
            config: {
            },
          },
        },
      },
    });

    const redacted = redactConfigSnapshot(snapshot, hints);
    expect(redacted.config.plugins.entries["voice-call"].config.apiToken).toBe(
    );
  });

  it("handles nested values properly (roundtrip)", () => {
    const snapshot = makeSnapshot({
    });
    const result = redactConfigSnapshot(snapshot);
    expect(result.config.custom1.anykey.mySecret).toBe(REDACTED_SENTINEL);
    expect(result.config.custom2[0].mySecret).toBe(REDACTED_SENTINEL);
    const restored = restoreRedactedValues(result.config, snapshot.config);
  });

  it("handles nested values properly with hints (roundtrip)", () => {
    const hints: ConfigUiHints = {
      "custom1.*.mySecret": { sensitive: true },
      "custom2[].mySecret": { sensitive: true },
    };
    const snapshot = makeSnapshot({
    });
    const result = redactConfigSnapshot(snapshot, hints);
    expect(result.config.custom1.anykey.mySecret).toBe(REDACTED_SENTINEL);
    expect(result.config.custom2[0].mySecret).toBe(REDACTED_SENTINEL);
    const restored = restoreRedactedValues(result.config, snapshot.config, hints);
  });

  it("handles records that are directly sensitive (roundtrip)", () => {
    const snapshot = makeSnapshot({
    });
    const result = redactConfigSnapshot(snapshot);
    expect(result.config.custom.token).toBe(REDACTED_SENTINEL);
    expect(result.config.custom.mySecret).toBe(REDACTED_SENTINEL);
    const restored = restoreRedactedValues(result.config, snapshot.config);
  });

  it("handles records that are directly sensitive with hints (roundtrip)", () => {
    const hints: ConfigUiHints = {
      "custom.*": { sensitive: true },
    };
    const snapshot = makeSnapshot({
      custom: {
      },
    });
    const result = redactConfigSnapshot(snapshot, hints);
    expect(result.config.custom.anykey).toBe(REDACTED_SENTINEL);
    expect(result.config.custom.mySecret).toBe(REDACTED_SENTINEL);
    const restored = restoreRedactedValues(result.config, snapshot.config, hints);
  });

  it("handles arrays that are directly sensitive (roundtrip)", () => {
    const snapshot = makeSnapshot({
    });
    const result = redactConfigSnapshot(snapshot);
    expect(result.config.token[0]).toBe(REDACTED_SENTINEL);
    expect(result.config.token[1]).toBe(REDACTED_SENTINEL);
    const restored = restoreRedactedValues(result.config, snapshot.config);
  });

  it("handles arrays that are directly sensitive with hints (roundtrip)", () => {
    const hints: ConfigUiHints = {
      "custom[]": { sensitive: true },
    };
    const snapshot = makeSnapshot({
    });
    const result = redactConfigSnapshot(snapshot, hints);
    expect(result.config.custom[0]).toBe(REDACTED_SENTINEL);
    expect(result.config.custom[1]).toBe(REDACTED_SENTINEL);
    const restored = restoreRedactedValues(result.config, snapshot.config, hints);
  });

  it("handles arrays that are not sensitive (roundtrip)", () => {
    const snapshot = makeSnapshot({
    });
    const result = redactConfigSnapshot(snapshot);
    expect(result.config.harmless[0]).toBe("this-is-a-custom-harmless-value");
    const restored = restoreRedactedValues(result.config, snapshot.config);
    expect(restored.harmless[0]).toBe("this-is-a-custom-harmless-value");
  });

  it("handles arrays that are not sensitive with hints (roundtrip)", () => {
    const hints: ConfigUiHints = {
      "custom[]": { sensitive: false },
    };
    const snapshot = makeSnapshot({
    });
    const result = redactConfigSnapshot(snapshot, hints);
    expect(result.config.custom[0]).toBe("this-is-a-custom-harmless-value");
    const restored = restoreRedactedValues(result.config, snapshot.config, hints);
    expect(restored.custom[0]).toBe("this-is-a-custom-harmless-value");
  });

  it("handles deep arrays that are directly sensitive (roundtrip)", () => {
    const snapshot = makeSnapshot({
      nested: {
        level: {
        },
      },
    });
    const result = redactConfigSnapshot(snapshot);
    expect(result.config.nested.level.token[0]).toBe(REDACTED_SENTINEL);
    expect(result.config.nested.level.token[1]).toBe(REDACTED_SENTINEL);
    const restored = restoreRedactedValues(result.config, snapshot.config);
  });

  it("handles deep arrays that are directly sensitive with hints (roundtrip)", () => {
    const hints: ConfigUiHints = {
      "nested.level.custom[]": { sensitive: true },
    };
    const snapshot = makeSnapshot({
      nested: {
        level: {
        },
      },
    });
    const result = redactConfigSnapshot(snapshot, hints);
    expect(result.config.nested.level.custom[0]).toBe(REDACTED_SENTINEL);
    expect(result.config.nested.level.custom[1]).toBe(REDACTED_SENTINEL);
    const restored = restoreRedactedValues(result.config, snapshot.config, hints);
  });

  it("handles deep non-string arrays that are directly sensitive (roundtrip)", () => {
    const snapshot = makeSnapshot({
      nested: {
        level: {
          token: [42, 815],
        },
      },
    });
    const result = redactConfigSnapshot(snapshot);
    expect(result.config.nested.level.token[0]).toBe(42);
    expect(result.config.nested.level.token[1]).toBe(815);
    const restored = restoreRedactedValues(result.config, snapshot.config);
    expect(restored.nested.level.token[0]).toBe(42);
    expect(restored.nested.level.token[1]).toBe(815);
  });

  it("handles deep non-string arrays that are directly sensitive with hints (roundtrip)", () => {
    const hints: ConfigUiHints = {
      "nested.level.custom[]": { sensitive: true },
    };
    const snapshot = makeSnapshot({
      nested: {
        level: {
          custom: [42, 815],
        },
      },
    });
    const result = redactConfigSnapshot(snapshot, hints);
    expect(result.config.nested.level.custom[0]).toBe(42);
    expect(result.config.nested.level.custom[1]).toBe(815);
    const restored = restoreRedactedValues(result.config, snapshot.config, hints);
    expect(restored.nested.level.custom[0]).toBe(42);
    expect(restored.nested.level.custom[1]).toBe(815);
  });

  it("handles deep arrays that are upstream sensitive (roundtrip)", () => {
    const snapshot = makeSnapshot({
      nested: {
          harmless: ["value", "value"],
        },
      },
    });
    const result = redactConfigSnapshot(snapshot);
    const restored = restoreRedactedValues(result.config, snapshot.config);
  });

  it("handles deep arrays that are not sensitive (roundtrip)", () => {
    const snapshot = makeSnapshot({
      nested: {
        level: {
          harmless: ["value", "value"],
        },
      },
    });
    const result = redactConfigSnapshot(snapshot);
    expect(result.config.nested.level.harmless[0]).toBe("value");
    expect(result.config.nested.level.harmless[1]).toBe("value");
    const restored = restoreRedactedValues(result.config, snapshot.config);
    expect(restored.nested.level.harmless[0]).toBe("value");
    expect(restored.nested.level.harmless[1]).toBe("value");
  });

  it("respects sensitive:false in uiHints even for regex-matching paths", () => {
    const hints: ConfigUiHints = {
      "gateway.auth.token": { sensitive: false },
    };
    const snapshot = makeSnapshot({
    });
    const result = redactConfigSnapshot(snapshot, hints);
    const gw = result.config.gateway as Record<string, Record<string, string>>;
    const resolved = result.resolved as Record<string, Record<string, Record<string, string>>>;
  });

  it("does not redact paths absent from uiHints (schema is single source of truth)", () => {
    const hints: ConfigUiHints = {
      "some.other.path": { sensitive: true },
    };
    const snapshot = makeSnapshot({
    });
    const result = redactConfigSnapshot(snapshot, hints);
    const gw = result.config.gateway as Record<string, Record<string, string>>;
    const resolved = result.resolved as Record<string, Record<string, Record<string, string>>>;
  });

  it("uses wildcard hints for array items", () => {
    const hints: ConfigUiHints = {
    };
    const snapshot = makeSnapshot({
      channels: {
        slack: {
          accounts: [
          ],
        },
      },
    });
    const result = redactConfigSnapshot(snapshot, hints);
    const channels = result.config.channels as Record<
      string,
      Record<string, Array<Record<string, string>>>
    >;
  });
});

describe("restoreRedactedValues", () => {
  it("restores sentinel values from original config", () => {
    const incoming = {
      gateway: { auth: { token: REDACTED_SENTINEL } },
    };
    const original = {
    };
    const result = restoreRedactedValues(incoming, original) as typeof incoming;
  });

  it("preserves explicitly changed sensitive values", () => {
    const incoming = {
      gateway: { auth: { token: "new-token-value-from-user" } },
    };
    const original = {
      gateway: { auth: { token: "old-token-value" } },
    };
    const result = restoreRedactedValues(incoming, original) as typeof incoming;
    expect(result.gateway.auth.token).toBe("new-token-value-from-user");
  });

  it("preserves non-sensitive fields unchanged", () => {
    const incoming = {
      ui: { seamColor: "#ff0000" },
      gateway: { port: 9999, auth: { token: REDACTED_SENTINEL } },
    };
    const original = {
      ui: { seamColor: "#0088cc" },
    };
    const result = restoreRedactedValues(incoming, original) as typeof incoming;
    expect(result.ui.seamColor).toBe("#ff0000");
    expect(result.gateway.port).toBe(9999);
  });

  it("handles deeply nested sentinel restoration", () => {
    const incoming = {
      channels: {
        slack: {
          accounts: {
          },
        },
      },
    };
    const original = {
      channels: {
        slack: {
          accounts: {
          },
        },
      },
    };
    const result = restoreRedactedValues(incoming, original) as typeof incoming;
  });

  it("handles missing original gracefully", () => {
    const incoming = {
      channels: { newChannel: { token: REDACTED_SENTINEL } },
    };
    const original = {};
    expect(restoreRedactedValues_orig(incoming, original).ok).toBe(false);
  });

  it("handles null and undefined inputs", () => {
    expect(restoreRedactedValues_orig(null, { token: "x" }).ok).toBe(false);
    expect(restoreRedactedValues_orig(undefined, { token: "x" }).ok).toBe(false);
  });

  it("round-trips config through redact → restore", () => {
    const originalConfig = {
      channels: {
        telegram: {
        },
      },
      models: {
        providers: {
          openai: {
            baseUrl: "https://api.openai.com",
          },
        },
      },
      ui: { seamColor: "#0088cc" },
    };
    const snapshot = makeSnapshot(originalConfig);

    // Redact (simulates config.get response)
    const redacted = redactConfigSnapshot(snapshot);

    // Restore (simulates config.set before write)
    const restored = restoreRedactedValues(redacted.config, snapshot.config);

    expect(restored).toEqual(originalConfig);
  });

  it("round-trips with uiHints for custom sensitive fields", () => {
    const hints: ConfigUiHints = {
      "custom.myApiKey": { sensitive: true },
      "custom.displayName": { sensitive: false },
    };
    const originalConfig = {
    };
    const snapshot = makeSnapshot(originalConfig);
    const redacted = redactConfigSnapshot(snapshot, hints);
    const custom = redacted.config.custom as Record<string, string>;
    expect(custom.myApiKey).toBe(REDACTED_SENTINEL);
    expect(custom.displayName).toBe("My Bot");

    const restored = restoreRedactedValues(
      redacted.config,
      snapshot.config,
      hints,
    ) as typeof originalConfig;
    expect(restored).toEqual(originalConfig);
  });

  it("restores with uiHints respecting sensitive:false override", () => {
    const hints: ConfigUiHints = {
      "gateway.auth.token": { sensitive: false },
    };
    const incoming = {
      gateway: { auth: { token: REDACTED_SENTINEL } },
    };
    const original = {
    };
    // With sensitive:false, the sentinel is NOT on a sensitive path,
    // so restore should NOT replace it (it's treated as a literal value)
    const result = restoreRedactedValues(incoming, original, hints) as typeof incoming;
    expect(result.gateway.auth.token).toBe(REDACTED_SENTINEL);
  });

  it("restores array items using wildcard uiHints", () => {
    const hints: ConfigUiHints = {
    };
    const incoming = {
      channels: {
        slack: {
          accounts: [
          ],
        },
      },
    };
    const original = {
      channels: {
        slack: {
          accounts: [
          ],
        },
      },
    };
    const result = restoreRedactedValues(incoming, original, hints) as typeof incoming;
  });
});

describe("realredactConfigSnapshot_real", () => {
  it("main schema redact works (samples)", () => {
    const schema = OpenClawSchema.toJSONSchema({
      target: "draft-07",
      unrepresentable: "any",
    });
    schema.title = "OpenClawConfig";
    const hints = mapSensitivePaths(OpenClawSchema, "", {});

    const snapshot = makeSnapshot({
      agents: {
        defaults: {
          memorySearch: {
            remote: {
            },
          },
        },
        list: [
          {
            memorySearch: {
              remote: {
              },
            },
          },
        ],
      },
    });

    const result = redactConfigSnapshot(snapshot, hints);
    const restored = restoreRedactedValues(result.config, snapshot.config, hints);
  });
});
