const DECAY_HALF_LIFE_MS = 10 * 60 * 1000;

function isFeatureEnabled(): boolean {
  const val = process.env.ROUTERLY_BAYESIAN_HEALTH;
  return val == null || val === "true" || val === "1";
}

export class BayesianHealthTracker {
  private successes = 0;
  private failures = 0;
  private lastDecayAt: number;

  constructor() {
    this.lastDecayAt = Date.now();
  }

  private decay(): void {
    const now = Date.now();
    const elapsed = now - this.lastDecayAt;
    if (elapsed < 60_000) return;

    const halfLives = elapsed / DECAY_HALF_LIFE_MS;
    const factor = Math.pow(0.5, halfLives);
    this.successes *= factor;
    this.failures *= factor;
    this.lastDecayAt = now;
  }

  recordSuccess(): void {
    this.decay();
    this.successes += 1;
  }

  recordFailure(): void {
    this.decay();
    this.failures += 1;
  }

  getHealthScore(): number {
    if (!isFeatureEnabled()) return 1.0;
    this.decay();
    return (this.successes + 1) / (this.successes + this.failures + 2);
  }

  reset(): void {
    this.successes = 0;
    this.failures = 0;
    this.lastDecayAt = Date.now();
  }

  getStats(): { successes: number; failures: number; health: number } {
    return {
      successes: this.successes,
      failures: this.failures,
      health: this.getHealthScore(),
    };
  }
}
