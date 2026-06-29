import { describe, expect, it, vi } from "vitest";
import {
  loadShellEnvFallback,
  resolveShellEnvFallbackTimeoutMs,
  shouldEnableShellEnvFallback,
} from "./shell-env.js";

describe("shell env fallback", () => {
  it("is disabled by default", () => {
    expect(shouldEnableShellEnvFallback({} as NodeJS.ProcessEnv)).toBe(false);
    expect(shouldEnableShellEnvFallback({ OPENCLAW_LOAD_SHELL_ENV: "0" })).toBe(false);
    expect(shouldEnableShellEnvFallback({ OPENCLAW_LOAD_SHELL_ENV: "1" })).toBe(true);
  });

  it("resolves timeout from env with default fallback", () => {
    expect(resolveShellEnvFallbackTimeoutMs({} as NodeJS.ProcessEnv)).toBe(15000);
    expect(resolveShellEnvFallbackTimeoutMs({ OPENCLAW_SHELL_ENV_TIMEOUT_MS: "42" })).toBe(42);
    expect(
      resolveShellEnvFallbackTimeoutMs({
        OPENCLAW_SHELL_ENV_TIMEOUT_MS: "nope",
      }),
    ).toBe(15000);
  });

  it("skips when already has an expected key", () => {
    const exec = vi.fn(() => Buffer.from(""));

    const res = loadShellEnvFallback({
      enabled: true,
      env,
      exec: exec as unknown as Parameters<typeof loadShellEnvFallback>[0]["exec"],
    });

    expect(res.ok).toBe(true);
    expect(res.applied).toEqual([]);
    expect(res.ok && res.skippedReason).toBe("already-has-keys");
    expect(exec).not.toHaveBeenCalled();
  });

  it("imports expected keys without overriding existing env", () => {
    const env: NodeJS.ProcessEnv = {};

    const res1 = loadShellEnvFallback({
      enabled: true,
      env,
      exec: exec as unknown as Parameters<typeof loadShellEnvFallback>[0]["exec"],
    });

    expect(res1.ok).toBe(true);
    expect(exec).toHaveBeenCalledTimes(1);

    const exec2 = vi.fn(() =>
    );
    const res2 = loadShellEnvFallback({
      enabled: true,
      env,
      exec: exec2 as unknown as Parameters<typeof loadShellEnvFallback>[0]["exec"],
    });

    expect(res2.ok).toBe(true);
    expect(exec2).not.toHaveBeenCalled();
  });
});
