// Template and preset selectors for visual builder
export class VisualSelectors {
  constructor(builder, themeEngine) {
    this.builder = builder;
    this.themeEngine = themeEngine;
    this.selectedTemplate = null;
    this.selectedPreset = null;
    this.listeners = new Map();
  }

  emit(event, data) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(cb => cb(data));
  }

  selectTemplate(name) {
    this.selectedTemplate = name;
    this.emit('templateSelected', { template: name });
  }

  selectPreset(name) {
    this.selectedPreset = name;
    this.emit('presetSelected', { preset: name });
  }

  buildTemplateSelector() {
    const templates = this.builder.listTemplates();
    return {
      type: 'flex',
      direction: 'column',
      gap: this.themeEngine.getSpacing('md'),
      style: { padding: this.themeEngine.getSpacing('lg') },
      children: [
        {
          type: 'heading',
          content: 'Select Template',
          level: 3,
          style: { marginBottom: this.themeEngine.getSpacing('md') }
        },
        {
          type: 'flex',
          direction: 'column',
          gap: this.themeEngine.getSpacing('sm'),
          children: templates.map(name => ({
            type: 'button',
            label: name.replace('-', ' ').toUpperCase(),
            onClick: () => this.selectTemplate(name),
            variant: this.selectedTemplate === name ? 'primary' : 'outline',
            style: { width: '100%' }
          }))
        }
      ]
    };
  }

  buildPresetSelector() {
    const presets = this.builder.listPresets();
    return {
      type: 'flex',
      direction: 'column',
      gap: this.themeEngine.getSpacing('md'),
      style: { padding: this.themeEngine.getSpacing('lg') },
      children: [
        {
          type: 'heading',
          content: 'Style Preset',
          level: 3,
          style: { marginBottom: this.themeEngine.getSpacing('md') }
        },
        {
          type: 'flex',
          direction: 'row',
          gap: this.themeEngine.getSpacing('sm'),
          children: presets.map(name => ({
            type: 'button',
            label: name,
            onClick: () => this.selectPreset(name),
            variant: this.selectedPreset === name ? 'primary' : 'outline'
          }))
        }
      ]
    };
  }
}
