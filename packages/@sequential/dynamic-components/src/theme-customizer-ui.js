// Theme customizer UI builders
export class ThemeCustomizerUI {
  constructor(themeEngine, customTheme, currentPreset, presets) {
    this.theme = themeEngine;
    this.customTheme = customTheme;
    this.currentPreset = currentPreset;
    this.presets = presets;
  }

  buildThemeCustomizerUI(onPresetSelect) {
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
            this.buildPresetSelector(onPresetSelect),
            this.buildColorEditor(),
            this.buildPreview()
          ]
        }
      ]
    };
  }

  buildPresetSelector(onPresetSelect) {
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
            onClick: () => onPresetSelect(preset),
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
}
