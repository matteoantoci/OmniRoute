const DEFAULT_OUTPUT_RATIO = 0.4;

function isFeatureEnabled(): boolean {
  const val = process.env.ROUTERLY_BLENDED_COST;
  return val == null || val === "true" || val === "1";
}

export function computeBlendedCost(
  inputPrice: number,
  outputPrice: number,
  outputRatio: number = DEFAULT_OUTPUT_RATIO
): number {
  if (!isFeatureEnabled()) return inputPrice;
  return inputPrice + outputPrice * outputRatio;
}
