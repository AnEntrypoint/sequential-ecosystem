// Theme customizer facade - maintains 100% backward compatibility
import { ThemePresets } from './theme-presets.js';
import { ThemeCustomizerUI } from './theme-customizer-ui.js';

export class ThemeCustomizer {
  constructor(themeEngine) {
    this.theme = themeEngine;
    this.customTheme = this.theme.getTheme();
    this.presetsMgr = new ThemePresets();
    this.presets = this.presetsMgr.presets;
    this.currentPreset = 'default';
    this.ui = new ThemeCustomizerUI(this.theme, this.customTheme, this.currentPreset, this.presets);
  }

  buildThemeCustomizerUI() {
    return this.ui.buildThemeCustomizerUI((preset) => this.selectPreset(preset));
  }

  buildPresetSelector() {
    return this.ui.buildPresetSelector((preset) => this.selectPreset(preset));
  }

  buildColorEditor() {
    return this.ui.buildColorEditor();
  }

  buildColorField(key, value) {
    return this.ui.buildColorField(key, value);
  }

  buildPreview() {
    return this.ui.buildPreview();
  }

  selectPreset(presetName) {
    this.currentPreset = presetName;
    const preset = this.presets.get(presetName);
    this.customTheme = JSON.parse(JSON.stringify(preset));
    this.ui = new ThemeCustomizerUI(this.theme, this.customTheme, this.currentPreset, this.presets);
    this.applyCustomTheme();
  }

  applyCustomTheme() {
    this.theme.setCustomTheme(this.customTheme);
  }

  exportTheme() {
    const json = JSON.stringify(this.customTheme, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `theme-${this.currentPreset}.json`;
    a.click();
  }

  importTheme(json) {
    const theme = JSON.parse(json);
    this.customTheme = theme;
    this.applyCustomTheme();
  }
}

export const createThemeCustomizer = (themeEngine) =>
  new ThemeCustomizer(themeEngine);

export default ThemeCustomizer;
