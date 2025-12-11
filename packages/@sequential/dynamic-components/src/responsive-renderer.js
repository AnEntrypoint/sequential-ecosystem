// Facade maintaining 100% backward compatibility
import { ResponsiveViewport } from './responsive-viewport.js';
import { ResponsiveOptimizer } from './responsive-optimizer.js';
import { ResponsiveUI } from './responsive-ui.js';

class ResponsiveRenderer {
  constructor() {
    this.viewport = new ResponsiveViewport();
    this.optimizer = new ResponsiveOptimizer(this.viewport);
    this.ui = new ResponsiveUI(this.viewport, this.optimizer);
    this.cache = new Map();

    // Expose viewport properties
    this.breakpoints = this.viewport.breakpoints;
    this.currentBreakpoint = this.viewport.currentBreakpoint;
    this.viewportWidth = this.viewport.viewportWidth;
    this.viewportHeight = this.viewport.viewportHeight;
    this.orientation = this.viewport.orientation;
    this.devicePixelRatio = this.viewport.devicePixelRatio;
    this.isTouch = this.viewport.isTouch;
  }

  init() {
    return this.viewport.init();
  }

  updateViewport() {
    this.viewport.updateViewport();
    this.currentBreakpoint = this.viewport.currentBreakpoint;
    this.viewportWidth = this.viewport.viewportWidth;
    this.viewportHeight = this.viewport.viewportHeight;
    this.orientation = this.viewport.orientation;
    this.devicePixelRatio = this.viewport.devicePixelRatio;
    this.isTouch = this.viewport.isTouch;
  }

  getBreakpoint() {
    return this.viewport.getBreakpoint();
  }

  detectTouchDevice() {
    return this.viewport.detectTouchDevice();
  }

  on(event, callback) {
    return this.viewport.on(event, callback);
  }

  emit(event, data) {
    return this.viewport.emit(event, data);
  }

  applyResponsiveStyles(componentDef, overrides = {}) {
    return this.optimizer.applyResponsiveStyles(componentDef, overrides);
  }

  optimizeForMobile(componentDef) {
    return this.optimizer.optimizeForMobile(componentDef);
  }

  optimizeForTablet(componentDef) {
    return this.optimizer.optimizeForTablet(componentDef);
  }

  optimizeForDesktop(componentDef) {
    return this.optimizer.optimizeForDesktop(componentDef);
  }

  scalePadding(padding, factor) {
    return this.optimizer.scalePadding(padding, factor);
  }

  scaleFontSize(fontSize, factor) {
    return this.optimizer.scaleFontSize(fontSize, factor);
  }

  getResponsiveLayoutConfig(breakpoint = null) {
    return this.optimizer.getResponsiveLayoutConfig(breakpoint);
  }

  buildResponsivePreview(componentDef) {
    return this.ui.buildResponsivePreview(componentDef);
  }

  buildViewportSelector() {
    return this.ui.buildViewportSelector();
  }

  buildResponsiveViewer(componentDef) {
    return this.ui.buildResponsiveViewer(componentDef);
  }

  buildBreakpointInfo() {
    return this.ui.buildBreakpointInfo();
  }

  generateResponsiveCSSQuery(componentDef) {
    return this.optimizer.generateResponsiveCSSQuery();
  }

  clearCache() {
    this.cache.clear();
  }

  exportResponsiveConfig() {
    const config = this.viewport.exportResponsiveConfig();
    config.layoutConfigs = Object.fromEntries(
      Object.keys(this.viewport.breakpoints).map(bp => [
        bp,
        this.optimizer.getResponsiveLayoutConfig(bp)
      ])
    );
    return config;
  }
}

function createResponsiveRenderer() {
  return new ResponsiveRenderer();
}

export { ResponsiveRenderer, createResponsiveRenderer };
