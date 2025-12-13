export function createOperationLogger(logFns) {
  return {
    taskStarted: (runId, taskName, inputKeys) =>
      logFns.logOperation('task-started', { runId, taskName, inputKeys }),

    taskCompleted: (runId, taskName, status, duration) =>
      logFns.logOperation('task-completed', { runId, taskName, status, duration }),

    taskCancelled: (runId, taskName) =>
      logFns.logOperation('task-cancelled', { runId, taskName }),

    taskError: (runId, taskName, error) =>
      logFns.logOperation('task-error', { runId, taskName, error: error.substring(0, 100) }),

    fileOperation: (operation, filePath, error, metadata) =>
      logFns.logFileOperation(operation, filePath, error, metadata),

    fileSuccess: (operation, filePath, duration, metadata) =>
      logFns.logFileSuccess(operation, filePath, duration, metadata)
  };
}
