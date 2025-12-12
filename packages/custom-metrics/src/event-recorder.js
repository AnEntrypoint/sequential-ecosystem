/**
 * event-recorder.js - Event recording and retrieval
 *
 * Manage metric events with filtering and summary capabilities
 */

import { randomUUID } from 'crypto';

export class EventRecorder {
  constructor(eventEmitter) {
    this.events = [];
    this.eventEmitter = eventEmitter;
  }

  recordEvent(eventType, data = {}, labels = {}) {
    const event = {
      id: randomUUID(),
      type: eventType,
      timestamp: Date.now(),
      data,
      labels
    };
    this.events.push(event);
    if (this.events.length > 10000) this.events.shift();
    this.eventEmitter.emit('event:recorded', event);
    return event;
  }

  getEvents(limit = 100, filterType = null) {
    let result = this.events.slice(-limit);
    if (filterType) result = result.filter(e => e.type === filterType);
    return result;
  }

  getEventSummary() {
    const eventTypes = {};
    this.events.forEach(e => {
      eventTypes[e.type] = (eventTypes[e.type] || 0) + 1;
    });
    return eventTypes;
  }

  clear() {
    this.events = [];
  }

  getEventCount() {
    return this.events.length;
  }
}
