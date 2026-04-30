import { describe, it, expect, afterEach } from "vitest";
import {
  detectContentSignals,
  contentSignalsToTaskType,
  type ContentSignals,
} from "../routing/contentSignals";

describe("Content Signals", () => {
  const originalEnv = process.env.ROUTERLY_CONTENT_SIGNALS;

  afterEach(() => {
    if (originalEnv === undefined) delete process.env.ROUTERLY_CONTENT_SIGNALS;
    else process.env.ROUTERLY_CONTENT_SIGNALS = originalEnv;
  });

  it("returns all-false when feature is disabled", () => {
    process.env.ROUTERLY_CONTENT_SIGNALS = "false";
    const signals = detectContentSignals({
      messages: [{ role: "user", content: "hello" }],
      tools: [{ function: { name: "edit" } }, { function: { name: "write" } }, { function: { name: "bash" } }],
    });
    expect(signals.agentic).toBe(false);
    expect(signals.reasoning).toBe(false);
    expect(signals.vision).toBe(false);
    expect(signals.complexCoding).toBe(false);
    expect(signals.dominantSignal).toBeNull();
  });

  it("returns all-false for empty body", () => {
    process.env.ROUTERLY_CONTENT_SIGNALS = "true";
    const signals = detectContentSignals({});
    expect(signals.agentic).toBe(false);
    expect(signals.dominantSignal).toBeNull();
  });

  it("detects agentic via tool count", () => {
    process.env.ROUTERLY_CONTENT_SIGNALS = "true";
    const signals = detectContentSignals({
      messages: [{ role: "user", content: "fix the bug" }],
      tools: [
        { function: { name: "read" } },
        { function: { name: "edit" } },
        { function: { name: "bash" } },
      ],
    });
    expect(signals.agentic).toBe(true);
    expect(signals.dominantSignal).toBe("agentic");
  });

  it("detects agentic via tool-call cycles", () => {
    process.env.ROUTERLY_CONTENT_SIGNALS = "true";
    const signals = detectContentSignals({
      messages: [
        { role: "user", content: "fix the bug" },
        { role: "assistant", content: null, tool_calls: [{ id: "1", function: { name: "read" } }] },
        { role: "tool", content: "file contents", tool_call_id: "1" },
        { role: "assistant", content: null, tool_calls: [{ id: "2", function: { name: "edit" } }] },
        { role: "tool", content: "done", tool_call_id: "2" },
      ],
    });
    expect(signals.agentic).toBe(true);
  });

  it("detects agentic via system prompt keywords", () => {
    process.env.ROUTERLY_CONTENT_SIGNALS = "true";
    const signals = detectContentSignals({
      messages: [
        { role: "system", content: "You are an autonomous agent with tool-use capabilities." },
        { role: "user", content: "help me" },
      ],
    });
    expect(signals.agentic).toBe(true);
  });

  it("detects reasoning via reasoning_effort param", () => {
    process.env.ROUTERLY_CONTENT_SIGNALS = "true";
    const signals = detectContentSignals({
      messages: [{ role: "user", content: "solve this" }],
      reasoning_effort: "high",
    });
    expect(signals.reasoning).toBe(true);
    expect(signals.dominantSignal).toBe("reasoning");
  });

  it("detects reasoning via keywords including Chinese", () => {
    process.env.ROUTERLY_CONTENT_SIGNALS = "true";
    const signals = detectContentSignals({
      messages: [{ role: "user", content: "please do 逐步推理 for this problem" }],
    });
    expect(signals.reasoning).toBe(true);
  });

  it("detects vision via image_url content part", () => {
    process.env.ROUTERLY_CONTENT_SIGNALS = "true";
    const signals = detectContentSignals({
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "what is this?" },
            { type: "image_url", image_url: { url: "https://example.com/img.png" } },
          ],
        },
      ],
    });
    expect(signals.vision).toBe(true);
    expect(signals.dominantSignal).toBe("vision");
  });

  it("detects complex coding via tool patterns", () => {
    process.env.ROUTERLY_CONTENT_SIGNALS = "true";
    const signals = detectContentSignals({
      messages: [{ role: "user", content: "refactor this" }],
      tools: [
        { function: { name: "edit_file" } },
        { function: { name: "write_file" } },
        { function: { name: "create_file" } },
      ],
    });
    expect(signals.complexCoding).toBe(true);
  });

  it("vision takes priority as dominant signal", () => {
    process.env.ROUTERLY_CONTENT_SIGNALS = "true";
    const signals = detectContentSignals({
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "step by step analyze this image" },
            { type: "image_url", image_url: { url: "data:image/png;base64,abc" } },
          ],
        },
      ],
      reasoning_effort: "high",
    });
    expect(signals.vision).toBe(true);
    expect(signals.reasoning).toBe(true);
    expect(signals.dominantSignal).toBe("vision");
  });

  describe("contentSignalsToTaskType", () => {
    it("maps vision signal", () => {
      expect(contentSignalsToTaskType({
        agentic: false, reasoning: false, vision: true, complexCoding: false, dominantSignal: "vision",
      })).toBe("vision");
    });

    it("maps agentic signal", () => {
      expect(contentSignalsToTaskType({
        agentic: true, reasoning: false, vision: false, complexCoding: false, dominantSignal: "agentic",
      })).toBe("agentic");
    });

    it("returns null for no signals", () => {
      expect(contentSignalsToTaskType({
        agentic: false, reasoning: false, vision: false, complexCoding: false, dominantSignal: null,
      })).toBeNull();
    });
  });
});
