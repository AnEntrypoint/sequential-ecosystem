/**
 * layout-presets.js - Layout Presets Facade
 *
 * Delegates to layout definitions module
 */

import { LAYOUT_DEFINITIONS } from './layout-definitions.js';

export class LayoutPresets {
  constructor() {
    this.presets = new Map();
    this.initializePresets();
  }

  initializePresets() {
    for (const [name, config] of Object.entries(LAYOUT_DEFINITIONS)) {
      this.createLayout(name, config);
    }
  }

  createLayout(name, config) {
    const layout = {
      name,
      type: config.type || 'flex',
      ...config,
      created: Date.now()
    };

    this.presets.set(name, layout);
    return layout;
  }

  getLayout(layoutName) {
    return this.presets.get(layoutName);
  }

  getAllLayouts() {
    return Array.from(this.presets.entries()).map(([name, layout]) => ({
      name,
      type: layout.type,
      gap: layout.gap
    }));
  }

  getLayoutInfo(layoutName) {
    const layout = this.presets.get(layoutName);
    if (!layout) return null;

    return {
      name: layoutName,
      type: layout.type,
      gap: layout.gap,
      columns: layout.columns,
      rows: layout.rows,
      alignItems: layout.alignItems,
      justifyContent: layout.justifyContent,
      responsive: !!layout.responsive
    };
  }
}
