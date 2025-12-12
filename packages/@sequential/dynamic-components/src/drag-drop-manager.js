/**
 * drag-drop-manager.js - Drag and Drop Manager Facade
 *
 * Delegates to focused drag-drop handler modules
 */

import { DragDropEventHandler } from './drag-drop-event-handler.js';
import { DragDropZoneManager } from './drag-drop-zone-manager.js';
import { DragDropDraggable } from './drag-drop-draggable.js';

export class DragDropManager {
  constructor(containerElement) {
    this.container = typeof containerElement === 'string'
      ? document.querySelector(containerElement)
      : containerElement;
    this.draggedItem = null;
    this.listeners = new Map();

    this.zoneManager = new DragDropZoneManager();
    this.eventHandler = new DragDropEventHandler(this);
    this.draggable = new DragDropDraggable(this);

    this.init();
  }

  get dropZones() {
    return this.zoneManager.dropZones;
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return this;
  }

  emit(event, data) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(cb => cb(data));
  }

  init() {
    if (this.container) {
      this.container.addEventListener('dragstart', (e) => this.eventHandler.handleDragStart.call(this.eventHandler, e));
      this.container.addEventListener('dragover', (e) => this.eventHandler.handleDragOver.call(this.eventHandler, e));
      this.container.addEventListener('drop', (e) => this.eventHandler.handleDrop.call(this.eventHandler, e));
      this.container.addEventListener('dragend', (e) => this.eventHandler.handleDragEnd.call(this.eventHandler, e));
      this.container.addEventListener('dragenter', (e) => this.eventHandler.handleDragEnter.call(this.eventHandler, e));
      this.container.addEventListener('dragleave', (e) => this.eventHandler.handleDragLeave.call(this.eventHandler, e));
    }
  }

  registerDropZone(zoneId, element, options = {}) {
    this.zoneManager.registerDropZone(zoneId, element, options);
    return this;
  }

  makeDraggable(element, data) {
    this.draggable.makeDraggable(element, data);
    return this;
  }

  findDropZone(element) {
    return this.zoneManager.findDropZone(element);
  }

  destroy() {
    if (this.container) {
      this.container.removeEventListener('dragstart', this.eventHandler.handleDragStart);
      this.container.removeEventListener('dragover', this.eventHandler.handleDragOver);
      this.container.removeEventListener('drop', this.eventHandler.handleDrop);
      this.container.removeEventListener('dragend', this.eventHandler.handleDragEnd);
      this.container.removeEventListener('dragenter', this.eventHandler.handleDragEnter);
      this.container.removeEventListener('dragleave', this.eventHandler.handleDragLeave);
    }
    this.zoneManager.clear();
    this.listeners.clear();
  }
}

export const createDragDropManager = (containerElement) =>
  new DragDropManager(containerElement);
