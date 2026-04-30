import { describe, it, expect, afterEach } from "vitest";
import { optimizeContext } from "../optimization/contextOptimizer";

describe("Context Optimizer", () => {
  const originalEnv = process.env.ROUTERLY_CONTEXT_OPTIMIZE;

  afterEach(() => {
    if (originalEnv === undefined) delete process.env.ROUTERLY_CONTEXT_OPTIMIZE;
    else process.env.ROUTERLY_CONTEXT_OPTIMIZE = originalEnv;
  });

  it("returns unchanged body when feature is disabled", () => {
    process.env.ROUTERLY_CONTEXT_OPTIMIZE = "false";
    const body = { messages: [{ role: "user", content: "hello   " }] };
    const result = optimizeContext(body);
    expect(result.applied).toEqual([]);
    expect(result.tokensSaved).toBe(0);
  });

  it("returns unchanged body when no optimizations needed", () => {
    process.env.ROUTERLY_CONTEXT_OPTIMIZE = "true";
    const body = { messages: [{ role: "user", content: "hello" }] };
    const result = optimizeContext(body);
    expect(result.applied).toEqual([]);
    expect(result.tokensSaved).toBe(0);
  });

  it("minifies JSON content blocks", () => {
    process.env.ROUTERLY_CONTEXT_OPTIMIZE = "true";
    const body = {
      messages: [
        {
          role: "assistant",
          content: '{\n  "key": "value",\n  "nested": {\n    "a": 1\n  }\n}',
        },
      ],
    };
    const result = optimizeContext(body);
    expect(result.applied).toContain("json_minify");
    expect(result.tokensSaved).toBeGreaterThan(0);
    expect((result.body.messages[0] as any).content).toBe('{"key":"value","nested":{"a":1}}');
  });

  it("normalizes excessive whitespace", () => {
    process.env.ROUTERLY_CONTEXT_OPTIMIZE = "true";
    const body = {
      messages: [
        { role: "user", content: "hello\n\n\n\n\n\nworld   \nline 2   " },
      ],
    };
    const result = optimizeContext(body);
    expect(result.applied).toContain("whitespace_normalize");
    expect((result.body.messages[0] as any).content).toBe("hello\n\nworld\nline 2");
  });

  it("deduplicates system prompts", () => {
    process.env.ROUTERLY_CONTEXT_OPTIMIZE = "true";
    const body = {
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "hi" },
        { role: "system", content: "You are a helpful assistant." },
      ],
    };
    const result = optimizeContext(body);
    expect(result.applied).toContain("system_dedup");
    expect((result.body.messages[2] as any).content).toBe("");
  });

  it("compacts tool schemas when tools > threshold", () => {
    process.env.ROUTERLY_CONTEXT_OPTIMIZE = "true";
    const tools = [];
    for (let i = 0; i < 12; i++) {
      tools.push({
        function: {
          name: `tool_${i}`,
          description: `Tool ${i}`,
          parameters: {
            type: "object",
            properties: {
              param1: { type: "string", description: "A very long description that takes up tokens" },
              param2: { type: "number", description: "Another verbose description here" },
            },
          },
        },
      });
    }
    const body = { messages: [{ role: "user", content: "use tools" }], tools };
    const result = optimizeContext(body);
    expect(result.applied).toContain("tool_compact");
    const optimizedTools = result.body.tools as any[];
    expect(optimizedTools[0].function.parameters.properties.param1.description).toBeUndefined();
  });

  it("does not compact tool schemas when tools <= threshold", () => {
    process.env.ROUTERLY_CONTEXT_OPTIMIZE = "true";
    const tools = [
      {
        function: {
          name: "tool_1",
          parameters: {
            type: "object",
            properties: {
              param1: { type: "string", description: "Keep this" },
            },
          },
        },
      },
    ];
    const body = { messages: [{ role: "user", content: "hi" }], tools };
    const result = optimizeContext(body);
    expect(result.applied).not.toContain("tool_compact");
  });

  it("does not mutate the original body", () => {
    process.env.ROUTERLY_CONTEXT_OPTIMIZE = "true";
    const body = {
      messages: [
        { role: "user", content: '{\n  "key": "value"\n}' },
      ],
    };
    const originalContent = (body.messages[0] as any).content;
    optimizeContext(body);
    expect((body.messages[0] as any).content).toBe(originalContent);
  });
});
