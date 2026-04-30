import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { getStickinessFactor, deriveComplexityTier } from "../scoring/stickiness";
import { recordConversationModel, clearAll, getSessionTier, recordSessionTier } from "../memory/conversationMemory";

describe("getStickinessFactor", () => {
  const originalEnv = process.env.ROUTERLY_STICKINESS;

  beforeEach(() => {
    clearAll();
  });

  afterEach(() => {
    clearAll();
    if (originalEnv === undefined) delete process.env.ROUTERLY_STICKINESS;
    else process.env.ROUTERLY_STICKINESS = originalEnv;
  });

  it("returns 0 when no conversation memory exists", () => {
    expect(getStickinessFactor("session-1", "openai", "gpt-4")).toBe(0);
  });

  it("returns 1 when provider and model match conversation memory", () => {
    recordConversationModel("session-1", "gpt-4", "openai");
    expect(getStickinessFactor("session-1", "openai", "gpt-4")).toBe(1.0);
  });

  it("returns 0.3 when same provider but different model", () => {
    recordConversationModel("session-1", "gpt-4", "openai");
    expect(getStickinessFactor("session-1", "openai", "gpt-3.5")).toBe(0.3);
  });

  it("returns 0 when provider differs", () => {
    recordConversationModel("session-1", "gpt-4", "openai");
    expect(getStickinessFactor("session-1", "anthropic", "gpt-4")).toBe(0);
  });

  it("returns 0 when feature is disabled", () => {
    process.env.ROUTERLY_STICKINESS = "false";
    recordConversationModel("session-1", "gpt-4", "openai");
    expect(getStickinessFactor("session-1", "openai", "gpt-4")).toBe(0);
  });
});

describe("deriveComplexityTier", () => {
  it("returns 'reasoning' for reasoning signals", () => {
    expect(deriveComplexityTier({ agentic: false, reasoning: true, vision: false, complexCoding: false }))
      .toBe("reasoning");
  });

  it("returns 'complex' for agentic signals", () => {
    expect(deriveComplexityTier({ agentic: true, reasoning: false, vision: false, complexCoding: false }))
      .toBe("complex");
  });

  it("returns 'complex' for complex coding signals", () => {
    expect(deriveComplexityTier({ agentic: false, reasoning: false, vision: false, complexCoding: true }))
      .toBe("complex");
  });

  it("returns 'standard' for vision signals only", () => {
    expect(deriveComplexityTier({ agentic: false, reasoning: false, vision: true, complexCoding: false }))
      .toBe("standard");
  });

  it("returns 'simple' when no signals present", () => {
    expect(deriveComplexityTier({ agentic: false, reasoning: false, vision: false, complexCoding: false }))
      .toBe("simple");
  });
});

describe("Session Escalation", () => {
  beforeEach(() => {
    clearAll();
  });
  afterEach(() => {
    clearAll();
  });

  it("starts with no tier", () => {
    expect(getSessionTier("session-1")).toBeNull();
  });

  it("records tier via recordConversationModel", () => {
    recordConversationModel("session-1", "gpt-4", "openai", "simple");
    expect(getSessionTier("session-1")).toBe("simple");
  });

  it("enforces upgrade-only policy", () => {
    recordConversationModel("session-1", "gpt-4", "openai", "complex");
    expect(getSessionTier("session-1")).toBe("complex");

    recordConversationModel("session-1", "gpt-3.5", "openai", "simple");
    expect(getSessionTier("session-1")).toBe("complex");
  });

  it("allows escalation from complex to reasoning", () => {
    recordConversationModel("session-1", "gpt-4", "openai", "complex");
    recordConversationModel("session-1", "o1", "openai", "reasoning");
    expect(getSessionTier("session-1")).toBe("reasoning");
  });

  it("records tier via recordSessionTier", () => {
    recordSessionTier("session-2", "reasoning");
    expect(getSessionTier("session-2")).toBe("reasoning");
  });
});
