export function createSnapshotRestorer() {
  return {
    async restoreAndResume(snapshot, handlers) {
      let currentState = snapshot.currentState;
      let context = snapshot.context;

      while (currentState) {
        const handler = handlers[currentState];

        if (!handler) {
          throw new Error(`No handler for state: ${currentState}`);
        }

        const result = handler(context);
        if (result && result.then) {
          context = await result;
        } else {
          context = result;
        }

        if (context.nextState) {
          currentState = context.nextState;
        } else {
          break;
        }
      }

      return context;
    }
  };
}
