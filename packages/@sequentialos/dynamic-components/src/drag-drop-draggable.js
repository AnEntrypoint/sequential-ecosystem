/**
 * drag-drop-draggable.js - Draggable element setup
 *
 * Make elements draggable with data attachment
 */

export class DragDropDraggable {
  constructor(dragDropManager) {
    this.manager = dragDropManager;
  }

  makeDraggable(element, data) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;

    el.draggable = true;
    el.dataset.dragData = JSON.stringify(data);
    el.style.cursor = 'grab';
    el.addEventListener('dragstart', (e) => {
      this.manager.draggedItem = { element: el, data };
      e.dataTransfer.effectAllowed = 'move';
      el.style.opacity = '0.5';
    });
    el.addEventListener('dragend', () => {
      el.style.opacity = '1';
      this.manager.draggedItem = null;
    });
    return this;
  }
}
