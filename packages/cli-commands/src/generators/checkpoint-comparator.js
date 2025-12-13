/**
 * Checkpoint Comparator
 * Compares two checkpoints for data differences
 */

export function createCheckpointComparator(storage) {
  return {
    compare(taskRunId1, checkpoint1, taskRunId2, checkpoint2) {
      const cp1 = storage.get(taskRunId1, checkpoint1);
      const cp2 = storage.get(taskRunId2, checkpoint2);

      const data1 = {
        checkpointId: cp1.checkpointId,
        state: cp1.state,
        timestamp: cp1.timestamp,
        duration: cp1.duration,
        data: cp1.data
      };

      const data2 = {
        checkpointId: cp2.checkpointId,
        state: cp2.state,
        timestamp: cp2.timestamp,
        duration: cp2.duration,
        data: cp2.data
      };

      const keys1 = Object.keys(data1.data);
      const keys2 = Object.keys(data2.data);

      const added = keys2.filter(k => !keys1.includes(k));
      const removed = keys1.filter(k => !keys2.includes(k));
      const modified = keys1.filter(k => keys2.includes(k) && data1.data[k] !== data2.data[k]);

      return {
        added,
        removed,
        modified,
        data1,
        data2
      };
    }
  };
}
