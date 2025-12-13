export function createEventBroadcaster(broadcastFns) {
  return {
    runStarted: (runId, taskName) =>
      broadcastFns.broadcastToRunSubscribers({ type: 'run-started', runId, taskName, timestamp: new Date().toISOString() }),

    runCompleted: (runId, taskName, status, duration, timestamp) =>
      broadcastFns.broadcastToRunSubscribers({ type: 'run-completed', runId, taskName, status, duration, timestamp }),

    runCancelled: (runId, taskName) =>
      broadcastFns.broadcastToRunSubscribers({ type: 'run-cancelled', runId, taskName, timestamp: new Date().toISOString() }),

    taskProgress: (taskName, runId, stage, percentage, details) =>
      broadcastFns.broadcastTaskProgress(taskName, runId, { stage, percentage, details }),

    taskSubscriber: (taskName, event) =>
      broadcastFns.broadcastToTaskSubscribers(taskName, event)
  };
}
