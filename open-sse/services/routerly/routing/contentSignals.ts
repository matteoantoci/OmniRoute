export type ContentSignalType = "agentic" | "reasoning" | "vision" | "complex_coding";

export interface ContentSignals {
  agentic: boolean;
  reasoning: boolean;
  vision: boolean;
  complexCoding: boolean;
  dominantSignal: ContentSignalType | null;
}

function isFeatureEnabled(): boolean {
  const val = process.env.ROUTERLY_CONTENT_SIGNALS;
  return val == null || val === "true" || val === "1";
}

const AGENTIC_SYSTEM_KEYWORDS = [
  "autonomous", "agent", "tool-use", "agentic", "loop until", "iterate",
  "you have access to the following tools", "available tools",
  "use the tools", "function calling",
];

const REASONING_KEYWORDS_ZH = [
  "逐步推理", "思维过程", "深度思考", "分析推理", "逻辑推理",
];

const CODE_EDIT_TOOL_PATTERNS = [
  "edit", "write", "create", "replace", "apply", "update",
];

const CODE_READ_TOOL_PATTERNS = [
  "read", "cat", "view", "inspect", "search", "grep", "glob", "list",
];

const CODE_EXEC_TOOL_PATTERNS = [
  "bash", "exec", "run", "shell", "terminal", "command",
];

function getSystemPrompt(body: Record<string, unknown>): string {
  const messages = body.messages;
  if (!Array.isArray(messages)) return "";
  for (const msg of messages) {
    if (msg.role === "system" || msg.role === "developer") {
      return typeof msg.content === "string" ? msg.content.toLowerCase() : "";
    }
  }
  return "";
}

function getToolNames(body: Record<string, unknown>): string[] {
  const tools = body.tools;
  if (!Array.isArray(tools)) return [];
  return tools.map((t: Record<string, unknown>) => {
    const fn = t.function as Record<string, string> | undefined;
    return (fn?.name || "").toLowerCase();
  });
}

function countToolCallCycles(messages: Record<string, unknown>[]): number {
  let cycles = 0;
  let inAssistantToolCall = false;

  for (const msg of messages) {
    if (msg.role === "assistant" && Array.isArray(msg.tool_calls) && msg.tool_calls.length > 0) {
      inAssistantToolCall = true;
    } else if (inAssistantToolCall && (msg.role === "tool" || msg.role === "user")) {
      cycles++;
      inAssistantToolCall = false;
    }
  }
  return cycles;
}

function hasReasoningParams(body: Record<string, unknown>): boolean {
  if (body.reasoning_effort != null) return true;
  if (body.thinking != null) return true;
  if (body.thinking_budget != null) return true;
  return false;
}

function scanForReasoningKeywords(messages: Record<string, unknown>[]): boolean {
  const allKeywords = [
    "step by step", "chain of thought", "reasoning", "prove", "theorem",
    "mathematical", "logically", "deduce", "infer", "hypothesis",
    ...REASONING_KEYWORDS_ZH,
  ];

  for (const msg of messages) {
    const content = msg.content;
    if (typeof content !== "string") continue;
    const lower = content.toLowerCase();
    for (const kw of allKeywords) {
      if (lower.includes(kw)) return true;
    }
  }
  return false;
}

function hasImageContent(messages: Record<string, unknown>[]): boolean {
  for (const msg of messages) {
    const content = msg.content;
    if (typeof content === "string") {
      if (content.includes("data:image")) return true;
      continue;
    }
    if (!Array.isArray(content)) continue;
    for (const part of content as Record<string, unknown>[]) {
      if (part.type === "image_url" || part.type === "image") return true;
      if (typeof part.image_url === "object" && part.image_url !== null) return true;
    }
  }
  return false;
}

function hasComplexCodingSignals(
  toolNames: string[],
  messages: Record<string, unknown>[]
): boolean {
  const editTools = toolNames.filter((n) =>
    CODE_EDIT_TOOL_PATTERNS.some((p) => n.includes(p))
  );
  if (editTools.length >= 3) return true;

  const hasReadTool = toolNames.some((n) =>
    CODE_READ_TOOL_PATTERNS.some((p) => n.includes(p))
  );
  const hasEditTool = editTools.length > 0;
  const hasExecTool = toolNames.some((n) =>
    CODE_EXEC_TOOL_PATTERNS.some((p) => n.includes(p))
  );
  if (hasReadTool && hasEditTool && hasExecTool) return true;

  for (const msg of messages) {
    const content = msg.content;
    if (typeof content !== "string") continue;
    const codeFenceCount = (content.match(/```/g) || []).length;
    if (codeFenceCount >= 2) {
      const betweenFences = content.split("```");
      for (let i = 1; i < betweenFences.length; i += 2) {
        if (betweenFences[i].length > 2000) return true;
      }
    }
  }
  return false;
}

export function detectContentSignals(body: Record<string, unknown>): ContentSignals {
  if (!isFeatureEnabled()) {
    return { agentic: false, reasoning: false, vision: false, complexCoding: false, dominantSignal: null };
  }

  const messages = Array.isArray(body.messages) ? body.messages as Record<string, unknown>[] : [];
  const systemPrompt = getSystemPrompt(body);
  const toolNames = getToolNames(body);

  const hasTools = toolNames.length >= 3;
  const hasCycles = countToolCallCycles(messages) >= 2;
  const hasAgenticKeywords = AGENTIC_SYSTEM_KEYWORDS.some((kw) => systemPrompt.includes(kw));
  const agentic = hasTools || hasCycles || hasAgenticKeywords;

  const reasoning = hasReasoningParams(body) || scanForReasoningKeywords(messages);
  const vision = hasImageContent(messages);
  const complexCoding = hasComplexCodingSignals(toolNames, messages);

  let dominantSignal: ContentSignalType | null = null;
  if (vision) dominantSignal = "vision";
  else if (agentic) dominantSignal = "agentic";
  else if (complexCoding) dominantSignal = "complex_coding";
  else if (reasoning) dominantSignal = "reasoning";

  return { agentic, reasoning, vision, complexCoding, dominantSignal };
}

export function contentSignalsToTaskType(signals: ContentSignals): string | null {
  if (signals.vision) return "vision";
  if (signals.agentic) return "agentic";
  if (signals.complexCoding) return "complex_coding";
  if (signals.reasoning) return "reasoning";
  return null;
}
