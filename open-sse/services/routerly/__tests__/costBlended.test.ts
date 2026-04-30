import { describe, it, expect, afterEach } from "vitest";
import { computeBlendedCost } from "../scoring/costBlended";

describe("computeBlendedCost", () => {
  const originalEnv = process.env.ROUTERLY_BLENDED_COST;

  afterEach(() => {
    if (originalEnv === undefined) delete process.env.ROUTERLY_BLENDED_COST;
    else process.env.ROUTERLY_BLENDED_COST = originalEnv;
  });

  it("returns input price only when disabled", () => {
    process.env.ROUTERLY_BLENDED_COST = "false";
    expect(computeBlendedCost(3, 15)).toBe(3);
  });

  it("blends input and output cost with default ratio", () => {
    expect(computeBlendedCost(3, 15)).toBe(3 + 15 * 0.4);
  });

  it("uses custom output ratio", () => {
    expect(computeBlendedCost(3, 15, 0.6)).toBe(3 + 15 * 0.6);
  });

  it("handles zero output price", () => {
    expect(computeBlendedCost(5, 0)).toBe(5);
  });
});
