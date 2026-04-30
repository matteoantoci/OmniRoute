import { estimateTokens } from "../../contextManager";
import { getModelContextLimit } from "../../../../src/lib/modelCapabilities";

export type ContextFilterCandidate = {
  provider: string;
  model: string;
};

function isFeatureEnabled(): boolean {
  const val = process.env.ROUTERLY_CONTEXT_PREFILTER;
  return val == null || val === "true" || val === "1";
}

function estimateInputTokens(body: Record<string, unknown>): number {
  const messages = body.messages as Array<{ content?: unknown }> | undefined;
  const input = body.input as Array<{ content?: unknown }> | undefined;
  const system = body.system as unknown;

  let text = "";
  if (system) text += typeof system === "string" ? system : JSON.stringify(system);
  for (const m of messages ?? []) {
    if (typeof m.content === "string") text += m.content;
    else if (m.content) text += JSON.stringify(m.content);
  }
  for (const m of input ?? []) {
    if (typeof m.content === "string") text += m.content;
    else if (m.content) text += JSON.stringify(m.content);
  }
  return estimateTokens(text);
}

export function filterByContextWindow<T extends ContextFilterCandidate>(
  candidates: T[],
  body: Record<string, unknown>
): T[] {
  if (!isFeatureEnabled() || candidates.length <= 1) return candidates;

  const estimated = estimateInputTokens(body);
  if (estimated <= 0) return candidates;

  const filtered = candidates.filter((c) => {
    const limit = getModelContextLimit(c.provider, c.model);
    return limit == null || limit >= estimated;
  });

  return filtered.length > 0 ? filtered : candidates;
}
