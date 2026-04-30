import { describe, it, expect, afterEach } from "vitest";
import { filterByContextWindow } from "../prefilter/contextFilter";

describe("filterByContextWindow", () => {
  const originalEnv = process.env.ROUTERLY_CONTEXT_PREFILTER;

  afterEach(() => {
    if (originalEnv === undefined) delete process.env.ROUTERLY_CONTEXT_PREFILTER;
    else process.env.ROUTERLY_CONTEXT_PREFILTER = originalEnv;
  });

  const makeCandidate = (provider: string, model: string) => ({ provider, model });

  it("returns all candidates when body is empty", () => {
    const candidates = [makeCandidate("openai", "gpt-4"), makeCandidate("anthropic", "claude-3")];
    const result = filterByContextWindow(candidates, {});
    expect(result).toEqual(candidates);
  });

  it("returns all candidates when only one exists", () => {
    const candidates = [makeCandidate("openai", "gpt-4")];
    const result = filterByContextWindow(candidates, {
      messages: [{ content: "a".repeat(100000) }],
    });
    expect(result).toEqual(candidates);
  });

  it("falls back to full pool when all filtered out", () => {
    const candidates = [makeCandidate("test", "tiny-model"), makeCandidate("test2", "also-tiny")];
    const body = {
      messages: [{ content: "a".repeat(1_000_000) }],
    };
    const result = filterByContextWindow(candidates, body);
    expect(result).toEqual(candidates);
  });

  it("returns unchanged when feature is disabled", () => {
    process.env.ROUTERLY_CONTEXT_PREFILTER = "false";
    const candidates = [makeCandidate("openai", "gpt-4")];
    const result = filterByContextWindow(candidates, {});
    expect(result).toEqual(candidates);
  });
});
