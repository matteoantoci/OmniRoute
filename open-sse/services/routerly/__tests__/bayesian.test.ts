import { describe, it, expect, afterEach } from "vitest";
import { BayesianHealthTracker } from "../health/bayesian";

describe("BayesianHealthTracker", () => {
  const originalEnv = process.env.ROUTERLY_BAYESIAN_HEALTH;

  afterEach(() => {
    if (originalEnv === undefined) delete process.env.ROUTERLY_BAYESIAN_HEALTH;
    else process.env.ROUTERLY_BAYESIAN_HEALTH = originalEnv;
  });

  it("starts with Laplace-smoothed baseline of 0.5", () => {
    const tracker = new BayesianHealthTracker();
    expect(tracker.getHealthScore()).toBeCloseTo(0.5, 5);
  });

  it("increases health after successes", () => {
    const tracker = new BayesianHealthTracker();
    tracker.recordSuccess();
    tracker.recordSuccess();
    tracker.recordSuccess();
    expect(tracker.getHealthScore()).toBeGreaterThan(0.5);
  });

  it("decreases health after failures", () => {
    const tracker = new BayesianHealthTracker();
    tracker.recordFailure();
    tracker.recordFailure();
    tracker.recordFailure();
    expect(tracker.getHealthScore()).toBeLessThan(0.5);
  });

  it("health stays between 0 and 1", () => {
    const tracker = new BayesianHealthTracker();
    for (let i = 0; i < 100; i++) tracker.recordFailure();
    expect(tracker.getHealthScore()).toBeGreaterThan(0);
    expect(tracker.getHealthScore()).toBeLessThan(1);
  });

  it("reset clears all history", () => {
    const tracker = new BayesianHealthTracker();
    tracker.recordFailure();
    tracker.recordFailure();
    tracker.reset();
    expect(tracker.getHealthScore()).toBeCloseTo(0.5, 5);
  });

  it("getStats returns expected shape", () => {
    const tracker = new BayesianHealthTracker();
    tracker.recordSuccess();
    const stats = tracker.getStats();
    expect(stats.successes).toBe(1);
    expect(stats.failures).toBe(0);
    expect(stats.health).toBeGreaterThan(0.5);
  });

  it("returns 1.0 when feature is disabled", () => {
    process.env.ROUTERLY_BAYESIAN_HEALTH = "false";
    const tracker = new BayesianHealthTracker();
    tracker.recordFailure();
    tracker.recordFailure();
    expect(tracker.getHealthScore()).toBe(1.0);
  });
});
