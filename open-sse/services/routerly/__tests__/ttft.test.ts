import { describe, it, expect, afterEach } from "vitest";
import { createTtftTracker } from "../ttft/measure";

describe("createTtftTracker", () => {
  const originalEnv = process.env.ROUTERLY_TTFT;

  afterEach(() => {
    if (originalEnv === undefined) delete process.env.ROUTERLY_TTFT;
    else process.env.ROUTERLY_TTFT = originalEnv;
  });

  it("returns null ttft before any content is recorded", () => {
    const startedAt = Date.now();
    const tracker = createTtftTracker(startedAt);
    expect(tracker.getTtft()).toBeNull();
  });

  it("returns ttft after recording content", () => {
    const startedAt = Date.now() - 100;
    const tracker = createTtftTracker(startedAt);
    tracker.recordContent();
    const ttft = tracker.getTtft();
    expect(ttft).not.toBeNull();
    expect(ttft!).toBeGreaterThanOrEqual(100);
  });

  it("records only the first content event", () => {
    const startedAt = Date.now() - 200;
    const tracker = createTtftTracker(startedAt);
    tracker.recordContent();
    const firstTtft = tracker.getTtft();
    tracker.recordContent();
    expect(tracker.getTtft()).toBe(firstTtft);
  });

  it("returns null when feature is disabled", () => {
    process.env.ROUTERLY_TTFT = "false";
    const startedAt = Date.now() - 100;
    const tracker = createTtftTracker(startedAt);
    tracker.recordContent();
    expect(tracker.getTtft()).toBeNull();
  });
});
