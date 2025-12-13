// Theme management and CSS variables
import { ThemePresets } from './theme-presets.js';

export class ThemeManager {
  constructor() {
    this.themes = new Map();
    this.currentTheme = 'default';
    this.overrides = new Map();
    this.listeners = [];
    this.initializeDefaultThemes();
  }

  initializeDefaultThemes() {
    Object.entries(ThemePresets.getDefaultThemes()).forEach(([name, config]) => {
      this.createTheme(name, config);
    });
  }

  createTheme(name, config) {
    this.themes.set(name, config);
    return this;
  }

  setTheme(name) {
    if (!this.themes.has(name)) throw new Error(`Theme ${name} not found`);
    this.currentTheme = name;
    this.notifyListeners();
    return this;
  }

  getCurrentTheme() {
    return this.themes.get(this.currentTheme);
  }

  getTheme(name) {
    return this.themes.get(name) || this.themes.get('default');
  }

  getColor(colorName) {
    const theme = this.getCurrentTheme();
    if (this.overrides.has(`color:${colorName}`)) return this.overrides.get(`color:${colorName}`);
    return theme.colors[colorName];
  }

  getSpacing(size) {
    return this.getCurrentTheme().spacing[size];
  }

  getBorderRadius(size) {
    return this.getCurrentTheme().borderRadius[size];
  }

  getShadow(size) {
    return this.getCurrentTheme().shadows[size];
  }

  getTypography(property, subproperty) {
    const theme = this.getCurrentTheme();
    if (!subproperty) return theme.typography[property];
    return theme.typography[property]?.[subproperty];
  }

  overrideColor(colorName, value) {
    this.overrides.set(`color:${colorName}`, value);
    this.notifyListeners();
    return this;
  }

  buildCSSVariables() {
    const theme = this.getCurrentTheme();
    const cssVars = {};
    Object.entries(theme.colors).forEach(([key, value]) => (cssVars[`--color-${key}`] = value));
    Object.entries(theme.spacing).forEach(([key, value]) => (cssVars[`--spacing-${key}`] = value));
    Object.entries(theme.borderRadius).forEach(([key, value]) => (cssVars[`--radius-${key}`] = value));
    Object.entries(theme.shadows).forEach(([key, value]) => (cssVars[`--shadow-${key}`] = value));
    Object.entries(theme.typography).forEach(([key, value]) => {
      if (typeof value === 'string') cssVars[`--font-${key}`] = value;
      else Object.entries(value).forEach(([subkey, subvalue]) => (cssVars[`--font-${key}-${subkey}`] = subvalue));
    });
    return cssVars;
  }

  applyCSSVariables(element = document.documentElement) {
    const vars = this.buildCSSVariables();
    Object.entries(vars).forEach(([key, value]) => element.style.setProperty(key, value));
    return this;
  }

  listThemes() {
    return Array.from(this.themes.keys());
  }

  exportTheme(name) {
    return JSON.stringify(this.themes.get(name), null, 2);
  }

  importTheme(name, json) {
    const theme = typeof json === 'string' ? JSON.parse(json) : json;
    this.createTheme(name, theme);
    return this;
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  notifyListeners() {
    this.listeners.forEach(callback => callback(this.currentTheme, this.getCurrentTheme()));
  }
}
