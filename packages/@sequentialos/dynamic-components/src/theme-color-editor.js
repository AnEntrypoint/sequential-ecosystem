// Theme color editor UI
export class ThemeColorEditor {
  constructor(theme, customTheme) {
    this.theme = theme;
    this.customTheme = customTheme;
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
}
