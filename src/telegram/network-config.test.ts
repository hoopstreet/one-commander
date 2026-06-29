import { describe, expect, it } from "vitest";
import { resolveTelegramAutoSelectFamilyDecision } from "./network-config.js";

describe("resolveTelegramAutoSelectFamilyDecision", () => {
  it("prefers env enable over env disable", () => {
    const decision = resolveTelegramAutoSelectFamilyDecision({
      env: {
      },
      nodeMajor: 22,
    });
    expect(decision).toEqual({
      value: true,
    });
  });

  it("uses env disable when set", () => {
    const decision = resolveTelegramAutoSelectFamilyDecision({
      nodeMajor: 22,
    });
    expect(decision).toEqual({
      value: false,
    });
  });

  it("uses config override when provided", () => {
    const decision = resolveTelegramAutoSelectFamilyDecision({
      env: {},
      network: { autoSelectFamily: true },
      nodeMajor: 22,
    });
    expect(decision).toEqual({ value: true, source: "config" });
  });

  it("defaults to disable on Node 22", () => {
    const decision = resolveTelegramAutoSelectFamilyDecision({ env: {}, nodeMajor: 22 });
    expect(decision).toEqual({ value: false, source: "default-node22" });
  });

  it("returns null when no decision applies", () => {
    const decision = resolveTelegramAutoSelectFamilyDecision({ env: {}, nodeMajor: 20 });
    expect(decision).toEqual({ value: null });
  });
});
