class PatternThemeManager {
  constructor() {
    this.themes = new Map();
    this.currentTheme = 'default';
    this.designTokens = new Map();
    this.tokenGroups = new Map();
    this.initializeDefaultTheme();
  }

  initializeDefaultTheme() {
    const defaultTokens = {
      colors: {
        primary: '#667eea',
        secondary: '#764ba2',
        accent: '#f59e0b',
        success: '#4ade80',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',
        neutral: '#858585',
        background: '#1e1e1e',
        surface: '#2d2d30',
        border: '#3e3e42',
        text: '#d4d4d4',
        textLight: '#858585'
      },
      typography: {
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        fontSize: {
          xs: '12px',
          sm: '13px',
          base: '14px',
          lg: '16px',
          xl: '18px',
          '2xl': '20px',
          '3xl': '24px'
        },
        fontWeight: {
          light: 300,
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700
        },
        lineHeight: {
          tight: 1.2,
          normal: 1.5,
          relaxed: 1.75,
          loose: 2
        }
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '32px'
      },
      radius: {
        sm: '2px',
        md: '4px',
        lg: '6px',
        xl: '8px',
        full: '9999px'
      },
      shadows: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px rgba(0, 0, 0, 0.1)'
      },
      transitions: {
        fast: '100ms',
        normal: '200ms',
        slow: '300ms'
      }
    };

    this.registerTheme('default', defaultTokens);
    this.setDesignTokens(defaultTokens);
  }

  registerTheme(themeName, tokens) {
    const theme = {
      name: themeName,
      tokens,
      created: Date.now(),
      updated: Date.now()
    };

    this.themes.set(themeName, theme);
  }

  setDesignTokens(tokens) {
    Object.entries(tokens).forEach(([group, groupTokens]) => {
      this.designTokens.set(group, groupTokens);
      this.tokenGroups.set(group, Object.keys(groupTokens));
    });
  }

  switchTheme(themeName) {
    const theme = this.themes.get(themeName);
    if (!theme) return false;

    this.currentTheme = themeName;
    this.setDesignTokens(theme.tokens);
    return true;
  }

  getToken(path) {
    const parts = path.split('.');
    let value = null;

    if (this.designTokens.has(parts[0])) {
      value = this.designTokens.get(parts[0]);

      for (let i = 1; i < parts.length; i++) {
        if (value && typeof value === 'object') {
          value = value[parts[i]];
        } else {
          return null;
        }
      }
    }

    return value;
  }

  createThemeVariant(baseName, variantName, overrides = {}) {
    const baseTheme = this.themes.get(baseName);
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

    this.registerTheme(variantName, variantTokens);
    return this.themes.get(variantName);
  }

  applyThemeToComponent(component, themeName = null) {
    const theme = themeName ? this.themes.get(themeName) : this.themes.get(this.currentTheme);
    if (!theme) return component;

    const tokens = theme.tokens;
    const styled = JSON.parse(JSON.stringify(component));

    if (styled.style) {
      styled.style = this.applyTokensToStyle(styled.style, tokens);
    }

    if (styled.children && Array.isArray(styled.children)) {
      styled.children = styled.children.map(child =>
        this.applyThemeToComponent(child, themeName)
      );
    }

    return styled;
  }

  applyTokensToStyle(style, tokens) {
    const newStyle = { ...style };

    Object.entries(newStyle).forEach(([key, value]) => {
      if (typeof value === 'string' && value.startsWith('token(')) {
        const tokenPath = value.match(/token\(([^)]+)\)/)?.[1];
        if (tokenPath) {
          const tokenValue = this.getToken(tokenPath);
          if (tokenValue !== null) {
            newStyle[key] = tokenValue;
          }
        }
      }
    });

    return newStyle;
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

    this.registerTheme(themeName, { ...this.themes.get('default').tokens, ...tokens });
    return this.themes.get(themeName);
  }

  buildThemeSwitcher() {
    const themeNames = Array.from(this.themes.keys());

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '12px',
        background: '#1e1e1e',
        borderRadius: '6px'
      },
      children: [
        {
          type: 'heading',
          content: '🎨 Theme Selector',
          level: 3,
          style: {
            margin: 0,
            fontSize: '12px',
            color: '#e0e0e0',
            textTransform: 'uppercase'
          }
        },
        {
          type: 'box',
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '6px'
          },
          children: themeNames.map(name => ({
            type: 'box',
            style: {
              padding: '8px 12px',
              background: this.currentTheme === name ? '#667eea' : '#2d2d30',
              borderRadius: '4px',
              cursor: 'pointer',
              border: this.currentTheme === name ? '1px solid #667eea' : '1px solid #3e3e42',
              fontSize: '10px',
              color: this.currentTheme === name ? '#fff' : '#d4d4d4'
            },
            children: [{
              type: 'paragraph',
              content: name.charAt(0).toUpperCase() + name.slice(1),
              style: { margin: 0 }
            }]
          }))
        }
      ]
    };
  }

  buildDesignTokensPanel() {
    const groups = Array.from(this.tokenGroups.keys());

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '12px',
        background: '#1e1e1e',
        borderRadius: '6px'
      },
      children: [
        {
          type: 'heading',
          content: '🎛️ Design Tokens',
          level: 3,
          style: {
            margin: 0,
            fontSize: '12px',
            color: '#e0e0e0',
            textTransform: 'uppercase'
          }
        },
        ...groups.map(group => {
          const groupTokens = this.designTokens.get(group);
          return {
            type: 'box',
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              padding: '8px',
              background: '#2d2d30',
              borderRadius: '4px'
            },
            children: [
              {
                type: 'heading',
                content: group.charAt(0).toUpperCase() + group.slice(1),
                level: 4,
                style: {
                  margin: 0,
                  fontSize: '10px',
                  color: '#667eea'
                }
              },
              ...Object.entries(groupTokens).slice(0, 3).map(([token, value]) => ({
                type: 'paragraph',
                content: `${token}: ${this.tokenToString(value)}`,
                style: {
                  margin: 0,
                  fontSize: '8px',
                  color: '#858585',
                  fontFamily: 'monospace',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }
              }))
            ]
          };
        })
      ]
    };
  }

  tokenToString(value) {
    if (typeof value === 'string') {
      return value;
    } else if (typeof value === 'object') {
      return JSON.stringify(value).substring(0, 30) + '...';
    }
    return String(value);
  }

  exportTheme(themeName = null) {
    const name = themeName || this.currentTheme;
    const theme = this.themes.get(name);

    if (!theme) return null;

    return {
      name: theme.name,
      created: new Date(theme.created).toISOString(),
      updated: new Date(theme.updated).toISOString(),
      tokens: theme.tokens,
      exportedAt: new Date().toISOString()
    };
  }

  exportAllThemes() {
    const themes = {};
    this.themes.forEach((theme, name) => {
      themes[name] = this.exportTheme(name);
    });
    return themes;
  }

  importTheme(themeData) {
    if (!themeData.name || !themeData.tokens) return false;

    this.registerTheme(themeData.name, themeData.tokens);
    return true;
  }

  getCurrentTheme() {
    return this.themes.get(this.currentTheme);
  }

  getThemeList() {
    return Array.from(this.themes.keys()).map(name => ({
      name,
      current: name === this.currentTheme,
      created: this.themes.get(name).created
    }));
  }
}

function createPatternThemeManager() {
  return new PatternThemeManager();
}

export { PatternThemeManager, createPatternThemeManager };
