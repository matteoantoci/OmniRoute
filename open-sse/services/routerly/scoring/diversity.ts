import { getProviderDiversityBoost } from "../../autoCombo/providerDiversity";

function isFeatureEnabled(): boolean {
  const val = process.env.ROUTERLY_DIVERSITY;
  return val == null || val === "true" || val === "1";
}

export function getDiversityFactor(provider: string): number {
  if (!isFeatureEnabled()) return 0.5;
  return getProviderDiversityBoost(provider);
}
