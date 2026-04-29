/**
 * Task Fitness Lookup Table
 *
 * Maps model patterns × task types → fitness score [0..1].
 * Supports wildcards and prefix matching.
 *
 * Scoring calibrated against:
 * - Artificial Analysis indices (Apr 2026): Intelligence v4.0, Coding
 */

const FITNESS_TABLE: Record<string, Record<string, number>> = {
  coding: {
    // ── AA Coding Index (Apr 2026) ───────────────────────────────────────
    "gpt-5.5": 0.94, // AA Coding #1 (59)
    "gpt-5.4-mini": 0.9, // AA Coding #5 (51) — must be before gpt-5.4
    "gpt-5.4": 0.93, // AA Coding #2 (57)
    "gemini-3.1-pro": 0.92, // AA Coding #3 (56)
    "gemini-3-pro": 0.92,
    "claude-opus-4.7": 0.91, // AA Coding #4 (53)
    "claude-opus-4-7": 0.91,
    "claude-sonnet-4.6": 0.9, // AA Coding #5 (51)
    "claude-sonnet-4-6": 0.9,
    "muse-spark": 0.8, // AA Coding #7 (47)
    "deepseek-v4-pro": 0.8, // AA Coding #7 (47)
    "deepseek-v4-flash": 0.68, // AA Coding #17 (39) — before deepseek-v4
    "deepseek-v4": 0.8,
    "kimi-k2.6": 0.8, // AA Coding #7 (47)
    "mimo-v2.5-pro": 0.79, // AA Coding #10 (46)
    "mimo-v2-5-pro": 0.79,
    "qwen3.6": 0.78, // AA Coding #11 (45)
    "glm-5.1": 0.75, // AA Coding #12 (43)
    "gemini-3-flash": 0.75, // AA Coding #12 (43)
    "gemini-3.1-flash": 0.75,
    "minimax-m2.7": 0.74, // AA Coding #14 (42)
    "qwen-3.5": 0.73, // AA Coding #15 (41)
    "qwen3.5": 0.73,
    "grok-4.2": 0.72, // AA Coding #16 (40)
    "grok-4.20": 0.72,
    "gemma-4": 0.68, // AA Coding #17 (39)
    "deepseek-v3.2": 0.66, // AA Coding #19 (37)
    "claude-haiku-4.5": 0.6, // AA Coding #20 (33)
    "claude-haiku-4-5": 0.6,
    "claude-haiku": 0.58,
    "nemotron-3": 0.58, // AA Coding #21 (31)
    "nova-2-pro": 0.57, // AA Coding #22 (30)
    "mistral-small-4": 0.46, // AA Coding #24 (24)
    // ── Not in AA — conservative estimates ──────────────────────────────
    codex: 0.96,
    o3: 0.92,
    o1: 0.9,
    "claude-opus-4.6": 0.88,
    "claude-opus-4-6": 0.88,
    "claude-opus": 0.87,
    "claude-sonnet-4.5": 0.86,
    "claude-sonnet-4-5": 0.86,
    "claude-sonnet": 0.85,
    "deepseek-r2": 0.88,
    "deepseek-coder": 0.88,
    "deepseek-r1": 0.84,
    "gemini-2.5-pro": 0.84,
    "gpt-5.2": 0.88,
    "gpt-5.1": 0.86,
    "gpt-5": 0.82,
    "gpt-4o": 0.7,
    "gemini-pro": 0.8,
    "gemini-2.5-flash": 0.76,
    "gemini-flash": 0.72,
    "gemini-2.0-flash": 0.72,
    "glm-5": 0.73,
    "glm-5-turbo": 0.73,
    "glm-4.7": 0.68,
    "glm-4.5": 0.66,
    qwen: 0.73,
    "minimax-m2.5": 0.7,
    "minimax-m2": 0.6,
    "kimi-k2.5": 0.68,
    "kimi-k2": 0.5,
    "mimo-v2.5": 0.65,
    "mimo-v2-5": 0.65,
    "grok-4": 0.62,
    "grok-4-fast": 0.6,
    "grok-3": 0.6,
    "nova-pro-v2": 0.57,
    llama: 0.48,
    mistral: 0.5,
    mixtral: 0.48,
  },
  review: {
    // ── AA Intelligence Index v4.0 (Apr 2026) ────────────────────────────
    "gpt-5.5": 0.95, // AA Intelligence #1 (60)
    "claude-opus-4.7": 0.93, // AA Intelligence #2 (57)
    "claude-opus-4-7": 0.93,
    "gemini-3.1-pro": 0.93, // AA Intelligence #2 (57)
    "gemini-3-pro": 0.93,
    "gpt-5.4": 0.93, // AA Intelligence #2 (57)
    "kimi-k2.6": 0.88, // AA Intelligence #5 (54)
    "mimo-v2.5-pro": 0.88, // AA Intelligence #5 (54)
    "mimo-v2-5-pro": 0.88,
    "muse-spark": 0.86, // AA Intelligence #7 (52)
    "qwen3.6": 0.86, // AA Intelligence #7 (52)
    "claude-sonnet-4.6": 0.86, // AA Intelligence #7 (52)
    "claude-sonnet-4-6": 0.86,
    "deepseek-v4-pro": 0.86, // AA Intelligence #7 (52)
    "deepseek-v4-flash": 0.8, // AA Intelligence #15 (47) — before deepseek-v4
    "deepseek-v4": 0.86,
    "glm-5.1": 0.84, // AA Intelligence #11 (51)
    "minimax-m2.7": 0.83, // AA Intelligence #12 (50)
    "grok-4.2": 0.82, // AA Intelligence #13 (49)
    "grok-4.20": 0.82,
    "gpt-5.4-mini": 0.82, // AA Intelligence #14 (49)
    "gemini-3-flash": 0.79, // AA Intelligence #16 (46)
    "gemini-3.1-flash": 0.79,
    "qwen-3.5": 0.77, // AA Intelligence #17 (45)
    "qwen3.5": 0.77,
    "deepseek-v3.2": 0.74, // AA Intelligence #18 (42)
    "gemma-4": 0.68, // AA Intelligence #19 (39)
    "claude-haiku-4.5": 0.66, // AA Intelligence #20 (37)
    "claude-haiku-4-5": 0.66,
    "claude-haiku": 0.62,
    "nemotron-3": 0.65, // AA Intelligence #21 (36)
    "nova-2-pro": 0.65, // AA Intelligence #21 (36)
    "mistral-small-4": 0.52, // AA Intelligence #24 (28)
    // ── Not in AA ──────────────────────────────────────────────────────
    "claude-opus-4.6": 0.91,
    "claude-opus-4-6": 0.91,
    "claude-opus": 0.91,
    "claude-sonnet-4.5": 0.84,
    "claude-sonnet-4-5": 0.84,
    "claude-sonnet": 0.84,
    o3: 0.92,
    o1: 0.9,
    "deepseek-r2": 0.86,
    "deepseek-r1": 0.84,
    "deepseek-coder": 0.8,
    "gemini-2.5-pro": 0.88,
    "gemini-pro": 0.84,
    "gemini-2.5-flash": 0.78,
    "gemini-flash": 0.74,
    "gemini-2.0-flash": 0.74,
    "gpt-5.2": 0.9,
    "gpt-5.1": 0.88,
    "gpt-5": 0.84,
    "gpt-4o": 0.74,
    "glm-5": 0.8,
    "glm-5-turbo": 0.8,
    "glm-4.7": 0.72,
    "glm-4.5": 0.68,
    qwen: 0.77,
    "minimax-m2.5": 0.78,
    "minimax-m2": 0.64,
    "kimi-k2.5": 0.72,
    "kimi-k2": 0.54,
    "mimo-v2.5": 0.78,
    "mimo-v2-5": 0.78,
    "grok-4": 0.64,
    "grok-4-fast": 0.62,
    "grok-3": 0.62,
    "nova-pro-v2": 0.65,
    llama: 0.48,
    mistral: 0.52,
    mixtral: 0.5,
    codex: 0.82,
  },
  planning: {
    // ── AA Intelligence Index v4.0 (Apr 2026) ────────────────────────────
    // Differentiated by omniscience: hallucination-prone models penalized.
    "gpt-5.5": 0.95, // AA Intelligence #1 (60)
    "claude-opus-4.7": 0.93, // AA Intelligence #2 (57)
    "claude-opus-4-7": 0.93,
    "gemini-3.1-pro": 0.93, // AA Intelligence #2 (57)
    "gemini-3-pro": 0.93,
    "gpt-5.4": 0.93, // AA Intelligence #2 (57)
    "kimi-k2.6": 0.90, // AA Intelligence #5 (54) — boosted: high omniscience (+6)
    "mimo-v2.5-pro": 0.86, // AA Intelligence #5 (54) — lowered: moderate omniscience (4)
    "mimo-v2-5-pro": 0.86,
    "muse-spark": 0.86, // AA Intelligence #7 (52)
    "qwen3.6": 0.89, // AA Intelligence #7 (52) — boosted: best omniscience (+10)
    "claude-sonnet-4.6": 0.86, // AA Intelligence #7 (52)
    "claude-sonnet-4-6": 0.86,
    "deepseek-v4-pro": 0.75, // AA Intelligence #7 (52) — punished: severe omniscience deficit (-10)
    "deepseek-v4-flash": 0.8, // AA Intelligence #15 (47)
    "deepseek-v4": 0.75,
    "glm-5.1": 0.84, // AA Intelligence #11 (51)
    "minimax-m2.7": 0.83, // AA Intelligence #12 (50)
    "grok-4.2": 0.82, // AA Intelligence #13 (49)
    "grok-4.20": 0.82,
    "gpt-5.4-mini": 0.82, // AA Intelligence #14 (49)
    "gemini-3-flash": 0.79, // AA Intelligence #16 (46)
    "gemini-3.1-flash": 0.79,
    "qwen-3.5": 0.77, // AA Intelligence #17 (45)
    "qwen3.5": 0.77,
    "deepseek-v3.2": 0.74, // AA Intelligence #18 (42)
    "gemma-4": 0.68, // AA Intelligence #19 (39)
    "claude-haiku-4.5": 0.66, // AA Intelligence #20 (37)
    "claude-haiku-4-5": 0.66,
    "claude-haiku": 0.62,
    "nemotron-3": 0.65, // AA Intelligence #21 (36)
    "nova-2-pro": 0.65, // AA Intelligence #21 (36)
    "mistral-small-4": 0.52, // AA Intelligence #24 (28)
    // ── Not in AA ──────────────────────────────────────────────────────
    "claude-opus-4.6": 0.91,
    "claude-opus-4-6": 0.91,
    "claude-opus": 0.91,
    "claude-sonnet-4.5": 0.84,
    "claude-sonnet-4-5": 0.84,
    "claude-sonnet": 0.84,
    o3: 0.92,
    o1: 0.9,
    "deepseek-r2": 0.86,
    "deepseek-r1": 0.84,
    "deepseek-coder": 0.78,
    "gemini-2.5-pro": 0.88,
    "gemini-pro": 0.84,
    "gemini-2.5-flash": 0.78,
    "gemini-flash": 0.74,
    "gemini-2.0-flash": 0.74,
    "gpt-5.2": 0.9,
    "gpt-5.1": 0.88,
    "gpt-5": 0.84,
    "gpt-4o": 0.74,
    "glm-5": 0.8,
    "glm-5-turbo": 0.8,
    "glm-4.7": 0.72,
    "glm-4.5": 0.68,
    qwen: 0.77,
    "minimax-m2.5": 0.78,
    "minimax-m2": 0.64,
    "kimi-k2.5": 0.72,
    "kimi-k2": 0.54,
    "mimo-v2.5": 0.78,
    "mimo-v2-5": 0.78,
    "grok-4": 0.64,
    "grok-4-fast": 0.62,
    "grok-3": 0.62,
    "nova-pro-v2": 0.65,
    llama: 0.48,
    mistral: 0.52,
    mixtral: 0.5,
    codex: 0.8,
  },
  analysis: {
    // ── AA Intelligence Index v4.0 (Apr 2026) ────────────────────────────
    "gpt-5.5": 0.95, // AA Intelligence #1 (60)
    "claude-opus-4.7": 0.93, // AA Intelligence #2 (57)
    "claude-opus-4-7": 0.93,
    "gemini-3.1-pro": 0.93, // AA Intelligence #2 (57)
    "gemini-3-pro": 0.93,
    "gpt-5.4": 0.93, // AA Intelligence #2 (57)
    "kimi-k2.6": 0.88, // AA Intelligence #5 (54)
    "mimo-v2.5-pro": 0.88, // AA Intelligence #5 (54)
    "mimo-v2-5-pro": 0.88,
    "muse-spark": 0.86, // AA Intelligence #7 (52)
    "qwen3.6": 0.86, // AA Intelligence #7 (52)
    "claude-sonnet-4.6": 0.86, // AA Intelligence #7 (52)
    "claude-sonnet-4-6": 0.86,
    "deepseek-v4-pro": 0.86, // AA Intelligence #7 (52)
    "deepseek-v4-flash": 0.8, // AA Intelligence #15 (47) — before deepseek-v4
    "deepseek-v4": 0.86,
    "glm-5.1": 0.84, // AA Intelligence #11 (51)
    "minimax-m2.7": 0.83, // AA Intelligence #12 (50)
    "grok-4.2": 0.82, // AA Intelligence #13 (49)
    "grok-4.20": 0.82,
    "gpt-5.4-mini": 0.82, // AA Intelligence #14 (49)
    "gemini-3-flash": 0.79, // AA Intelligence #16 (46)
    "gemini-3.1-flash": 0.79,
    "qwen-3.5": 0.77, // AA Intelligence #17 (45)
    "qwen3.5": 0.77,
    "deepseek-v3.2": 0.74, // AA Intelligence #18 (42)
    "gemma-4": 0.68, // AA Intelligence #19 (39)
    "claude-haiku-4.5": 0.66, // AA Intelligence #20 (37)
    "claude-haiku-4-5": 0.66,
    "claude-haiku": 0.62,
    "nemotron-3": 0.65, // AA Intelligence #21 (36)
    "nova-2-pro": 0.65, // AA Intelligence #21 (36)
    "mistral-small-4": 0.52, // AA Intelligence #24 (28)
    // ── Not in AA ──────────────────────────────────────────────────────
    "claude-opus-4.6": 0.91,
    "claude-opus-4-6": 0.91,
    "claude-opus": 0.91,
    "claude-sonnet-4.5": 0.84,
    "claude-sonnet-4-5": 0.84,
    "claude-sonnet": 0.84,
    o3: 0.92,
    o1: 0.9,
    "deepseek-r2": 0.86,
    "deepseek-r1": 0.84,
    "deepseek-coder": 0.78,
    "gemini-2.5-pro": 0.88,
    "gemini-pro": 0.84,
    "gemini-2.5-flash": 0.78,
    "gemini-flash": 0.74,
    "gemini-2.0-flash": 0.74,
    "gpt-5.2": 0.9,
    "gpt-5.1": 0.88,
    "gpt-5": 0.84,
    "gpt-4o": 0.74,
    "glm-5": 0.8,
    "glm-5-turbo": 0.8,
    "glm-4.7": 0.72,
    "glm-4.5": 0.68,
    qwen: 0.77,
    "minimax-m2.5": 0.78,
    "minimax-m2": 0.64,
    "kimi-k2.5": 0.72,
    "kimi-k2": 0.54,
    "mimo-v2.5": 0.78,
    "mimo-v2-5": 0.78,
    "grok-4": 0.64,
    "grok-4-fast": 0.62,
    "grok-3": 0.62,
    "nova-pro-v2": 0.65,
    llama: 0.48,
    mistral: 0.52,
    mixtral: 0.5,
    codex: 0.8,
  },
  debugging: {
    // ── AA Coding Index (Apr 2026) — debugging is a coding subtask ───────
    "gpt-5.5": 0.94, // AA Coding #1 (59)
    "gpt-5.4-mini": 0.9, // AA Coding #5 (51) — must be before gpt-5.4
    "gpt-5.4": 0.93, // AA Coding #2 (57)
    "gemini-3.1-pro": 0.92, // AA Coding #3 (56)
    "gemini-3-pro": 0.92,
    "claude-opus-4.7": 0.91, // AA Coding #4 (53)
    "claude-opus-4-7": 0.91,
    "claude-sonnet-4.6": 0.9, // AA Coding #5 (51)
    "claude-sonnet-4-6": 0.9,
    "muse-spark": 0.8, // AA Coding #7 (47)
    "deepseek-v4-pro": 0.8, // AA Coding #7 (47)
    "deepseek-v4-flash": 0.68, // AA Coding #17 (39) — before deepseek-v4
    "deepseek-v4": 0.8,
    "kimi-k2.6": 0.8, // AA Coding #7 (47)
    "mimo-v2.5-pro": 0.79, // AA Coding #10 (46)
    "mimo-v2-5-pro": 0.79,
    "qwen3.6": 0.78, // AA Coding #11 (45)
    "glm-5.1": 0.75, // AA Coding #12 (43)
    "gemini-3-flash": 0.75, // AA Coding #12 (43)
    "gemini-3.1-flash": 0.75,
    "minimax-m2.7": 0.74, // AA Coding #14 (42)
    "qwen-3.5": 0.73, // AA Coding #15 (41)
    "qwen3.5": 0.73,
    "grok-4.2": 0.72, // AA Coding #16 (40)
    "grok-4.20": 0.72,
    "gemma-4": 0.68, // AA Coding #17 (39)
    "deepseek-v3.2": 0.66, // AA Coding #19 (37)
    "claude-haiku-4.5": 0.6, // AA Coding #20 (33)
    "claude-haiku-4-5": 0.6,
    "claude-haiku": 0.58,
    "nemotron-3": 0.58, // AA Coding #21 (31)
    "nova-2-pro": 0.57, // AA Coding #22 (30)
    "mistral-small-4": 0.46, // AA Coding #24 (24)
    // ── Not in AA ──────────────────────────────────────────────────────
    codex: 0.96,
    o3: 0.92,
    o1: 0.9,
    "claude-opus-4.6": 0.88,
    "claude-opus-4-6": 0.88,
    "claude-opus": 0.87,
    "claude-sonnet-4.5": 0.86,
    "claude-sonnet-4-5": 0.86,
    "claude-sonnet": 0.85,
    "deepseek-r2": 0.88,
    "deepseek-coder": 0.88,
    "deepseek-r1": 0.84,
    "gemini-2.5-pro": 0.84,
    "gpt-5.2": 0.88,
    "gpt-5.1": 0.86,
    "gpt-5": 0.82,
    "gpt-4o": 0.7,
    "gemini-pro": 0.8,
    "gemini-2.5-flash": 0.76,
    "gemini-flash": 0.72,
    "gemini-2.0-flash": 0.72,
    "glm-5": 0.73,
    "glm-5-turbo": 0.73,
    "glm-4.7": 0.68,
    "glm-4.5": 0.66,
    qwen: 0.73,
    "minimax-m2.5": 0.7,
    "minimax-m2": 0.6,
    "kimi-k2.5": 0.68,
    "kimi-k2": 0.5,
    "mimo-v2.5": 0.65,
    "mimo-v2-5": 0.65,
    "grok-4": 0.62,
    "grok-4-fast": 0.6,
    "grok-3": 0.6,
    "nova-pro-v2": 0.57,
    llama: 0.48,
    mistral: 0.5,
    mixtral: 0.48,
  },
  documentation: {
    // ── Blended: average of AA Coding + Intelligence (Apr 2026) ──────────
    "gpt-5.5": 0.95,
    "gpt-5.4": 0.93,
    "gemini-3.1-pro": 0.93,
    "gemini-3-pro": 0.93,
    "claude-opus-4.7": 0.92,
    "claude-opus-4-7": 0.92,
    "claude-sonnet-4.6": 0.88,
    "claude-sonnet-4-6": 0.88,
    "gpt-5.4-mini": 0.86,
    "kimi-k2.6": 0.84,
    "mimo-v2.5-pro": 0.84,
    "mimo-v2-5-pro": 0.84,
    "qwen3.6": 0.82,
    "deepseek-v4-pro": 0.83,
    "deepseek-v4": 0.83,
    "muse-spark": 0.83,
    "glm-5.1": 0.8,
    "minimax-m2.7": 0.79,
    "grok-4.2": 0.77,
    "grok-4.20": 0.77,
    "gemini-3-flash": 0.77,
    "gemini-3.1-flash": 0.77,
    "qwen-3.5": 0.75,
    "qwen3.5": 0.75,
    "deepseek-v4-flash": 0.74,
    "deepseek-v3.2": 0.7,
    "gemma-4": 0.68,
    "claude-haiku-4.5": 0.63,
    "claude-haiku-4-5": 0.63,
    "claude-haiku": 0.6,
    "nemotron-3": 0.62,
    "nova-2-pro": 0.61,
    "mistral-small-4": 0.49,
    // ── Not in AA ──────────────────────────────────────────────────────
    "claude-opus-4.6": 0.9,
    "claude-opus-4-6": 0.9,
    "claude-opus": 0.89,
    "claude-sonnet-4.5": 0.86,
    "claude-sonnet-4-5": 0.86,
    "claude-sonnet": 0.85,
    o3: 0.92,
    o1: 0.9,
    "deepseek-r2": 0.87,
    "deepseek-r1": 0.84,
    "gemini-2.5-pro": 0.86,
    "gemini-pro": 0.82,
    "gemini-2.5-flash": 0.77,
    "gemini-flash": 0.73,
    "gemini-2.0-flash": 0.73,
    "gpt-5.2": 0.89,
    "gpt-5.1": 0.87,
    "gpt-5": 0.83,
    "gpt-4o": 0.72,
    "glm-5": 0.77,
    "glm-5-turbo": 0.77,
    "glm-4.7": 0.7,
    "glm-4.5": 0.67,
    qwen: 0.75,
    "minimax-m2.5": 0.74,
    "minimax-m2": 0.62,
    "kimi-k2.5": 0.7,
    "kimi-k2": 0.52,
    "mimo-v2.5": 0.72,
    "mimo-v2-5": 0.72,
    "grok-4": 0.63,
    "grok-4-fast": 0.61,
    "grok-3": 0.61,
    "nova-pro-v2": 0.61,
    llama: 0.48,
    mistral: 0.51,
    mixtral: 0.49,
    codex: 0.89,
  },
  default: {
    // ── Blended: average of AA Coding + Intelligence (Apr 2026) ──────────
    "gpt-5.5": 0.95,
    "gpt-5.4": 0.93,
    "gemini-3.1-pro": 0.93,
    "gemini-3-pro": 0.93,
    "claude-opus-4.7": 0.92,
    "claude-opus-4-7": 0.92,
    "claude-sonnet-4.6": 0.88,
    "claude-sonnet-4-6": 0.88,
    "gpt-5.4-mini": 0.86,
    "kimi-k2.6": 0.84,
    "mimo-v2.5-pro": 0.84,
    "mimo-v2-5-pro": 0.84,
    "qwen3.6": 0.82,
    "deepseek-v4-pro": 0.83,
    "deepseek-v4": 0.83,
    "muse-spark": 0.83,
    "glm-5.1": 0.8,
    "minimax-m2.7": 0.79,
    "grok-4.2": 0.77,
    "grok-4.20": 0.77,
    "gemini-3-flash": 0.77,
    "gemini-3.1-flash": 0.77,
    "qwen-3.5": 0.75,
    "qwen3.5": 0.75,
    "deepseek-v4-flash": 0.74,
    "deepseek-v3.2": 0.7,
    "gemma-4": 0.68,
    "claude-haiku-4.5": 0.63,
    "claude-haiku-4-5": 0.63,
    "claude-haiku": 0.6,
    "nemotron-3": 0.62,
    "nova-2-pro": 0.61,
    "mistral-small-4": 0.49,
    // ── Not in AA ──────────────────────────────────────────────────────
    "claude-opus-4.6": 0.9,
    "claude-opus-4-6": 0.9,
    "claude-opus": 0.89,
    "claude-sonnet-4.5": 0.86,
    "claude-sonnet-4-5": 0.86,
    "claude-sonnet": 0.85,
    o3: 0.92,
    o1: 0.9,
    "deepseek-r2": 0.87,
    "deepseek-r1": 0.84,
    "gemini-2.5-pro": 0.86,
    "gemini-pro": 0.82,
    "gemini-2.5-flash": 0.77,
    "gemini-flash": 0.73,
    "gemini-2.0-flash": 0.73,
    "gpt-5.2": 0.89,
    "gpt-5.1": 0.87,
    "gpt-5": 0.83,
    "gpt-4o": 0.72,
    "glm-5": 0.77,
    "glm-5-turbo": 0.77,
    "glm-4.7": 0.7,
    "glm-4.5": 0.67,
    qwen: 0.75,
    "minimax-m2.5": 0.74,
    "minimax-m2": 0.62,
    "kimi-k2.5": 0.7,
    "kimi-k2": 0.52,
    "mimo-v2.5": 0.72,
    "mimo-v2-5": 0.72,
    "grok-4": 0.63,
    "grok-4-fast": 0.61,
    "grok-3": 0.61,
    "nova-pro-v2": 0.61,
    llama: 0.48,
    mistral: 0.51,
    mixtral: 0.49,
    codex: 0.89,
  },
};

// Wildcard patterns: model substrings → task type boosts
const WILDCARD_BOOSTS: Array<{ pattern: string; taskType: string; boost: number }> = [
  { pattern: "coder", taskType: "coding", boost: 0.15 },
  { pattern: "code", taskType: "coding", boost: 0.1 },
  { pattern: "fast", taskType: "coding", boost: 0.05 },
  { pattern: "thinking", taskType: "planning", boost: 0.1 },
  { pattern: "thinking", taskType: "analysis", boost: 0.1 },
  { pattern: "r2", taskType: "coding", boost: 0.12 },
  { pattern: "r2", taskType: "analysis", boost: 0.08 },
  { pattern: "opus", taskType: "planning", boost: 0.08 },
  { pattern: "opus", taskType: "analysis", boost: 0.06 },
];

/**
 * Get task fitness score for a model × taskType combination.
 * Returns 0.5 (neutral) if no mapping found.
 */
export function getTaskFitness(model: string, taskType: string): number {
  const normalizedModel = model.toLowerCase();
  const normalizedTask = taskType.toLowerCase();
  const table = FITNESS_TABLE[normalizedTask] || FITNESS_TABLE.default;

  // Direct match — longer (more specific) patterns checked first
  const sortedPatterns = Object.keys(table).sort((a, b) => b.length - a.length);
  for (const pattern of sortedPatterns) {
    if (normalizedModel.includes(pattern)) return table[pattern];
  }

  // Wildcard boost
  let baseScore = 0.5;
  for (const wc of WILDCARD_BOOSTS) {
    if (normalizedModel.includes(wc.pattern) && normalizedTask === wc.taskType) {
      baseScore += wc.boost;
    }
  }

  return Math.min(1.0, baseScore);
}

/**
 * Get all task types available.
 */
export function getTaskTypes(): string[] {
  return Object.keys(FITNESS_TABLE).filter((k) => k !== "default");
}
