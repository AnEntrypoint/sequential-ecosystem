// Visual builder facade - maintains 100% backward compatibility
import { VisualSelectors } from './visual-selectors.js';
import { VisualPalette } from './visual-palette.js';
import { VisualInspector } from './visual-inspector.js';
import { VisualBuilderEventManager } from './visual-builder-event-manager.js';
import { VisualBuilderLayout } from './visual-builder-layout.js';

export class VisualBuilderUI {
  constructor(registry, themeEngine, advancedBuilder) {
    this.selectors = new VisualSelectors(advancedBuilder, themeEngine);
    this.palette = new VisualPalette(themeEngine);
    this.inspector = new VisualInspector(themeEngine);
    this.registry = registry;
    this.themeEngine = themeEngine;
    this.builder = advancedBuilder;
    this.eventManager = new VisualBuilderEventManager();
    this.layout = new VisualBuilderLayout(themeEngine);
  }

  on(event, callback) {
    return this.eventManager.on(event, callback);
  }

  emit(event, data) {
    return this.eventManager.emit(event, data);
  }

  buildTemplateSelector() {
    return this.selectors.buildTemplateSelector();
  }

  buildPresetSelector() {
    return this.selectors.buildPresetSelector();
  }

  selectTemplate(name) {
    return this.selectors.selectTemplate(name);
  }

  selectPreset(name) {
    return this.selectors.selectPreset(name);
  }

  buildComponentPalette() {
    return this.palette.buildComponentPalette();
  }

  addComponentToCanvas(componentType) {
    return this.palette.addComponentToCanvas(componentType);
  }

  buildPropertyInspector(component) {
    return this.inspector.buildPropertyInspector(component);
  }

  buildPropertyFields(component) {
    return this.inspector.buildPropertyFields(component);
  }

  buildLivePreview(component) {
    return this.inspector.buildLivePreview(component);
  }

  buildCompleteBuilder() {
    return this.layout.buildCompleteLayout(this.selectors, this.palette);
  }
}

export const createVisualBuilder = (registry, themeEngine, advancedBuilder) =>
  new VisualBuilderUI(registry, themeEngine, advancedBuilder);
