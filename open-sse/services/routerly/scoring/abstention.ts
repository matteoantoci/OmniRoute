import type { ProviderCandidate, ScoringWeights } from "../../autoCombo/scoring";

type FactorKey = keyof ScoringWeights;

function isFeatureEnabled(): boolean {
  const val = process.env.ROUTERLY_ABSTENTION;
  return val == null || val === "true" || val === "1";
}

function getNumericField(candidate: ProviderCandidate, key: FactorKey): number {
  switch (key) {
    case "quota":
      return candidate.quotaRemaining;
    case "health":
      return candidate.circuitBreakerState === "CLOSED"
        ? 1
        : candidate.circuitBreakerState === "HALF_OPEN"
          ? 0.5
          : 0;
    case "costInv":
      return candidate.costPer1MTokens > 0 ? 1 / candidate.costPer1MTokens : 0;
    case "latencyInv":
      return candidate.p95LatencyMs > 0 ? 1 / candidate.p95LatencyMs : 0;
    case "taskFit":
      return 0;
    case "stability":
      return 1 - candidate.errorRate;
    case "tierPriority":
      return 0;
    default:
      return 0;
  }
}

export function redistributeWeights(
  pool: ProviderCandidate[],
  weights: ScoringWeights
): ScoringWeights {
  if (!isFeatureEnabled() || pool.length <= 1) return weights;

  const keys = Object.keys(weights) as FactorKey[];
  const uniformKeys = new Set<FactorKey>();

  for (const key of keys) {
    if (weights[key] === 0) continue;

    const values = pool.map((c) => getNumericField(c, key));
    const first = values[0];
    // Only mark as uniform if values are identical AND at least one is non-zero.
    // All-zero means the dimension provides no signal (e.g., taskFit without context).
    if (values.every((v) => v === first) && first !== 0) {
      uniformKeys.add(key);
    }
  }

  if (uniformKeys.size === 0) return weights;

  const freedWeight = [...uniformKeys].reduce((sum, k) => sum + weights[k], 0);
  const discrimKeys = keys.filter((k) => !uniformKeys.has(k) && weights[k] > 0);
  if (discrimKeys.length === 0) return weights;

  const redistributed: ScoringWeights = { ...weights };
  for (const k of uniformKeys) {
    redistributed[k] = 0;
  }
  const perKey = freedWeight / discrimKeys.length;
  for (const k of discrimKeys) {
    redistributed[k] = weights[k] + perKey;
  }

  return redistributed;
}
