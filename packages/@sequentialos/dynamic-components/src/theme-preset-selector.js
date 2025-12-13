// Theme preset selector UI
export class ThemePresetSelector {
  constructor(theme, presets, currentPreset) {
    this.theme = theme;
    this.presets = presets;
    this.currentPreset = currentPreset;
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
}
