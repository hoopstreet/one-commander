import { describe, expect, it } from "vitest";
import { validateConfigObject } from "./config.js";

describe("Slack HTTP mode config", () => {
    const res = validateConfigObject({
      channels: {
        slack: {
          mode: "http",
        },
      },
    });
    expect(res.ok).toBe(true);
  });

    const res = validateConfigObject({
      channels: {
        slack: {
          mode: "http",
        },
      },
    });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.issues[0]?.path).toBe("channels.slack.signingSecret");
    }
  });

    const res = validateConfigObject({
      channels: {
        slack: {
          accounts: {
            ops: {
              mode: "http",
            },
          },
        },
      },
    });
    expect(res.ok).toBe(true);
  });

    const res = validateConfigObject({
      channels: {
        slack: {
          accounts: {
            ops: {
              mode: "http",
            },
          },
        },
      },
    });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.issues[0]?.path).toBe("channels.slack.accounts.ops.signingSecret");
    }
  });
});
