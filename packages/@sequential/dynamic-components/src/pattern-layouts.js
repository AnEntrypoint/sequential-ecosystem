// Pattern layout system facade - maintains 100% backward compatibility
import { LayoutPresets } from './layout-presets.js';
import { LayoutApplier } from './layout-applier.js';
import { LayoutResponsive } from './layout-responsive.js';
import { LayoutUIBuilder } from './layout-ui-builder.js';

class PatternLayoutSystem {
  constructor() {
    this.presets = new LayoutPresets();
    this.applier = new LayoutApplier(this.presets);
    this.responsive = new LayoutResponsive(this.presets, this.applier);
    this.uiBuilder = new LayoutUIBuilder(this.presets, this.applier);

    // Expose for backward compatibility
    this.layouts = this.responsive.layouts;
  }

  createLayout(name, config) {
    return this.presets.createLayout(name, config);
  }

  applyLayout(componentDef, layoutName) {
    return this.applier.applyLayout(componentDef, layoutName);
  }

  getResponsiveLayout(layoutName, breakpoint) {
    return this.responsive.getResponsiveLayout(layoutName, breakpoint);
  }

  createResponsiveLayout(configs) {
    return this.responsive.createResponsiveLayout(configs);
  }

  applyResponsiveLayout(componentDef, layoutName, currentBreakpoint) {
    return this.responsive.applyResponsiveLayout(componentDef, layoutName, currentBreakpoint);
  }

  buildLayoutPreview(layoutName) {
    return this.uiBuilder.buildLayoutPreview(layoutName);
  }

  getLayoutStyle(layout) {
    return this.applier.getLayoutStyle(layout);
  }

  buildLayoutSelector() {
    return this.uiBuilder.buildLayoutSelector();
  }

  getLayoutInfo(layoutName) {
    return this.presets.getLayoutInfo(layoutName);
  }

  getAllLayouts() {
    return this.presets.getAllLayouts();
  }

  exportLayouts() {
    return this.uiBuilder.exportLayouts();
  }
}

function createPatternLayoutSystem() {
  return new PatternLayoutSystem();
}

export { PatternLayoutSystem, createPatternLayoutSystem };
