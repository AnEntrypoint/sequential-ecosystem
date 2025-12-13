/**
 * drag-drop-event-handler.js - Drag and drop event handlers
 *
 * Core event handling for drag, drop, and related operations
 */

export class DragDropEventHandler {
  constructor(dragDropManager) {
    this.manager = dragDropManager;
  }

  handleDragStart(e) {
    if (e.target.draggable) {
      this.manager.draggedItem = {
        element: e.target,
        data: e.target.dataset.dragData ? JSON.parse(e.target.dataset.dragData) : null
      };
      e.dataTransfer.effectAllowed = 'move';
      e.target.style.opacity = '0.5';
      this.manager.emit('dragStart', { item: this.manager.draggedItem });
    }
  }

  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    this.manager.emit('dragOver', { x: e.clientX, y: e.clientY });
  }

  handleDragEnter(e) {
    const zone = this.manager.findDropZone(e.target);
    if (zone && zone.canDrop(this.manager.draggedItem?.data)) {
      zone.element.classList.add(zone.highlightClass);
      this.manager.emit('dragEnter', { zone: zone.id });
    }
  }

  handleDragLeave(e) {
    const zone = this.manager.findDropZone(e.target);
    if (zone) {
      zone.element.classList.remove(zone.highlightClass);
      this.manager.emit('dragLeave', { zone: zone.id });
    }
  }

  handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();

    const zone = this.manager.findDropZone(e.target);
    if (!zone) return;

    zone.element.classList.remove(zone.highlightClass);

    if (this.manager.draggedItem && zone.canDrop(this.manager.draggedItem.data)) {
      zone.onDrop(this.manager.draggedItem.data, {
        x: e.clientX,
        y: e.clientY,
        zone: zone.id
      });
      this.manager.emit('drop', {
        zone: zone.id,
        item: this.manager.draggedItem.data,
        position: { x: e.clientX, y: e.clientY }
      });
    }
  }

  handleDragEnd(e) {
    const zones = Array.from(this.manager.dropZones.values());
    zones.forEach(z => z.element?.classList.remove(z.highlightClass));

    if (this.manager.draggedItem) {
      this.manager.draggedItem.element.style.opacity = '1';
      this.manager.emit('dragEnd', { item: this.manager.draggedItem });
      this.manager.draggedItem = null;
    }
  }
}
