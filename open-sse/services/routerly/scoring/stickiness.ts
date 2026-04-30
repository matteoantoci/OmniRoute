import { getConversationModel } from "../memory/conversationMemory";

function isFeatureEnabled(): boolean {
  const val = process.env.ROUTERLY_STICKINESS;
  return val == null || val === "true" || val === "1";
}

export function getStickinessFactor(sessionId: string, provider: string, model: string): number {
  if (!isFeatureEnabled()) return 0;
  const record = getConversationModel(sessionId);
  if (!record) return 0;
  return record.provider === provider && record.model === model ? 1.0 : 0.0;
}
