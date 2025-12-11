// Canvas creation and management
export class CanvasManager {
  constructor() {
    this.canvas = null;
    this.grid = { enabled: true, size: 8 };
    this.zoom = 1;
    this.pan = { x: 0, y: 0 };
  }

  createCanvas(width = 800, height = 600) {
    this.canvas = {
      width,
      height,
      backgroundColor: '#ffffff',
      components: [],
      grid: this.grid,
      created: Date.now()
    };
    return this.canvas;
  }

  getCanvas() {
    return this.canvas;
  }

  snapToGrid(value) {
    if (!this.grid.enabled) return value;
    return Math.round(value / this.grid.size) * this.grid.size;
  }
}
