export interface OptimizationResult {
  body: Record<string, unknown>;
  applied: string[];
  tokensSaved: number;
}

function isFeatureEnabled(): boolean {
  const val = process.env.ROUTERLY_CONTEXT_OPTIMIZE;
  return val == null || val === "true" || val === "1";
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function minifyJsonInMessages(messages: Record<string, unknown>[]): number {
  let saved = 0;
  for (const msg of messages) {
    const content = msg.content;
    if (typeof content !== "string") continue;
    const trimmed = content.trim();
    if ((trimmed.startsWith("{") && trimmed.endsWith("}")) ||
        (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
      try {
        const parsed = JSON.parse(trimmed);
        const minified = JSON.stringify(parsed);
        if (minified.length < content.length) {
          saved += content.length - minified.length;
          msg.content = minified;
        }
      } catch {
        // Not valid JSON — skip
      }
    }
  }
  return saved;
}

function normalizeWhitespace(messages: Record<string, unknown>[]): number {
  let saved = 0;
  for (const msg of messages) {
    const content = msg.content;
    if (typeof content !== "string") continue;

    const normalized = content
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]+$/gm, "");

    if (normalized.length < content.length) {
      saved += content.length - normalized.length;
      msg.content = normalized;
    }
  }
  return saved;
}

function dedupSystemPrompts(messages: Record<string, unknown>[]): number {
  let saved = 0;
  const seen = new Set<string>();

  for (const msg of messages) {
    if (msg.role !== "system" && msg.role !== "developer") continue;
    const content = msg.content;
    if (typeof content !== "string") continue;

    const normalized = content.trim().toLowerCase();
    if (seen.has(normalized)) {
      saved += estimateTokens(content);
      msg.content = "";
    } else {
      seen.add(normalized);
    }
  }
  return saved;
}

function compactToolSchemas(tools: Record<string, unknown>[], threshold: number): number {
  if (tools.length <= threshold) return 0;

  let saved = 0;
  for (const tool of tools) {
    const fn = tool.function as Record<string, unknown> | undefined;
    if (!fn) continue;
    const params = fn.parameters as Record<string, unknown> | undefined;
    if (!params || typeof params !== "object") continue;
    const properties = params.properties as Record<string, Record<string, unknown>> | undefined;
    if (!properties) continue;

    for (const propName of Object.keys(properties)) {
      const prop = properties[propName];
      if (prop.description && typeof prop.description === "string") {
        saved += estimateTokens(prop.description);
        delete prop.description;
      }
    }
  }
  return saved;
}

export function optimizeContext(body: Record<string, unknown>): OptimizationResult {
  if (!isFeatureEnabled()) {
    return { body, applied: [], tokensSaved: 0 };
  }

  const applied: string[] = [];
  let totalSaved = 0;

  // Deep clone to avoid mutating the original
  const optimized = JSON.parse(JSON.stringify(body));
  const messages = optimized.messages as Record<string, unknown>[] | undefined;

  if (Array.isArray(messages)) {
    const jsonSaved = minifyJsonInMessages(messages);
    if (jsonSaved > 0) { applied.push("json_minify"); totalSaved += jsonSaved; }

    const wsSaved = normalizeWhitespace(messages);
    if (wsSaved > 0) { applied.push("whitespace_normalize"); totalSaved += wsSaved; }

    const sysSaved = dedupSystemPrompts(messages);
    if (sysSaved > 0) { applied.push("system_dedup"); totalSaved += sysSaved; }
  }

  const tools = optimized.tools as Record<string, unknown>[] | undefined;
  if (Array.isArray(tools)) {
    const toolSaved = compactToolSchemas(tools, 10);
    if (toolSaved > 0) { applied.push("tool_compact"); totalSaved += toolSaved; }
  }

  totalSaved = Math.ceil(totalSaved / 4);
  return { body: optimized, applied, tokensSaved: totalSaved };
}
