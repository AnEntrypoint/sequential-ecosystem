// UI panel construction functions for main layout
import * as fieldEditors from './ui-field-editors.js';
import * as componentPreviews from './ui-component-previews.js';

export function buildCustomizerUI(theme, presets) {
  return {
    type: 'box',
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px',
      padding: '20px',
      backgroundColor: '#fafafa'
    },
    children: [
      buildControlPanel(theme, presets),
      buildPreviewPanel(theme)
    ]
  };
}

export function buildControlPanel(theme, presets) {
  return {
    type: 'box',
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      padding: '16px',
      backgroundColor: '#fff',
      borderRadius: '6px',
      maxHeight: 'calc(100vh - 40px)',
      overflow: 'auto'
    },
    children: [
      {
        type: 'heading',
        content: 'Theme Customizer',
        level: 2,
        style: { margin: 0, fontSize: '18px', fontWeight: 700 }
      },
      fieldEditors.buildPresetSelector(presets),
      fieldEditors.buildColorEditor(theme),
      fieldEditors.buildSpacingEditor(theme),
      fieldEditors.buildRadiusEditor(theme),
      fieldEditors.buildExportControls()
    ]
  };
}

export function buildPreviewPanel(theme) {
  return {
    type: 'box',
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '16px',
      backgroundColor: theme.colors.surface,
      borderRadius: '6px',
      maxHeight: 'calc(100vh - 40px)',
      overflow: 'auto'
    },
    children: [
      {
        type: 'heading',
        content: 'Preview',
        level: 3,
        style: { margin: 0, fontSize: '14px', fontWeight: 600 }
      },
      componentPreviews.buildComponentPreview(theme, 'button'),
      componentPreviews.buildComponentPreview(theme, 'card'),
      componentPreviews.buildComponentPreview(theme, 'input'),
      componentPreviews.buildColorPalette(theme)
    ]
  };
}
