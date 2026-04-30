import { getConversationModel, getSessionTier } from "../memory/conversationMemory";
import type { ComplexityTier } from "../memory/conversationMemory";

function isFeatureEnabled(): boolean {
  const val = process.env.ROUTERLY_STICKINESS;
  return val == null || val === "true" || val === "1";
}

export function getStickinessFactor(
  sessionId: string,
  provider: string,
  model: string
): number {
  if (!isFeatureEnabled()) return 0;
  const record = getConversationModel(sessionId);
  if (!record) return 0;

  if (record.provider === provider && record.model === model) return 1.0;
  if (record.provider === provider) return 0.3;
  return 0;
}

export function deriveComplexityTier(signals: {
  agentic: boolean;
  reasoning: boolean;
  vision: boolean;
  complexCoding: boolean;
}): ComplexityTier {
  if (signals.reasoning) return "reasoning";
  if (signals.agentic || signals.complexCoding) return "complex";
  if (signals.vision) return "standard";
  return "simple";
}
