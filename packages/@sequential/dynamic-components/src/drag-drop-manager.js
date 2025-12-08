export class DragDropManager {
  constructor(containerElement) {
    this.container = typeof containerElement === 'string'
      ? document.querySelector(containerElement)
      : containerElement;
    this.draggedItem = null;
    this.dropZones = new Map();
    this.listeners = new Map();
    this.init();
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
      this.container.addEventListener('dragstart', (e) => this.handleDragStart(e));
      this.container.addEventListener('dragover', (e) => this.handleDragOver(e));
      this.container.addEventListener('drop', (e) => this.handleDrop(e));
      this.container.addEventListener('dragend', (e) => this.handleDragEnd(e));
      this.container.addEventListener('dragenter', (e) => this.handleDragEnter(e));
      this.container.addEventListener('dragleave', (e) => this.handleDragLeave(e));
    }
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
    return this;
  }

  makeDraggable(element, data) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;

    el.draggable = true;
    el.dataset.dragData = JSON.stringify(data);
    el.style.cursor = 'grab';
    el.addEventListener('dragstart', (e) => {
      this.draggedItem = { element: el, data };
      e.dataTransfer.effectAllowed = 'move';
      el.style.opacity = '0.5';
    });
    el.addEventListener('dragend', () => {
      el.style.opacity = '1';
      this.draggedItem = null;
    });
    return this;
  }

  handleDragStart(e) {
    if (e.target.draggable) {
      this.draggedItem = {
        element: e.target,
        data: e.target.dataset.dragData ? JSON.parse(e.target.dataset.dragData) : null
      };
      e.dataTransfer.effectAllowed = 'move';
      e.target.style.opacity = '0.5';
      this.emit('dragStart', { item: this.draggedItem });
    }
  }

  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    this.emit('dragOver', { x: e.clientX, y: e.clientY });
  }

  handleDragEnter(e) {
    const zone = this.findDropZone(e.target);
    if (zone && zone.canDrop(this.draggedItem?.data)) {
      zone.element.classList.add(zone.highlightClass);
      this.emit('dragEnter', { zone: zone.id });
    }
  }

  handleDragLeave(e) {
    const zone = this.findDropZone(e.target);
    if (zone) {
      zone.element.classList.remove(zone.highlightClass);
      this.emit('dragLeave', { zone: zone.id });
    }
  }

  handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();

    const zone = this.findDropZone(e.target);
    if (!zone) return;

    zone.element.classList.remove(zone.highlightClass);

    if (this.draggedItem && zone.canDrop(this.draggedItem.data)) {
      zone.onDrop(this.draggedItem.data, {
        x: e.clientX,
        y: e.clientY,
        zone: zone.id
      });
      this.emit('drop', {
        zone: zone.id,
        item: this.draggedItem.data,
        position: { x: e.clientX, y: e.clientY }
      });
    }
  }

  handleDragEnd(e) {
    const zone = Array.from(this.dropZones.values());
    zone.forEach(z => z.element?.classList.remove(z.highlightClass));

    if (this.draggedItem) {
      this.draggedItem.element.style.opacity = '1';
      this.emit('dragEnd', { item: this.draggedItem });
      this.draggedItem = null;
    }
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

  destroy() {
    if (this.container) {
      this.container.removeEventListener('dragstart', this.handleDragStart);
      this.container.removeEventListener('dragover', this.handleDragOver);
      this.container.removeEventListener('drop', this.handleDrop);
      this.container.removeEventListener('dragend', this.handleDragEnd);
      this.container.removeEventListener('dragenter', this.handleDragEnter);
      this.container.removeEventListener('dragleave', this.handleDragLeave);
    }
    this.dropZones.clear();
    this.listeners.clear();
  }
}

export const createDragDropManager = (containerElement) =>
  new DragDropManager(containerElement);
