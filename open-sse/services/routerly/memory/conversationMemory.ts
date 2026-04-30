const TTL_MS = 60 * 60 * 1000;
const MAX_TURNS_PER_SESSION = 50;

export type ComplexityTier = "simple" | "standard" | "complex" | "reasoning";

const TIER_ORDER: Record<ComplexityTier, number> = {
  simple: 0,
  standard: 1,
  complex: 2,
  reasoning: 3,
};

type TurnRecord = {
  model: string;
  provider: string;
  timestamp: number;
  complexityTier: ComplexityTier;
};

type SessionRecord = {
  turns: TurnRecord[];
  lastActive: number;
  peakTier: ComplexityTier;
};

function isFeatureEnabled(): boolean {
  const val = process.env.ROUTERLY_CONVERSATION_MEMORY;
  return val == null || val === "true" || val === "1";
}

const sessions = new Map<string, SessionRecord>();

function cleanup(sessionId: string): void {
  const record = sessions.get(sessionId);
  if (!record) return;

  const cutoff = Date.now() - TTL_MS;
  record.turns = record.turns.filter((t) => t.timestamp > cutoff);
  if (record.turns.length === 0 && record.peakTier === "simple") {
    sessions.delete(sessionId);
  }
}

function cleanupExpired(): void {
  const cutoff = Date.now() - TTL_MS;
  for (const [id, record] of sessions) {
    if (record.lastActive < cutoff) {
      sessions.delete(id);
    }
  }
}

let lastCleanup = 0;
function maybeCleanup(): void {
  if (Date.now() - lastCleanup > 60_000) {
    cleanupExpired();
    lastCleanup = Date.now();
  }
}

export function recordConversationModel(
  sessionId: string,
  model: string,
  provider: string,
  tier?: ComplexityTier
): void {
  if (!isFeatureEnabled() || !sessionId) return;
  maybeCleanup();

  let record = sessions.get(sessionId);
  if (!record) {
    record = { turns: [], lastActive: Date.now(), peakTier: "simple" };
    sessions.set(sessionId, record);
  }

  const effectiveTier = tier || "standard";
  if (TIER_ORDER[effectiveTier] > TIER_ORDER[record.peakTier]) {
    record.peakTier = effectiveTier;
  }

  record.turns.push({ model, provider, timestamp: Date.now(), complexityTier: effectiveTier });
  if (record.turns.length > MAX_TURNS_PER_SESSION) {
    record.turns = record.turns.slice(-MAX_TURNS_PER_SESSION);
  }
  record.lastActive = Date.now();
}

export function getConversationModel(
  sessionId: string | null | undefined
): { model: string; provider: string } | null {
  if (!isFeatureEnabled() || !sessionId) return null;
  cleanup(sessionId);

  const record = sessions.get(sessionId);
  if (!record || record.turns.length === 0) return null;

  const last = record.turns[record.turns.length - 1];
  return { model: last.model, provider: last.provider };
}

export function recordSessionTier(
  sessionId: string,
  tier: ComplexityTier
): void {
  if (!isFeatureEnabled() || !sessionId) return;
  maybeCleanup();

  let record = sessions.get(sessionId);
  if (!record) {
    record = { turns: [], lastActive: Date.now(), peakTier: "simple" };
    sessions.set(sessionId, record);
  }

  if (TIER_ORDER[tier] > TIER_ORDER[record.peakTier]) {
    record.peakTier = tier;
  }
  record.lastActive = Date.now();
}

export function getSessionTier(
  sessionId: string | null | undefined
): ComplexityTier | null {
  if (!isFeatureEnabled() || !sessionId) return null;
  cleanup(sessionId);

  const record = sessions.get(sessionId);
  if (!record) return null;
  return record.peakTier;
}

export function getActiveSessionCount(): number {
  return sessions.size;
}

export function clearAll(): void {
  sessions.clear();
}
