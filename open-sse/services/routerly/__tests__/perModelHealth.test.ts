import { describe, it, expect, afterEach, beforeEach } from "vitest";
import {
  recordModelSuccess,
  recordModelFailure,
  getModelHealthScore,
  clearAll,
} from "../health/perModelHealth";

describe("PerModelHealth", () => {
  const originalEnv = process.env.ROUTERLY_PER_MODEL_HEALTH;

  beforeEach(() => {
    clearAll();
  });

  afterEach(() => {
    clearAll();
    if (originalEnv === undefined) delete process.env.ROUTERLY_PER_MODEL_HEALTH;
    else process.env.ROUTERLY_PER_MODEL_HEALTH = originalEnv;
  });

  it("returns null when insufficient observations", () => {
    recordModelSuccess("openai", "gpt-4");
    expect(getModelHealthScore("openai", "gpt-4")).toBeNull();
  });

  it("returns score after enough observations", () => {
    for (let i = 0; i < 5; i++) recordModelSuccess("openai", "gpt-4");
    const score = getModelHealthScore("openai", "gpt-4");
    expect(score).not.toBeNull();
    expect(score!).toBeGreaterThan(0);
    expect(score!).toBeLessThanOrEqual(1);
  });

  it("returns lower score after failures", () => {
    for (let i = 0; i < 5; i++) recordModelSuccess("openai", "gpt-4");
    const healthyScore = getModelHealthScore("openai", "gpt-4");
    for (let i = 0; i < 5; i++) recordModelFailure("openai", "gpt-4");
    const degradedScore = getModelHealthScore("openai", "gpt-4");
    expect(degradedScore!).toBeLessThan(healthyScore!);
  });

  it("tracks different models independently", () => {
    for (let i = 0; i < 5; i++) recordModelSuccess("openai", "gpt-4");
    for (let i = 0; i < 3; i++) recordModelFailure("openai", "gpt-3.5");
    for (let i = 0; i < 2; i++) recordModelSuccess("openai", "gpt-3.5");
    const gpt4Score = getModelHealthScore("openai", "gpt-4");
    const gpt35Score = getModelHealthScore("openai", "gpt-3.5");
    expect(gpt4Score).not.toBeNull();
    expect(gpt35Score).not.toBeNull();
    expect(gpt4Score!).toBeGreaterThan(gpt35Score!);
  });

  it("returns null when feature is disabled", () => {
    process.env.ROUTERLY_PER_MODEL_HEALTH = "false";
    for (let i = 0; i < 5; i++) recordModelSuccess("openai", "gpt-4");
    expect(getModelHealthScore("openai", "gpt-4")).toBeNull();
  });
});
