import { describe, it, expect, afterEach } from "vitest";
import { getDiversityFactor } from "../scoring/diversity";
import { resetDiversity, recordProviderUsage } from "../../autoCombo/providerDiversity";

describe("getDiversityFactor", () => {
  const originalEnv = process.env.ROUTERLY_DIVERSITY;

  afterEach(() => {
    if (originalEnv === undefined) delete process.env.ROUTERLY_DIVERSITY;
    else process.env.ROUTERLY_DIVERSITY = originalEnv;
    resetDiversity();
  });

  it("returns 0.5 when feature is disabled", () => {
    process.env.ROUTERLY_DIVERSITY = "false";
    expect(getDiversityFactor("openai")).toBe(0.5);
  });

  it("returns higher boost for underrepresented provider", () => {
    process.env.ROUTERLY_DIVERSITY = "true";
    recordProviderUsage("openai");
    recordProviderUsage("openai");
    recordProviderUsage("openai");
    const openaiScore = getDiversityFactor("openai");
    const anthropicScore = getDiversityFactor("anthropic");
    expect(anthropicScore).toBeGreaterThan(openaiScore);
  });

  it("returns equal scores when all providers have same usage", () => {
    process.env.ROUTERLY_DIVERSITY = "true";
    recordProviderUsage("openai");
    recordProviderUsage("anthropic");
    expect(getDiversityFactor("openai")).toBeCloseTo(getDiversityFactor("anthropic"), 5);
  });
});
