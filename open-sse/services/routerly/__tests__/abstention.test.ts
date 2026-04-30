import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { redistributeWeights } from "../scoring/abstention";
import type { ProviderCandidate, ScoringWeights } from "../../autoCombo/scoring";

const BASE_WEIGHTS: ScoringWeights = {
  taskFit: 0.35,
  health: 0.2,
  quota: 0.15,
  costInv: 0.15,
  latencyInv: 0.05,
  stability: 0.05,
  tierPriority: 0.05,
};

function makeCandidate(overrides: Partial<ProviderCandidate> = {}): ProviderCandidate {
  return {
    provider: "test",
    model: "test-model",
    quotaRemaining: 80,
    quotaTotal: 100,
    circuitBreakerState: "CLOSED",
    costPer1MTokens: 1,
    p95LatencyMs: 500,
    latencyStdDev: 50,
    errorRate: 0.05,
    ...overrides,
  };
}

describe("redistributeWeights", () => {
  const originalEnv = process.env.ROUTERLY_ABSTENTION;

  afterEach(() => {
    if (originalEnv === undefined) delete process.env.ROUTERLY_ABSTENTION;
    else process.env.ROUTERLY_ABSTENTION = originalEnv;
  });

  it("returns weights unchanged when pool has only one candidate", () => {
    const pool = [makeCandidate()];
    const result = redistributeWeights(pool, BASE_WEIGHTS);
    expect(result).toEqual(BASE_WEIGHTS);
  });

  it("preserves total weight at 1.0 after redistribution", () => {
    const pool = [
      makeCandidate({ quotaRemaining: 80, circuitBreakerState: "CLOSED", costPer1MTokens: 3, p95LatencyMs: 500, errorRate: 0.05 }),
      makeCandidate({ quotaRemaining: 80, circuitBreakerState: "CLOSED", costPer1MTokens: 5, p95LatencyMs: 200, errorRate: 0.1 }),
    ];
    const result = redistributeWeights(pool, BASE_WEIGHTS);
    const sum = Object.values(result).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0, 5);
  });

  it("redistributes weight from uniform cost dimension", () => {
    const pool = [
      makeCandidate({ costPer1MTokens: 3, p95LatencyMs: 500 }),
      makeCandidate({ costPer1MTokens: 3, p95LatencyMs: 200 }),
    ];
    const result = redistributeWeights(pool, BASE_WEIGHTS);
    expect(result.costInv).toBe(0);
    const sum = Object.values(result).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0, 5);
  });

  it("redistributes from multiple uniform dimensions", () => {
    const pool = [
      makeCandidate({ costPer1MTokens: 3, p95LatencyMs: 500 }),
      makeCandidate({ costPer1MTokens: 3, p95LatencyMs: 500 }),
    ];
    const result = redistributeWeights(pool, BASE_WEIGHTS);
    expect(result.costInv).toBe(0);
    expect(result.latencyInv).toBe(0);
    const sum = Object.values(result).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0, 5);
  });

  it("returns weights unchanged when feature is disabled", () => {
    process.env.ROUTERLY_ABSTENTION = "false";
    const pool = [
      makeCandidate({ costPer1MTokens: 3 }),
      makeCandidate({ costPer1MTokens: 3 }),
    ];
    const result = redistributeWeights(pool, BASE_WEIGHTS);
    expect(result).toEqual(BASE_WEIGHTS);
  });
});
