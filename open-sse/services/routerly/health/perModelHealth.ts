import { BayesianHealthTracker } from "./bayesian";

const MIN_OBSERVATIONS = 5;

function isFeatureEnabled(): boolean {
  const val = process.env.ROUTERLY_PER_MODEL_HEALTH;
  return val == null || val === "true" || val === "1";
}

function makeKey(provider: string, model: string): string {
  return `${provider}:${model}`;
}

const registry = new Map<string, BayesianHealthTracker>();

function getOrCreateTracker(provider: string, model: string): BayesianHealthTracker {
  const key = makeKey(provider, model);
  let tracker = registry.get(key);
  if (!tracker) {
    tracker = new BayesianHealthTracker();
    registry.set(key, tracker);
  }
  return tracker;
}

export function recordModelSuccess(provider: string, model: string): void {
  if (!isFeatureEnabled()) return;
  getOrCreateTracker(provider, model).recordSuccess();
}

export function recordModelFailure(provider: string, model: string): void {
  if (!isFeatureEnabled()) return;
  getOrCreateTracker(provider, model).recordFailure();
}

export function getModelHealthScore(provider: string, model: string): number | null {
  if (!isFeatureEnabled()) return null;
  const key = makeKey(provider, model);
  const tracker = registry.get(key);
  if (!tracker) return null;
  const stats = tracker.getStats();
  if (stats.successes + stats.failures < MIN_OBSERVATIONS) return null;
  return tracker.getHealthScore();
}

export function clearAll(): void {
  registry.clear();
}
