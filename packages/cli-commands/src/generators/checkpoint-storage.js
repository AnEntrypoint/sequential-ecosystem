/**
 * Checkpoint Storage
 * Checkpoint recording and retrieval
 *
 * Delegates to:
 * - checkpoint-storage-recorder: Record checkpoint data
 * - checkpoint-storage-retriever: Retrieve checkpoint data
 */

import { createCheckpointRecorder } from './checkpoint-storage-recorder.js';
import { createCheckpointRetriever } from './checkpoint-storage-retriever.js';

export function createCheckpointStorage() {
  const checkpoints = new Map();

  const recorder = createCheckpointRecorder(checkpoints);
  const retriever = createCheckpointRetriever(checkpoints);

  return {
    record: recorder.record.bind(recorder),
    recordDuration: recorder.recordDuration.bind(recorder),
    get: retriever.get.bind(retriever),
    getTaskCheckpoints: retriever.getTaskCheckpoints.bind(retriever),

    clear(taskRunId) {
      const keysToDelete = [];

      for (const key of checkpoints.keys()) {
        if (key.startsWith(taskRunId)) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach(key => checkpoints.delete(key));
      return this;
    }
  };
}
