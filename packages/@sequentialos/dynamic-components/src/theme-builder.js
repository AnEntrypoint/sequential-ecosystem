// Theme variant creation and preset builders
export class ThemeBuilder {
  constructor(tokenManager) {
    this.tokenManager = tokenManager;
  }

  createThemeVariant(baseName, variantName, overrides = {}) {
    const baseTheme = this.tokenManager.themes.get(baseName);
    if (!baseTheme) return null;

    const variantTokens = JSON.parse(JSON.stringify(baseTheme.tokens));

    const applyOverrides = (target, overrides, path = []) => {
      Object.entries(overrides).forEach(([key, value]) => {
        const currentPath = [...path, key];

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          if (!target[key]) target[key] = {};
          applyOverrides(target[key], value, currentPath);
        } else {
          target[key] = value;
        }
      });
    };

    applyOverrides(variantTokens, overrides);

    this.tokenManager.registerTheme(variantName, variantTokens);
    return this.tokenManager.themes.get(variantName);
  }

  createDarkTheme() {
    return this.createThemeVariant('default', 'dark', {
      colors: {
        background: '#0f0f0f',
        surface: '#1a1a1a',
        border: '#2d2d2d',
        text: '#e0e0e0',
        textLight: '#999999'
      }
    });
  }

  createLightTheme() {
    return this.createThemeVariant('default', 'light', {
      colors: {
        primary: '#5b5bea',
        secondary: '#6b4a9a',
        background: '#ffffff',
        surface: '#f5f5f5',
        border: '#e0e0e0',
        text: '#333333',
        textLight: '#666666'
      }
    });
  }

  createCustomTheme(themeName, colorScheme) {
    const tokens = {
      colors: {
        primary: colorScheme.primary || '#667eea',
        secondary: colorScheme.secondary || '#764ba2',
        accent: colorScheme.accent || '#f59e0b',
        success: colorScheme.success || '#4ade80',
        error: colorScheme.error || '#ef4444',
        warning: colorScheme.warning || '#f59e0b',
        info: colorScheme.info || '#3b82f6',
        background: colorScheme.background || '#1e1e1e',
        surface: colorScheme.surface || '#2d2d30',
        border: colorScheme.border || '#3e3e42',
        text: colorScheme.text || '#d4d4d4',
        textLight: colorScheme.textLight || '#858585'
      }
    };

    this.tokenManager.registerTheme(themeName, {
      ...this.tokenManager.themes.get('default').tokens,
      ...tokens
    });
    return this.tokenManager.themes.get(themeName);
  }
}
