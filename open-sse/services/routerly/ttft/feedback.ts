const ALPHA = 0.2;
const MIN_OBSERVATIONS = 3;

interface EmaEntry {
  ema: number;
  n: number;
}

function isFeatureEnabled(): boolean {
  const val = process.env.ROUTERLY_TTFT_FEEDBACK;
  return val == null || val === "true" || val === "1";
}

function makeKey(provider: string, model: string): string {
  return `${provider}:${model}`;
}

const store = new Map<string, EmaEntry>();

export function recordTtft(provider: string, model: string, ttftMs: number): void {
  if (!isFeatureEnabled()) return;
  const key = makeKey(provider, model);
  const entry = store.get(key);
  if (!entry) {
    store.set(key, { ema: ttftMs, n: 1 });
  } else {
    entry.ema = ALPHA * ttftMs + (1 - ALPHA) * entry.ema;
    entry.n++;
  }
}

export function getEstimatedTtft(provider: string, model: string): number | null {
  const key = makeKey(provider, model);
  const entry = store.get(key);
  if (!entry || entry.n < MIN_OBSERVATIONS) return null;
  return entry.ema;
}

export function clearAll(): void {
  store.clear();
}
