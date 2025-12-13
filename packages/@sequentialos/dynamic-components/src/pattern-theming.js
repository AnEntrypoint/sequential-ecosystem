// Pattern theming facade - maintains 100% backward compatibility
import { ThemeTokenManager } from './theme-token-manager.js';
import { ThemeApplication } from './theme-application.js';
import { ThemeBuilder } from './theme-builder.js';
import { ThemeUIBuilder } from './theme-ui-builder.js';
import { ThemePersistence } from './theme-persistence.js';

class PatternThemeManager {
  constructor() {
    this.tokenManager = new ThemeTokenManager();
    this.application = new ThemeApplication(this.tokenManager);
    this.builder = new ThemeBuilder(this.tokenManager);
    this.uiBuilder = new ThemeUIBuilder(this.tokenManager);
    this.persistence = new ThemePersistence(this.tokenManager);

    // Expose for backward compatibility
    this.themes = this.tokenManager.themes;
    this.currentTheme = this.tokenManager.currentTheme;
    this.designTokens = this.tokenManager.designTokens;
    this.tokenGroups = this.tokenManager.tokenGroups;
  }

  // Delegate to token manager
  initializeDefaultTheme() {
    this.tokenManager.initializeDefaultTheme();
  }

  registerTheme(themeName, tokens) {
    this.tokenManager.registerTheme(themeName, tokens);
  }

  setDesignTokens(tokens) {
    this.tokenManager.setDesignTokens(tokens);
  }

  switchTheme(themeName) {
    return this.tokenManager.switchTheme(themeName);
  }

  getCurrentTheme() {
    return this.tokenManager.getCurrentTheme();
  }

  getThemeList() {
    return this.tokenManager.getThemeList();
  }

  // Delegate to application
  getToken(path) {
    return this.application.getToken(path);
  }

  applyThemeToComponent(component, themeName = null) {
    return this.application.applyThemeToComponent(component, themeName);
  }

  applyTokensToStyle(style, tokens) {
    return this.application.applyTokensToStyle(style, tokens);
  }

  // Delegate to builder
  createThemeVariant(baseName, variantName, overrides = {}) {
    return this.builder.createThemeVariant(baseName, variantName, overrides);
  }

  createDarkTheme() {
    return this.builder.createDarkTheme();
  }

  createLightTheme() {
    return this.builder.createLightTheme();
  }

  createCustomTheme(themeName, colorScheme) {
    return this.builder.createCustomTheme(themeName, colorScheme);
  }

  // Delegate to UI builder
  buildThemeSwitcher() {
    return this.uiBuilder.buildThemeSwitcher();
  }

  buildDesignTokensPanel() {
    return this.uiBuilder.buildDesignTokensPanel();
  }

  tokenToString(value) {
    return this.uiBuilder.tokenToString(value);
  }

  // Delegate to persistence
  exportTheme(themeName = null) {
    return this.persistence.exportTheme(themeName);
  }

  exportAllThemes() {
    return this.persistence.exportAllThemes();
  }

  importTheme(themeData) {
    return this.persistence.importTheme(themeData);
  }
}

function createPatternThemeManager() {
  return new PatternThemeManager();
}

export { PatternThemeManager, createPatternThemeManager };
