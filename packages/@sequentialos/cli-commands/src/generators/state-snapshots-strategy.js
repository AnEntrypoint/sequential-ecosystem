export function createCheckpointStrategy() {
  return {
    strategies: {
      automatic: {
        interval: 30000,
        description: 'Create snapshot every 30 seconds'
      },
      stateChange: {
        description: 'Create snapshot when entering new state'
      },
      beforeRiskyOp: {
        description: 'Create snapshot before operations that might fail'
      },
      onError: {
        description: 'Create snapshot when error occurs'
      }
    },

    shouldCheckpoint(strategy, previousTimestamp = null) {
      if (strategy === 'automatic') {
        if (!previousTimestamp) return true;
        return Date.now() - previousTimestamp >= this.strategies.automatic.interval;
      }

      if (strategy === 'onStateChange') {
        return true;
      }

      if (strategy === 'beforeRiskyOp') {
        return true;
      }

      if (strategy === 'onError') {
        return true;
      }

      return false;
    },

    getStrategyDescription(strategy) {
      return this.strategies[strategy]?.description || 'Unknown strategy';
    }
  };
}
