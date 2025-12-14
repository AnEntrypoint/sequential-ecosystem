const eventHandlers = new Map();
export function createEventBroadcaster() {
  return {
    on(event, handler) {
      if (!eventHandlers.has(event)) eventHandlers.set(event, new Set());
      eventHandlers.get(event).add(handler);
      return () => eventHandlers.get(event).delete(handler);
    },
    emit(event, data) {
      if (eventHandlers.has(event)) eventHandlers.get(event).forEach(h => h(data));
    }
  };
}
export default { createEventBroadcaster };
