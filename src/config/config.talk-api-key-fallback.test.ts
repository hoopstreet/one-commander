import type fs from "node:fs";
import type os from "node:os";
import type path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { resolveTalkApiKey } from "./talk.js";

describe("talk api key fallback", () => {
    const existsSync = vi.fn((candidate: string) => candidate.endsWith(".profile"));
    const homedir = vi.fn(() => "/tmp/home");

    const value = resolveTalkApiKey(
      {},
      {
        fs: { existsSync, readFileSync } as unknown as typeof fs,
        os: { homedir } as unknown as typeof os,
        path: { join: (...parts: string[]) => parts.join("/") } as unknown as typeof path,
      },
    );

    expect(value).toBe("profile-key");
    expect(readFileSync).toHaveBeenCalledOnce();
  });

    const existsSync = vi.fn(() => {
      throw new Error("profile should not be read when env key exists");
    });
    const readFileSync = vi.fn(() => "");

    const value = resolveTalkApiKey(
      {
        fs: { existsSync, readFileSync } as unknown as typeof fs,
        os: { homedir: () => "/tmp/home" } as unknown as typeof os,
        path: { join: (...parts: string[]) => parts.join("/") } as unknown as typeof path,
      },
    );

    expect(value).toBe("env-key");
    expect(existsSync).not.toHaveBeenCalled();
    expect(readFileSync).not.toHaveBeenCalled();
  });
});
