/**
 * drag-drop-zone-manager.js - Drop zone management
 *
 * Register, manage, and find drop zones
 */

export class DragDropZoneManager {
  constructor() {
    this.dropZones = new Map();
  }

  registerDropZone(zoneId, element, options = {}) {
    const zone = {
      id: zoneId,
      element: typeof element === 'string' ? document.querySelector(element) : element,
      canDrop: options.canDrop || (() => true),
      onDrop: options.onDrop || (() => {}),
      highlightClass: options.highlightClass || 'drag-over'
    };
    this.dropZones.set(zoneId, zone);
    return zone;
  }

  findDropZone(element) {
    let current = element;
    while (current) {
      for (const zone of this.dropZones.values()) {
        if (zone.element === current) {
          return zone;
        }
      }
      current = current.parentElement;
    }
    return null;
  }

  removeDropZone(zoneId) {
    this.dropZones.delete(zoneId);
  }

  clear() {
    this.dropZones.clear();
  }
}
