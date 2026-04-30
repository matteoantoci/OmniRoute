export type TtftTracker = {
  recordContent: () => void;
  getTtft: () => number | null;
};

function isFeatureEnabled(): boolean {
  const val = process.env.ROUTERLY_TTFT;
  return val == null || val === "true" || val === "1";
}

export function createTtftTracker(startedAt: number): TtftTracker {
  if (!isFeatureEnabled()) {
    return {
      recordContent: () => {},
      getTtft: () => null,
    };
  }

  let firstContentAt: number | null = null;

  return {
    recordContent() {
      if (firstContentAt == null) {
        firstContentAt = Date.now();
      }
    },
    getTtft() {
      return firstContentAt != null ? firstContentAt - startedAt : null;
    },
  };
}
