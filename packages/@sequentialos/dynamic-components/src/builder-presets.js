// Preset registry and default presets for advanced builder
export class BuilderPresets {
  constructor(themeEngine) {
    this.themeEngine = themeEngine;
    this.presets = new Map();
    this.registerDefaults();
  }

  registerDefaults() {
    this.registerPreset('light', {
      background: this.themeEngine.getColor('background'),
      text: this.themeEngine.getColor('text'),
      border: this.themeEngine.getColor('border'),
      padding: this.themeEngine.getSpacing('lg')
    });

    this.registerPreset('dark', {
      background: '#1a1a1a',
      text: '#e0e0e0',
      border: '#3e3e42',
      padding: this.themeEngine.getSpacing('lg')
    });

    this.registerPreset('compact', {
      padding: this.themeEngine.getSpacing('sm'),
      gap: this.themeEngine.getSpacing('xs'),
      fontSize: '12px'
    });

    this.registerPreset('spacious', {
      padding: this.themeEngine.getSpacing('xl'),
      gap: this.themeEngine.getSpacing('lg'),
      fontSize: '16px'
    });
  }

  registerPreset(name, config) {
    this.presets.set(name, config);
    return this;
  }

  applyPreset(component, presetName) {
    const preset = this.presets.get(presetName);
    if (!preset) throw new Error(`Preset ${presetName} not found`);

    return {
      ...component,
      style: {
        ...component.style,
        ...preset
      }
    };
  }

  getPreset(name) {
    return this.presets.get(name);
  }

  listPresets() {
    return Array.from(this.presets.keys());
  }
}
