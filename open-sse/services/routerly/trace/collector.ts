import type { RoutingTrace, RoutingTraceEvent, RoutingTraceEventType } from "./types";

function isFeatureEnabled(): boolean {
  const val = process.env.ROUTERLY_ROUTING_TRACE;
  return val === "true" || val === "1";
}

export class RoutingTraceCollector {
  private events: RoutingTraceEvent[] = [];
  readonly requestId: string;
  readonly startedAt: number;
  private completedAt: number | null = null;

  constructor(requestId: string) {
    this.requestId = requestId;
    this.startedAt = Date.now();
  }

  addEvent(type: RoutingTraceEventType, data: Record<string, unknown>): void {
    if (!isFeatureEnabled()) return;
    this.events.push({ type, timestamp: Date.now(), data });
  }

  complete(): void {
    this.completedAt = Date.now();
  }

  isEnabled(): boolean {
    return isFeatureEnabled();
  }

  toTrace(): RoutingTrace {
    return {
      requestId: this.requestId,
      events: this.events,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
    };
  }

  formatAsSSEComments(): string {
    if (this.events.length === 0) return "";
    const trace = this.toTrace();
    return `: routing-trace\n` + `data: ${JSON.stringify(trace)}\n\n`;
  }
}
