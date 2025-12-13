export function createBroadcastSequenceController() {
  const sequences = new Map();
  const lastApplied = new Map();

  return {
    createSequence(executionId) {
      if (!sequences.has(executionId)) {
        sequences.set(executionId, {
          counter: 0,
          started: new Date().toISOString()
        });
      }
      return sequences.get(executionId);
    },

    nextSequence(executionId) {
      const seq = this.createSequence(executionId);
      seq.counter++;
      return seq.counter;
    },

    attachSequence(executionId, broadcast) {
      const sequence = this.nextSequence(executionId);
      return {
        ...broadcast,
        _broadcastSequence: sequence,
        _executionId: executionId
      };
    },

    isStaleUpdate(stateKey, incomingSequence) {
      if (!lastApplied.has(stateKey)) {
        return false;
      }

      const lastSequence = lastApplied.get(stateKey);
      return incomingSequence <= lastSequence;
    },

    canApplyUpdate(stateKey, incomingSequence) {
      if (!incomingSequence) {
        return true;
      }

      return !this.isStaleUpdate(stateKey, incomingSequence);
    },

    markApplied(stateKey, sequence) {
      if (!sequence) {
        return null;
      }

      const previous = lastApplied.get(stateKey) || 0;
      if (sequence > previous) {
        lastApplied.set(stateKey, sequence);
        return {
          stateKey: stateKey,
          sequence: sequence,
          skipped: false
        };
      }

      return {
        stateKey: stateKey,
        sequence: sequence,
        skipped: true,
        reason: 'stale update'
      };
    },

    rejectStale(stateKey, update) {
      const sequence = update._broadcastSequence;
      if (!sequence) {
        return { accepted: true, update: update };
      }

      if (this.isStaleUpdate(stateKey, sequence)) {
        return {
          accepted: false,
          reason: 'stale broadcast',
          current: update,
          lastAppliedSequence: lastApplied.get(stateKey)
        };
      }

      this.markApplied(stateKey, sequence);
      const cleaned = {};
      for (const key in update) {
        if (!key.startsWith('_')) {
          cleaned[key] = update[key];
        }
      }

      return {
        accepted: true,
        update: cleaned
      };
    },

    getSequenceInfo(executionId) {
      const seq = sequences.get(executionId);
      if (!seq) return null;

      return {
        executionId: executionId,
        currentSequence: seq.counter,
        started: seq.started
      };
    },

    getLastAppliedSequences() {
      const result = {};
      for (const entry of lastApplied.entries()) {
        result[entry[0]] = entry[1];
      }
      return result;
    },

    clearSequence(executionId) {
      sequences.delete(executionId);
    },

    clearLastApplied(stateKey) {
      if (stateKey) {
        lastApplied.delete(stateKey);
      } else {
        lastApplied.clear();
      }
    }
  };
}
