/**
 * visual-builder-layout.js - Layout building for visual builder UI
 *
 * Constructs the three-panel layout (palette, canvas, properties)
 */

export class VisualBuilderLayout {
  constructor(themeEngine) {
    this.themeEngine = themeEngine;
  }

  buildPalettePanel(buildComponentPalette) {
    return {
      type: 'flex',
      direction: 'column',
      style: {
        width: '250px',
        borderRight: `1px solid ${this.themeEngine.getColor('border')}`,
        overflow: 'auto'
      },
      children: [
        {
          type: 'paragraph',
          content: 'Component Palette',
          style: {
            padding: this.themeEngine.getSpacing('md'),
            fontWeight: '600',
            borderBottom: `1px solid ${this.themeEngine.getColor('border')}`
          }
        },
        buildComponentPalette()
      ]
    };
  }

  buildCanvasPanel(selectors) {
    return {
      type: 'flex',
      direction: 'column',
      style: { flex: 1 },
      children: [
        {
          type: 'paragraph',
          content: 'Visual Builder',
          style: {
            padding: this.themeEngine.getSpacing('md'),
            fontWeight: '600',
            borderBottom: `1px solid ${this.themeEngine.getColor('border')}`
          }
        },
        {
          type: 'flex',
          direction: 'row',
          style: { flex: 1 },
          children: [
            {
              type: 'flex',
              direction: 'column',
              style: {
                flex: 1,
                padding: this.themeEngine.getSpacing('lg'),
                overflow: 'auto'
              },
              children: [
                selectors.buildTemplateSelector(),
                selectors.buildPresetSelector()
              ]
            }
          ]
        }
      ]
    };
  }

  buildPropertiesPanel() {
    return {
      type: 'flex',
      direction: 'column',
      style: {
        width: '300px',
        borderLeft: `1px solid ${this.themeEngine.getColor('border')}`,
        overflow: 'auto'
      },
      children: [
        {
          type: 'paragraph',
          content: 'Properties',
          style: {
            padding: this.themeEngine.getSpacing('md'),
            fontWeight: '600',
            borderBottom: `1px solid ${this.themeEngine.getColor('border')}`
          }
        }
      ]
    };
  }

  buildCompleteLayout(selectors, palette) {
    return {
      type: 'flex',
      direction: 'row',
      style: { height: '100vh', width: '100%' },
      children: [
        this.buildPalettePanel(() => palette.buildComponentPalette()),
        this.buildCanvasPanel(selectors),
        this.buildPropertiesPanel()
      ]
    };
  }
}
