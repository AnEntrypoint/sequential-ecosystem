// Theme and design token management
export class ThemeTokenManager {
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
