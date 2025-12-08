export class ThemeCustomizer {
  constructor(themeEngine) {
    this.theme = themeEngine;
    this.customTheme = this.theme.getTheme();
    this.presets = this.initializePresets();
    this.currentPreset = 'default';
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
        primary: '#0078d4',
        secondary: '#50e6ff',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        background: '#0f172a',
        backgroundLight: '#1e293b',
        border: '#334155',
        text: '#e2e8f0',
        textMuted: '#94a3b8'
      },
      spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px' },
      borderRadius: { sm: '4px', md: '8px', lg: '12px', xl: '16px' }
    };
  }

  getDarkTheme() {
    return {
      name: 'Dark',
      colors: {
        primary: '#3b82f6',
        secondary: '#60a5fa',
        success: '#34d399',
        warning: '#fbbf24',
        danger: '#f87171',
        background: '#000000',
        backgroundLight: '#1f2937',
        border: '#374151',
        text: '#f3f4f6',
        textMuted: '#9ca3af'
      },
      spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px' },
      borderRadius: { sm: '4px', md: '8px', lg: '12px', xl: '16px' }
    };
  }

  getLightTheme() {
    return {
      name: 'Light',
      colors: {
        primary: '#2563eb',
        secondary: '#60a5fa',
        success: '#059669',
        warning: '#d97706',
        danger: '#dc2626',
        background: '#ffffff',
        backgroundLight: '#f3f4f6',
        border: '#e5e7eb',
        text: '#1f2937',
        textMuted: '#6b7280'
      },
      spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px' },
      borderRadius: { sm: '4px', md: '8px', lg: '12px', xl: '16px' }
    };
  }

  getOceanTheme() {
    return {
      name: 'Ocean',
      colors: {
        primary: '#0369a1',
        secondary: '#06b6d4',
        success: '#14b8a6',
        warning: '#f97316',
        danger: '#e11d48',
        background: '#0c2340',
        backgroundLight: '#164e63',
        border: '#0e7490',
        text: '#cffafe',
        textMuted: '#06b6d4'
      },
      spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px' },
      borderRadius: { sm: '4px', md: '8px', lg: '12px', xl: '16px' }
    };
  }

  getForestTheme() {
    return {
      name: 'Forest',
      colors: {
        primary: '#047857',
        secondary: '#10b981',
        success: '#34d399',
        warning: '#f59e0b',
        danger: '#dc2626',
        background: '#064e3b',
        backgroundLight: '#065f46',
        border: '#047857',
        text: '#d1fae5',
        textMuted: '#6ee7b7'
      },
      spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px' },
      borderRadius: { sm: '4px', md: '8px', lg: '12px', xl: '16px' }
    };
  }

  getSunsetTheme() {
    return {
      name: 'Sunset',
      colors: {
        primary: '#ea580c',
        secondary: '#f97316',
        success: '#84cc16',
        warning: '#eab308',
        danger: '#dc2626',
        background: '#451a03',
        backgroundLight: '#7c2d12',
        border: '#c2410c',
        text: '#fed7aa',
        textMuted: '#fdba74'
      },
      spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px' },
      borderRadius: { sm: '4px', md: '8px', lg: '12px', xl: '16px' }
    };
  }

  getMinimalTheme() {
    return {
      name: 'Minimal',
      colors: {
        primary: '#000000',
        secondary: '#404040',
        success: '#2d2d2d',
        warning: '#5a5a5a',
        danger: '#8b0000',
        background: '#ffffff',
        backgroundLight: '#f5f5f5',
        border: '#e0e0e0',
        text: '#000000',
        textMuted: '#808080'
      },
      spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px' },
      borderRadius: { sm: '2px', md: '4px', lg: '6px', xl: '8px' }
    };
  }

  getVibrantTheme() {
    return {
      name: 'Vibrant',
      colors: {
        primary: '#ff006e',
        secondary: '#8338ec',
        success: '#3a86ff',
        warning: '#ffbe0b',
        danger: '#ff006e',
        background: '#1a0033',
        backgroundLight: '#2d0052',
        border: '#8338ec',
        text: '#ffffff',
        textMuted: '#b797ff'
      },
      spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px' },
      borderRadius: { sm: '4px', md: '8px', lg: '12px', xl: '16px' }
    };
  }

  buildThemeCustomizerUI() {
    return {
      type: 'flex',
      direction: 'column',
      style: { height: '100vh', padding: this.theme.getSpacing('lg'), gap: this.theme.getSpacing('lg') },
      children: [
        { type: 'heading', content: 'Theme Customizer', level: 1, style: { margin: 0 } },
        {
          type: 'flex',
          direction: 'row',
          gap: this.theme.getSpacing('lg'),
          style: { flex: 1 },
          children: [
            this.buildPresetSelector(),
            this.buildColorEditor(),
            this.buildPreview()
          ]
        }
      ]
    };
  }

  buildPresetSelector() {
    return {
      type: 'card',
      variant: 'flat',
      style: {
        width: '200px',
        padding: this.theme.getSpacing('lg'),
        overflow: 'auto'
      },
      children: [
        { type: 'heading', content: 'Presets', level: 3, style: { margin: 0, marginBottom: this.theme.getSpacing('md') } },
        {
          type: 'flex',
          direction: 'column',
          gap: this.theme.getSpacing('sm'),
          children: Array.from(this.presets.keys()).map(preset => ({
            type: 'button',
            label: this.presets.get(preset).name,
            onClick: () => this.selectPreset(preset),
            variant: this.currentPreset === preset ? 'primary' : 'secondary',
            style: { width: '100%', textAlign: 'left', padding: this.theme.getSpacing('sm') }
          }))
        }
      ]
    };
  }

  buildColorEditor() {
    const colors = this.customTheme.colors || {};

    return {
      type: 'card',
      variant: 'flat',
      style: {
        flex: 1,
        padding: this.theme.getSpacing('lg'),
        overflow: 'auto'
      },
      children: [
        { type: 'heading', content: 'Colors', level: 3, style: { margin: 0, marginBottom: this.theme.getSpacing('md') } },
        {
          type: 'flex',
          direction: 'column',
          gap: this.theme.getSpacing('md'),
          children: Object.entries(colors).map(([colorKey, colorValue]) =>
            this.buildColorField(colorKey, colorValue)
          )
        }
      ]
    };
  }

  buildColorField(key, value) {
    return {
      type: 'flex',
      direction: 'row',
      gap: this.theme.getSpacing('md'),
      style: { alignItems: 'center' },
      children: [
        {
          type: 'paragraph',
          content: key,
          style: { fontSize: '12px', fontWeight: '600', margin: 0, minWidth: '120px' }
        },
        {
          type: 'input',
          placeholder: '#000000',
          value: value,
          onChange: (newValue) => {
            this.customTheme.colors[key] = newValue;
            this.applyCustomTheme();
          },
          style: { flex: 1, padding: this.theme.getSpacing('sm'), fontFamily: 'monospace' }
        },
        {
          type: 'box',
          style: {
            width: '32px',
            height: '32px',
            background: value,
            borderRadius: '4px',
            border: `1px solid ${this.theme.getColor('border')}`
          }
        }
      ]
    };
  }

  buildPreview() {
    return {
      type: 'card',
      variant: 'elevated',
      style: {
        width: '300px',
        padding: this.theme.getSpacing('lg'),
        overflow: 'auto'
      },
      children: [
        { type: 'heading', content: 'Preview', level: 3, style: { margin: 0, marginBottom: this.theme.getSpacing('md') } },
        {
          type: 'flex',
          direction: 'column',
          gap: this.theme.getSpacing('md'),
          children: [
            {
              type: 'button',
              label: 'Primary Button',
              variant: 'primary',
              style: { width: '100%' }
            },
            {
              type: 'button',
              label: 'Secondary Button',
              variant: 'secondary',
              style: { width: '100%' }
            },
            {
              type: 'card',
              variant: 'flat',
              style: { padding: this.theme.getSpacing('md') },
              children: [
                { type: 'heading', content: 'Card Preview', level: 4, style: { margin: 0, marginBottom: this.theme.getSpacing('sm') } },
                { type: 'paragraph', content: 'This is a preview of how your theme looks.', style: { margin: 0, fontSize: '12px' } }
              ]
            },
            {
              type: 'flex',
              direction: 'column',
              gap: this.theme.getSpacing('sm'),
              style: { marginTop: this.theme.getSpacing('md') },
              children: [
                { type: 'paragraph', content: 'Text Color', style: { margin: 0 } },
                { type: 'paragraph', content: 'Muted Text Color', style: { margin: 0, color: this.theme.getColor('textMuted') } }
              ]
            }
          ]
        }
      ]
    };
  }

  selectPreset(presetName) {
    this.currentPreset = presetName;
    const preset = this.presets.get(presetName);
    this.customTheme = JSON.parse(JSON.stringify(preset));
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
