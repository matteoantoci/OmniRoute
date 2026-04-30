const TTL_MS = 60 * 60 * 1000;
const MAX_TURNS_PER_SESSION = 50;

type TurnRecord = {
  model: string;
  provider: string;
  timestamp: number;
};

type SessionRecord = {
  turns: TurnRecord[];
  lastActive: number;
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
  if (record.turns.length === 0) {
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
  provider: string
): void {
  if (!isFeatureEnabled() || !sessionId) return;
  maybeCleanup();

  let record = sessions.get(sessionId);
  if (!record) {
    record = { turns: [], lastActive: Date.now() };
    sessions.set(sessionId, record);
  }

  record.turns.push({ model, provider, timestamp: Date.now() });
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

export function getActiveSessionCount(): number {
  return sessions.size;
}

export function clearAll(): void {
  sessions.clear();
}
