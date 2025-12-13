// Event handling for interaction states
export class InteractionEventHandler {
  constructor() {
    this.eventHandlers = new Map();
  }

  addEventHandler(stateName, eventType, handler) {
    if (!this.eventHandlers.has(stateName)) {
      this.eventHandlers.set(stateName, new Map());
    }

    const handlers = this.eventHandlers.get(stateName);
    if (!handlers.has(eventType)) {
      handlers.set(eventType, []);
    }

    handlers.get(eventType).push(handler);
  }

  handleEvent(stateName, eventType, context = {}) {
    const handlers = this.eventHandlers.get(stateName);
    if (!handlers) return false;

    const eventHandlers = handlers.get(eventType) || [];
    let handled = false;

    eventHandlers.forEach(handler => {
      try {
        const result = handler(context);
        if (result) handled = true;
      } catch (e) {
        console.error(`Error in event handler for ${eventType}:`, e);
      }
    });

    return handled;
  }

  getHandlersForState(stateName) {
    return this.eventHandlers.get(stateName) || new Map();
  }
}
