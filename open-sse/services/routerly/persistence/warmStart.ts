import {
  loadAdaptationState,
  listAdaptationStates,
  recordDecision,
} from "../../autoCombo/persistence";

function isFeatureEnabled(): boolean {
  const val = process.env.ROUTERLY_ADAPTATION;
  return val == null || val === "true" || val === "1";
}

let warmed = false;

export function warmStartAdaptation(): void {
  if (!isFeatureEnabled() || warmed) return;
  warmed = true;
  const states = listAdaptationStates();
  if (states.length === 0) return;
  // States are loaded into memory by listAdaptationStates() —
  // subsequent loadAdaptationState() calls will hit the cache.
}

export function recordAdaptationDecision(
  comboId: string,
  provider: string,
  score: number,
  wasExploration: boolean
): void {
  if (!isFeatureEnabled()) return;
  recordDecision(comboId, provider, score, wasExploration);
}

export function getAdaptationScore(comboId: string, provider: string): number | null {
  if (!isFeatureEnabled()) return null;
  const state = loadAdaptationState(comboId);
  if (!state || !(provider in state.providerScores)) return null;
  return state.providerScores[provider];
}
