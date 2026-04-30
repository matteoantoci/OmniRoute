import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { recordTtft, getEstimatedTtft, clearAll } from "../ttft/feedback";

describe("TTFT Feedback", () => {
  const originalEnv = process.env.ROUTERLY_TTFT_FEEDBACK;

  beforeEach(() => {
    clearAll();
  });

  afterEach(() => {
    clearAll();
    if (originalEnv === undefined) delete process.env.ROUTERLY_TTFT_FEEDBACK;
    else process.env.ROUTERLY_TTFT_FEEDBACK = originalEnv;
  });

  it("returns null with no data", () => {
    expect(getEstimatedTtft("openai", "gpt-4")).toBeNull();
  });

  it("returns null with fewer than 3 observations", () => {
    recordTtft("openai", "gpt-4", 200);
    recordTtft("openai", "gpt-4", 250);
    expect(getEstimatedTtft("openai", "gpt-4")).toBeNull();
  });

  it("returns EMA after 3 observations", () => {
    recordTtft("openai", "gpt-4", 200);
    recordTtft("openai", "gpt-4", 200);
    recordTtft("openai", "gpt-4", 200);
    const estimate = getEstimatedTtft("openai", "gpt-4");
    expect(estimate).not.toBeNull();
    expect(estimate!).toBeGreaterThan(100);
    expect(estimate!).toBeLessThan(300);
  });

  it("tracks different models independently", () => {
    for (let i = 0; i < 3; i++) recordTtft("openai", "gpt-4", 100);
    for (let i = 0; i < 3; i++) recordTtft("anthropic", "claude-3", 500);
    expect(getEstimatedTtft("openai", "gpt-4")!).toBeLessThan(
      getEstimatedTtft("anthropic", "claude-3")!
    );
  });

  it("does not record when feature is disabled", () => {
    process.env.ROUTERLY_TTFT_FEEDBACK = "false";
    recordTtft("openai", "gpt-4", 200);
    recordTtft("openai", "gpt-4", 200);
    recordTtft("openai", "gpt-4", 200);
    expect(getEstimatedTtft("openai", "gpt-4")).toBeNull();
  });
});
