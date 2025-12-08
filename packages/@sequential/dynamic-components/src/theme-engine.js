export class ThemeEngine {
  constructor() {
    this.themes = new Map();
    this.currentTheme = 'default';
    this.variables = new Map();
    this.overrides = new Map();
    this.initializeDefaultTheme();
  }

  initializeDefaultTheme() {
    this.createTheme('default', {
      colors: {
        primary: '#667eea',
        secondary: '#764ba2',
        success: '#48bb78',
        warning: '#f6ad55',
        danger: '#ef4444',
        info: '#3b82f6',
        text: '#1a1a1a',
        textLight: '#666666',
        textMuted: '#999999',
        background: '#ffffff',
        backgroundLight: '#f5f5f5',
        border: '#e0e0e0',
        borderLight: '#f0f0f0'
      },
      typography: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: {
          xs: '11px',
          sm: '12px',
          base: '14px',
          lg: '16px',
          xl: '18px',
          '2xl': '24px'
        },
        fontWeight: {
          light: '300',
          normal: '400',
          medium: '500',
          semibold: '600',
          bold: '700'
        },
        lineHeight: {
          tight: '1.2',
          normal: '1.5',
          relaxed: '1.75'
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
      borderRadius: {
        none: '0',
        sm: '2px',
        md: '4px',
        lg: '8px',
        xl: '12px',
        full: '999px'
      },
      shadows: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px rgba(0, 0, 0, 0.1)'
      },
      transitions: {
        fast: '0.15s ease-in-out',
        base: '0.2s ease-in-out',
        slow: '0.3s ease-in-out'
      }
    });

    this.createTheme('dark', {
      colors: {
        primary: '#8b5cf6',
        secondary: '#a78bfa',
        success: '#34d399',
        warning: '#fbbf24',
        danger: '#f87171',
        info: '#60a5fa',
        text: '#e0e0e0',
        textLight: '#999999',
        textMuted: '#666666',
        background: '#1a1a1a',
        backgroundLight: '#2d2d30',
        border: '#3e3e42',
        borderLight: '#555555'
      },
      typography: { ...this.themes.get('default').typography },
      spacing: { ...this.themes.get('default').spacing },
      borderRadius: { ...this.themes.get('default').borderRadius },
      shadows: { ...this.themes.get('default').shadows },
      transitions: { ...this.themes.get('default').transitions }
    });

    this.createTheme('light', {
      colors: {
        primary: '#0e639c',
        secondary: '#1177bb',
        success: '#16a34a',
        warning: '#d97706',
        danger: '#dc2626',
        info: '#2563eb',
        text: '#0f0f0f',
        textLight: '#4b5563',
        textMuted: '#8b8b8b',
        background: '#fafafa',
        backgroundLight: '#ffffff',
        border: '#d1d5db',
        borderLight: '#e5e7eb'
      },
      typography: { ...this.themes.get('default').typography },
      spacing: { ...this.themes.get('default').spacing },
      borderRadius: { ...this.themes.get('default').borderRadius },
      shadows: { ...this.themes.get('default').shadows },
      transitions: { ...this.themes.get('default').transitions }
    });
  }

  createTheme(name, config) {
    this.themes.set(name, config);
    return this;
  }

  setTheme(name) {
    if (!this.themes.has(name)) {
      throw new Error(`Theme ${name} not found`);
    }
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
    if (this.overrides.has(`color:${colorName}`)) {
      return this.overrides.get(`color:${colorName}`);
    }
    return theme.colors[colorName];
  }

  getSpacing(size) {
    const theme = this.getCurrentTheme();
    return theme.spacing[size];
  }

  getBorderRadius(size) {
    const theme = this.getCurrentTheme();
    return theme.borderRadius[size];
  }

  getShadow(size) {
    const theme = this.getCurrentTheme();
    return theme.shadows[size];
  }

  getTypography(property, subproperty) {
    const theme = this.getCurrentTheme();
    if (!subproperty) {
      return theme.typography[property];
    }
    return theme.typography[property]?.[subproperty];
  }

  overrideColor(colorName, value) {
    this.overrides.set(`color:${colorName}`, value);
    this.notifyListeners();
    return this;
  }

  setVariable(name, value) {
    this.variables.set(name, value);
    return this;
  }

  getVariable(name) {
    return this.variables.get(name);
  }

  getVariables() {
    return Object.fromEntries(this.variables);
  }

  buildCSSVariables() {
    const theme = this.getCurrentTheme();
    const cssVars = {};

    Object.entries(theme.colors).forEach(([key, value]) => {
      cssVars[`--color-${key}`] = value;
    });

    Object.entries(theme.spacing).forEach(([key, value]) => {
      cssVars[`--spacing-${key}`] = value;
    });

    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      cssVars[`--radius-${key}`] = value;
    });

    Object.entries(theme.shadows).forEach(([key, value]) => {
      cssVars[`--shadow-${key}`] = value;
    });

    Object.entries(theme.typography).forEach(([key, value]) => {
      if (typeof value === 'string') {
        cssVars[`--font-${key}`] = value;
      } else {
        Object.entries(value).forEach(([subkey, subvalue]) => {
          cssVars[`--font-${key}-${subkey}`] = subvalue;
        });
      }
    });

    return cssVars;
  }

  applyCSSVariables(element = document.documentElement) {
    const vars = this.buildCSSVariables();
    Object.entries(vars).forEach(([key, value]) => {
      element.style.setProperty(key, value);
    });
    return this;
  }

  getComponentStyles(componentType) {
    const theme = this.getCurrentTheme();
    const styles = {
      heading: {
        color: this.getColor('text'),
        fontFamily: theme.typography.fontFamily,
        fontWeight: theme.typography.fontWeight.semibold,
        lineHeight: theme.typography.lineHeight.tight
      },
      button: {
        background: this.getColor('primary'),
        color: 'white',
        padding: `${this.getSpacing('sm')} ${this.getSpacing('lg')}`,
        borderRadius: this.getBorderRadius('md'),
        fontWeight: theme.typography.fontWeight.semibold,
        border: 'none',
        cursor: 'pointer',
        transition: theme.transitions.base,
        boxShadow: this.getShadow('md')
      },
      input: {
        background: this.getColor('backgroundLight'),
        color: this.getColor('text'),
        border: `1px solid ${this.getColor('border')}`,
        padding: `${this.getSpacing('sm')} ${this.getSpacing('md')}`,
        borderRadius: this.getBorderRadius('md'),
        fontFamily: theme.typography.fontFamily,
        fontSize: theme.typography.fontSize.base
      },
      card: {
        background: this.getColor('backgroundLight'),
        border: `1px solid ${this.getColor('border')}`,
        borderRadius: this.getBorderRadius('lg'),
        padding: this.getSpacing('lg'),
        boxShadow: this.getShadow('sm')
      },
      section: {
        background: this.getColor('background'),
        padding: this.getSpacing('lg'),
        borderRadius: this.getBorderRadius('lg'),
        border: `1px solid ${this.getColor('borderLight')}`
      }
    };

    return styles[componentType] || {};
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

  listeners = [];

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  notifyListeners() {
    this.listeners.forEach(callback => {
      callback(this.currentTheme, this.getCurrentTheme());
    });
  }
}

export class ComponentThemeAdapter {
  constructor(themeEngine) {
    this.themeEngine = themeEngine;
  }

  applyThemeToProps(componentType, props) {
    const styles = this.themeEngine.getComponentStyles(componentType);
    return {
      ...props,
      style: { ...styles, ...(props.style || {}) }
    };
  }

  applyThemeToStyle(style) {
    return Object.entries(style).reduce((acc, [key, value]) => {
      if (typeof value === 'string' && value.startsWith('$')) {
        acc[key] = this.themeEngine.getVariable(value.slice(1));
      } else {
        acc[key] = value;
      }
      return acc;
    }, {});
  }

  buildThemedComponent(componentType, props) {
    const themed = this.applyThemeToProps(componentType, props);
    return this.applyThemeToStyle(themed.style || {});
  }
}

export const createThemeEngine = () => new ThemeEngine();
export const createThemeAdapter = (themeEngine) => new ComponentThemeAdapter(themeEngine);
