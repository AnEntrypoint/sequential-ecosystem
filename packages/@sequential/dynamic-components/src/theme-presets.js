// Predefined theme presets
export class ThemePresets {
  constructor() {
    this.presets = this.initializePresets();
  }

  initializePresets() {
    return new Map([
      ['default', this.getDefaultTheme()],
      ['dark', this.getDarkTheme()],
      ['light', this.getLightTheme()],
      ['ocean', this.getOceanTheme()],
      ['forest', this.getForestTheme()],
      ['sunset', this.getSunsetTheme()],
      ['minimal', this.getMinimalTheme()],
      ['vibrant', this.getVibrantTheme()]
    ]);
  }

  getDefaultTheme() {
    return {
      name: 'Default',
      colors: {
        primary: '#0078d4', secondary: '#50e6ff', success: '#10b981', warning: '#f59e0b',
        danger: '#ef4444', background: '#0f172a', backgroundLight: '#1e293b',
        border: '#334155', text: '#e2e8f0', textMuted: '#94a3b8'
      },
      spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px' },
      borderRadius: { sm: '4px', md: '8px', lg: '12px', xl: '16px' }
    };
  }

  getDarkTheme() {
    return {
      name: 'Dark',
      colors: {
        primary: '#3b82f6', secondary: '#60a5fa', success: '#34d399', warning: '#fbbf24',
        danger: '#f87171', background: '#000000', backgroundLight: '#1f2937',
        border: '#374151', text: '#f3f4f6', textMuted: '#9ca3af'
      },
      spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px' },
      borderRadius: { sm: '4px', md: '8px', lg: '12px', xl: '16px' }
    };
  }

  getLightTheme() {
    return {
      name: 'Light',
      colors: {
        primary: '#2563eb', secondary: '#60a5fa', success: '#059669', warning: '#d97706',
        danger: '#dc2626', background: '#ffffff', backgroundLight: '#f3f4f6',
        border: '#e5e7eb', text: '#1f2937', textMuted: '#6b7280'
      },
      spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px' },
      borderRadius: { sm: '4px', md: '8px', lg: '12px', xl: '16px' }
    };
  }

  getOceanTheme() {
    return {
      name: 'Ocean',
      colors: {
        primary: '#0369a1', secondary: '#06b6d4', success: '#14b8a6', warning: '#f97316',
        danger: '#e11d48', background: '#0c2340', backgroundLight: '#164e63',
        border: '#0e7490', text: '#cffafe', textMuted: '#06b6d4'
      },
      spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px' },
      borderRadius: { sm: '4px', md: '8px', lg: '12px', xl: '16px' }
    };
  }

  getForestTheme() {
    return {
      name: 'Forest',
      colors: {
        primary: '#047857', secondary: '#10b981', success: '#34d399', warning: '#f59e0b',
        danger: '#dc2626', background: '#064e3b', backgroundLight: '#065f46',
        border: '#047857', text: '#d1fae5', textMuted: '#6ee7b7'
      },
      spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px' },
      borderRadius: { sm: '4px', md: '8px', lg: '12px', xl: '16px' }
    };
  }

  getSunsetTheme() {
    return {
      name: 'Sunset',
      colors: {
        primary: '#ea580c', secondary: '#f97316', success: '#84cc16', warning: '#eab308',
        danger: '#dc2626', background: '#451a03', backgroundLight: '#7c2d12',
        border: '#c2410c', text: '#fed7aa', textMuted: '#fdba74'
      },
      spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px' },
      borderRadius: { sm: '4px', md: '8px', lg: '12px', xl: '16px' }
    };
  }

  getMinimalTheme() {
    return {
      name: 'Minimal',
      colors: {
        primary: '#000000', secondary: '#404040', success: '#2d2d2d', warning: '#5a5a5a',
        danger: '#8b0000', background: '#ffffff', backgroundLight: '#f5f5f5',
        border: '#e0e0e0', text: '#000000', textMuted: '#808080'
      },
      spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px' },
      borderRadius: { sm: '2px', md: '4px', lg: '6px', xl: '8px' }
    };
  }

  getVibrantTheme() {
    return {
      name: 'Vibrant',
      colors: {
        primary: '#ff006e', secondary: '#8338ec', success: '#3a86ff', warning: '#ffbe0b',
        danger: '#ff006e', background: '#1a0033', backgroundLight: '#2d0052',
        border: '#8338ec', text: '#ffffff', textMuted: '#b797ff'
      },
      spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px' },
      borderRadius: { sm: '4px', md: '8px', lg: '12px', xl: '16px' }
    };
  }

  getPreset(name) {
    return this.presets.get(name);
  }

  listPresets() {
    return Array.from(this.presets.keys());
  }
}
