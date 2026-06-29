import { describe, expect, it } from "vitest";
import { isTruthyEnvValue, normalizeZaiEnv } from "./env.js";

describe("normalizeZaiEnv", () => {

    normalizeZaiEnv();


    if (prevZai === undefined) {
    } else {
    }
    if (prevZAi === undefined) {
    } else {
    }
  });


    normalizeZaiEnv();


    if (prevZai === undefined) {
    } else {
    }
    if (prevZAi === undefined) {
    } else {
    }
  });
});

describe("isTruthyEnvValue", () => {
  it("accepts common truthy values", () => {
    expect(isTruthyEnvValue("1")).toBe(true);
    expect(isTruthyEnvValue("true")).toBe(true);
    expect(isTruthyEnvValue(" yes ")).toBe(true);
    expect(isTruthyEnvValue("ON")).toBe(true);
  });

  it("rejects other values", () => {
    expect(isTruthyEnvValue("0")).toBe(false);
    expect(isTruthyEnvValue("false")).toBe(false);
    expect(isTruthyEnvValue("")).toBe(false);
    expect(isTruthyEnvValue(undefined)).toBe(false);
  });
});
