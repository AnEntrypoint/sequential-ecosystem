// Theme customizer UI facade - delegates to specialized builders
import { ThemePresetSelector } from './theme-preset-selector.js';
import { ThemeColorEditor } from './theme-color-editor.js';
import { ThemePreviewBuilder } from './theme-preview-builder.js';

export class ThemeCustomizerUI {
  constructor(themeEngine, customTheme, currentPreset, presets) {
    this.theme = themeEngine;
    this.customTheme = customTheme;
    this.currentPreset = currentPreset;
    this.presets = presets;

    this.presetSelector = new ThemePresetSelector(themeEngine, presets, currentPreset);
    this.colorEditor = new ThemeColorEditor(themeEngine, customTheme);
    this.previewBuilder = new ThemePreviewBuilder(themeEngine);
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
            this.presetSelector.buildPresetSelector(onPresetSelect),
            this.colorEditor.buildColorEditor(),
            this.previewBuilder.buildPreview()
          ]
        }
      ]
    };
  }
}
