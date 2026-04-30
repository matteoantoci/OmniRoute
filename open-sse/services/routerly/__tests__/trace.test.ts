import { describe, it, expect, afterEach } from "vitest";
import { RoutingTraceCollector } from "../trace/collector";

describe("RoutingTraceCollector", () => {
  const originalEnv = process.env.ROUTERLY_ROUTING_TRACE;

  afterEach(() => {
    if (originalEnv === undefined) delete process.env.ROUTERLY_ROUTING_TRACE;
    else process.env.ROUTERLY_ROUTING_TRACE = originalEnv;
  });

  it("starts with no events", () => {
    process.env.ROUTERLY_ROUTING_TRACE = "true";
    const collector = new RoutingTraceCollector("test-1");
    expect(collector.toTrace().events).toHaveLength(0);
  });

  it("collects events when enabled", () => {
    process.env.ROUTERLY_ROUTING_TRACE = "true";
    const collector = new RoutingTraceCollector("test-2");
    collector.addEvent("intake", { strategy: "auto" });
    collector.addEvent("selection", { provider: "openai", model: "gpt-4" });
    collector.complete();
    const trace = collector.toTrace();
    expect(trace.events).toHaveLength(2);
    expect(trace.requestId).toBe("test-2");
    expect(trace.completedAt).not.toBeNull();
  });

  it("skips events when disabled", () => {
    process.env.ROUTERLY_ROUTING_TRACE = "false";
    const collector = new RoutingTraceCollector("test-3");
    collector.addEvent("intake", {});
    expect(collector.toTrace().events).toHaveLength(0);
  });

  it("formatAsSSEComments returns empty string with no events", () => {
    process.env.ROUTERLY_ROUTING_TRACE = "true";
    const collector = new RoutingTraceCollector("test-4");
    expect(collector.formatAsSSEComments()).toBe("");
  });

  it("formatAsSSEComments produces SSE comment format", () => {
    process.env.ROUTERLY_ROUTING_TRACE = "true";
    const collector = new RoutingTraceCollector("test-5");
    collector.addEvent("intake", { strategy: "auto" });
    collector.complete();
    const output = collector.formatAsSSEComments();
    expect(output).toContain(": routing-trace");
    expect(output).toContain('"requestId":"test-5"');
  });
});
