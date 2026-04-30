import { describe, it, expect, afterEach } from "vitest";
import {
  warmStartAdaptation,
  recordAdaptationDecision,
  getAdaptationScore,
} from "../persistence/warmStart";

describe("Adaptation Warm Start", () => {
  const originalEnv = process.env.ROUTERLY_ADAPTATION;

  afterEach(() => {
    if (originalEnv === undefined) delete process.env.ROUTERLY_ADAPTATION;
    else process.env.ROUTERLY_ADAPTATION = originalEnv;
  });

  it("returns null when no adaptation state exists", () => {
    process.env.ROUTERLY_ADAPTATION = "true";
    expect(getAdaptationScore("combo-1", "openai")).toBeNull();
  });

  it("returns null when feature is disabled", () => {
    process.env.ROUTERLY_ADAPTATION = "false";
    expect(getAdaptationScore("combo-1", "openai")).toBeNull();
  });

  it("records and retrieves adaptation decisions", () => {
    process.env.ROUTERLY_ADAPTATION = "true";
    recordAdaptationDecision("combo-1", "openai", 0.8, false);
    const score = getAdaptationScore("combo-1", "openai");
    expect(score).not.toBeNull();
    expect(score!).toBeGreaterThan(0);
  });

  it("does not record when feature is disabled", () => {
    process.env.ROUTERLY_ADAPTATION = "false";
    recordAdaptationDecision("combo-1", "openai", 0.8, false);
    expect(getAdaptationScore("combo-1", "openai")).toBeNull();
  });
});
