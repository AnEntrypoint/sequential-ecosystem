import { defaultThemeLight, themePresets } from './theme-defaults.js';
import { buildCustomizerUI } from './ui-builders.js';

class ThemeCustomizerUI {
  constructor(uiToolkit) {
    this.toolkit = uiToolkit;
    this.currentTheme = { ...defaultThemeLight };
    this.presets = { ...themePresets };
    this.listeners = [];
    this.previewElement = null;
  }

  applyPreset(presetName) {
    const preset = this.presets[presetName];

    if (!preset) return false;

    Object.assign(this.currentTheme.colors, preset.colors);

    this.notifyListeners('presetApplied', { presetName, theme: this.currentTheme });

    return true;
  }

  updateColor(colorName, value) {
    if (!this.currentTheme.colors.hasOwnProperty(colorName)) {
      return false;
    }

    this.currentTheme.colors[colorName] = value;

    this.notifyListeners('colorUpdated', { colorName, value });

    return true;
  }

  updateSpacing(spacingName, value) {
    if (!this.currentTheme.spacing.hasOwnProperty(spacingName)) {
      return false;
    }

    this.currentTheme.spacing[spacingName] = value;

    this.notifyListeners('spacingUpdated', { spacingName, value });

    return true;
  }

  updateRadius(radiusName, value) {
    if (!this.currentTheme.radius.hasOwnProperty(radiusName)) {
      return false;
    }

    this.currentTheme.radius[radiusName] = value;

    this.notifyListeners('radiusUpdated', { radiusName, value });

    return true;
  }

  generateCSS() {
    let css = ':root {\n';

    Object.entries(this.currentTheme.colors).forEach(([name, value]) => {
      css += `  --color-${this.toKebab(name)}: ${value};\n`;
    });

    Object.entries(this.currentTheme.spacing).forEach(([name, value]) => {
      css += `  --spacing-${name}: ${value};\n`;
    });

    Object.entries(this.currentTheme.radius).forEach(([name, value]) => {
      css += `  --radius-${name}: ${value};\n`;
    });

    Object.entries(this.currentTheme.shadows).forEach(([name, value]) => {
      css += `  --shadow-${name}: ${value};\n`;
    });

    css += '}\n';

    return css;
  }

  buildCustomizerUI() {
    return buildCustomizerUI(this.currentTheme, this.presets);
  }

  toLabel(name) {
    return name.replace(/([A-Z])/g, ' $1').trim().charAt(0).toUpperCase() + name.replace(/([A-Z])/g, ' $1').trim().slice(1);
  }

  toKebab(name) {
    return name.replace(/([A-Z])/g, '-$1').toLowerCase();
  }

  exportJSON() {
    return JSON.stringify(this.currentTheme, null, 2);
  }

  exportCSS() {
    return this.generateCSS();
  }

  on(event, callback) {
    this.listeners.push({ event, callback });
    return this;
  }

  off(event, callback) {
    this.listeners = this.listeners.filter(
      l => !(l.event === event && l.callback === callback)
    );
    return this;
  }

  notifyListeners(event, data) {
    this.listeners
      .filter(l => l.event === event)
      .forEach(l => {
        try {
          l.callback(data);
        } catch (e) {
          console.error(`Theme customizer listener error for ${event}:`, e);
        }
      });
  }

  clear() {
    this.listeners = [];
    return this;
  }
}

function createThemeCustomizerUI(uiToolkit) {
  return new ThemeCustomizerUI(uiToolkit);
}

export { ThemeCustomizerUI, createThemeCustomizerUI };
