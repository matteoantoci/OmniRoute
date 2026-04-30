import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { getStickinessFactor } from "../scoring/stickiness";
import { recordConversationModel, clearAll } from "../memory/conversationMemory";

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

  it("returns 0 when provider differs", () => {
    recordConversationModel("session-1", "gpt-4", "openai");
    expect(getStickinessFactor("session-1", "anthropic", "gpt-4")).toBe(0);
  });

  it("returns 0 when model differs", () => {
    recordConversationModel("session-1", "gpt-4", "openai");
    expect(getStickinessFactor("session-1", "openai", "gpt-3.5")).toBe(0);
  });

  it("returns 0 when feature is disabled", () => {
    process.env.ROUTERLY_STICKINESS = "false";
    recordConversationModel("session-1", "gpt-4", "openai");
    expect(getStickinessFactor("session-1", "openai", "gpt-4")).toBe(0);
  });
});
