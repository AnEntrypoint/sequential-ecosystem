// UI builders facade - maintains 100% backward compatibility
import * as panelBuilders from './ui-panel-builders.js';
import * as fieldEditors from './ui-field-editors.js';
import * as componentPreviews from './ui-component-previews.js';
import { toLabel } from './ui-utilities.js';

// Main UI builders (original exports)
export function buildCustomizerUI(theme, presets) {
  return panelBuilders.buildCustomizerUI(theme, presets);
}

export function buildControlPanel(theme, presets) {
  return panelBuilders.buildControlPanel(theme, presets);
}

export function buildPresetSelector(presets) {
  return fieldEditors.buildPresetSelector(presets);
}

export function buildColorEditor(theme) {
  return fieldEditors.buildColorEditor(theme);
}

export function buildSpacingEditor(theme) {
  return fieldEditors.buildSpacingEditor(theme);
}

export function buildRadiusEditor(theme) {
  return fieldEditors.buildRadiusEditor(theme);
}

export function buildExportControls() {
  return fieldEditors.buildExportControls();
}

export function buildPreviewPanel(theme) {
  return panelBuilders.buildPreviewPanel(theme);
}

export function buildComponentPreview(theme, type) {
  return componentPreviews.buildComponentPreview(theme, type);
}

export function buildColorPalette(theme) {
  return componentPreviews.buildColorPalette(theme);
}

// Utility exports
export { toLabel };
