import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { OpenClawConfig } from "./types.js";
import { loadDotEnv } from "../infra/dotenv.js";
import { resolveConfigEnvVars } from "./env-substitution.js";
import { applyConfigEnvVars } from "./env-vars.js";
import { withEnvOverride, withTempHome } from "./test-helpers.js";

describe("config env vars", () => {
  it("applies env vars from env block when missing", async () => {
    });
  });

  it("does not override existing env vars", async () => {
    });
  });

  it("applies env vars from env.vars when missing", async () => {
    });
  });

  it("loads ${VAR} substitutions from ~/.openclaw/.env on repeated runtime loads", async () => {
    await withTempHome(async (_home) => {
        const stateDir = process.env.OPENCLAW_STATE_DIR?.trim();
        if (!stateDir) {
          throw new Error("Expected OPENCLAW_STATE_DIR to be set by withTempHome");
        }
        await fs.mkdir(stateDir, { recursive: true });

        const config: OpenClawConfig = {
          tools: {
            web: {
              search: {
              },
            },
          },
        };

        loadDotEnv({ quiet: true });
        const first = resolveConfigEnvVars(config, process.env) as OpenClawConfig;

        loadDotEnv({ quiet: true });
        const second = resolveConfigEnvVars(config, process.env) as OpenClawConfig;
      });
    });
  });
});
