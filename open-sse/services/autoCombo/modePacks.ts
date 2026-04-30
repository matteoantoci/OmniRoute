/**
 * Mode Packs — Pre-defined weight profiles for Auto-Combo scoring.
 *
 * Each pack optimizes for a different priority:
 *   - ship-fast:       Prioritize latency and health
 *   - cost-saver:      Prioritize cost efficiency
 *   - quality-first:   Prioritize task fitness and stability
 *   - reasoning:       Prioritize task fitness, ignore latency (reasoning models are slow)
 *   - offline-friendly: Prioritize quota availability
 */

import type { ScoringWeights } from "./scoring";

export const MODE_PACKS: Record<string, ScoringWeights> = {
  "ship-fast": {
    quota: 0.1,
    health: 0.25,
    costInv: 0.05,
    latencyInv: 0.35,
    taskFit: 0.075,
    stability: 0.0,
    tierPriority: 0.05,
    stickiness: 0.125,
  },
  "cost-saver": {
    quota: 0.1,
    health: 0.15,
    costInv: 0.4,
    latencyInv: 0.05,
    taskFit: 0.075,
    stability: 0.05,
    tierPriority: 0.05,
    stickiness: 0.125,
  },
  "quality-first": {
    quota: 0.05,
    health: 0.15,
    costInv: 0.05,
    latencyInv: 0.05,
    taskFit: 0.425,
    stability: 0.15,
    tierPriority: 0.05,
    stickiness: 0.075,
  },
  reasoning: {
    quota: 0.15,
    health: 0.1,
    costInv: 0.15,
    latencyInv: 0.0,
    taskFit: 0.375,
    stability: 0.1,
    tierPriority: 0.05,
    stickiness: 0.075,
  },
  "offline-friendly": {
    quota: 0.35,
    health: 0.25,
    costInv: 0.1,
    latencyInv: 0.05,
    taskFit: 0.025,
    stability: 0.1,
    tierPriority: 0.05,
    stickiness: 0.075,
  },
};

/**
 * Get a mode pack by name, falling back to default weights.
 */
export function getModePack(name: string): ScoringWeights | undefined {
  return MODE_PACKS[name];
}

/**
 * Get all available mode pack names.
 */
export function getModePackNames(): string[] {
  return Object.keys(MODE_PACKS);
}
