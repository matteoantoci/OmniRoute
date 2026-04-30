export type RoutingTraceEventType =
  | "intake"
  | "prefilter"
  | "scoring"
  | "selection"
  | "fallback"
  | "exhausted";

export type RoutingTraceEvent = {
  type: RoutingTraceEventType;
  timestamp: number;
  data: Record<string, unknown>;
};

export type RoutingTrace = {
  requestId: string;
  events: RoutingTraceEvent[];
  startedAt: number;
  completedAt: number | null;
};
