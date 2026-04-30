import { describe, it, expect, afterEach, beforeEach } from "vitest";
import {
  recordConversationModel,
  getConversationModel,
  clearAll,
} from "../memory/conversationMemory";

describe("Conversation Memory", () => {
  const originalEnv = process.env.ROUTERLY_CONVERSATION_MEMORY;

  beforeEach(() => {
    clearAll();
  });

  afterEach(() => {
    clearAll();
    if (originalEnv === undefined) delete process.env.ROUTERLY_CONVERSATION_MEMORY;
    else process.env.ROUTERLY_CONVERSATION_MEMORY = originalEnv;
  });

  it("returns null when no model recorded for session", () => {
    expect(getConversationModel("session-1")).toBeNull();
  });

  it("returns null for null/undefined sessionId", () => {
    expect(getConversationModel(null)).toBeNull();
    expect(getConversationModel(undefined)).toBeNull();
  });

  it("records and retrieves model for a session", () => {
    recordConversationModel("session-1", "gpt-4", "openai");
    const result = getConversationModel("session-1");
    expect(result).toEqual({ model: "gpt-4", provider: "openai" });
  });

  it("overwrites with latest model", () => {
    recordConversationModel("session-1", "gpt-4", "openai");
    recordConversationModel("session-1", "claude-3", "anthropic");
    const result = getConversationModel("session-1");
    expect(result).toEqual({ model: "claude-3", provider: "anthropic" });
  });

  it("tracks different sessions independently", () => {
    recordConversationModel("session-1", "gpt-4", "openai");
    recordConversationModel("session-2", "claude-3", "anthropic");
    expect(getConversationModel("session-1")).toEqual({ model: "gpt-4", provider: "openai" });
    expect(getConversationModel("session-2")).toEqual({ model: "claude-3", provider: "anthropic" });
  });

  it("does nothing when feature is disabled", () => {
    process.env.ROUTERLY_CONVERSATION_MEMORY = "false";
    recordConversationModel("session-1", "gpt-4", "openai");
    expect(getConversationModel("session-1")).toBeNull();
  });
});
