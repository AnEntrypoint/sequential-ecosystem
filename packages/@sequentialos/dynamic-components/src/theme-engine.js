// Theme engine facade - maintains 100% backward compatibility
import { ThemeManager } from './theme-manager.js';
import { ComponentThemeAdapter } from './component-theme-adapter.js';

export class ThemeEngine {
  constructor() {
    this.manager = new ThemeManager();
    this.adapter = new ComponentThemeAdapter(this);
  }

  createTheme(name, config) {
    return this.manager.createTheme(name, config);
  }

  setTheme(name) {
    return this.manager.setTheme(name);
  }

  getCurrentTheme() {
    return this.manager.getCurrentTheme();
  }

  getTheme(name) {
    return this.manager.getTheme(name);
  }

  getColor(colorName) {
    return this.manager.getColor(colorName);
  }

  getSpacing(size) {
    return this.manager.getSpacing(size);
  }

  getBorderRadius(size) {
    return this.manager.getBorderRadius(size);
  }

  getShadow(size) {
    return this.manager.getShadow(size);
  }

  getTypography(property, subproperty) {
    return this.manager.getTypography(property, subproperty);
  }

  overrideColor(colorName, value) {
    return this.manager.overrideColor(colorName, value);
  }

  setVariable(name, value) {
    return this.manager.setVariable(name, value);
  }

  getVariable(name) {
    return this.manager.getVariable(name);
  }

  getVariables() {
    return this.manager.getVariables();
  }

  buildCSSVariables() {
    return this.manager.buildCSSVariables();
  }

  applyCSSVariables(element) {
    return this.manager.applyCSSVariables(element);
  }

  getComponentStyles(componentType) {
    return this.adapter.getComponentStyles(componentType);
  }

  listThemes() {
    return this.manager.listThemes();
  }

  exportTheme(name) {
    return this.manager.exportTheme(name);
  }

  importTheme(name, json) {
    return this.manager.importTheme(name, json);
  }

  subscribe(callback) {
    return this.manager.subscribe(callback);
  }
}

export class ComponentThemeAdapter {
  constructor(themeEngine) {
    this.themeEngine = themeEngine;
  }

  applyThemeToProps(componentType, props) {
    return this.themeEngine.adapter.applyThemeToProps(componentType, props);
  }

  applyThemeToStyle(style) {
    return style;
  }

  buildThemedComponent(componentType, props) {
    return this.themeEngine.adapter.buildThemedComponent(componentType, props);
  }
}

export const createThemeEngine = () => new ThemeEngine();
export const createThemeAdapter = (themeEngine) => new ComponentThemeAdapter(themeEngine);
