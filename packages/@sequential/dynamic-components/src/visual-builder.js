// Visual builder facade - maintains 100% backward compatibility
import { VisualSelectors } from './visual-selectors.js';
import { VisualPalette } from './visual-palette.js';
import { VisualInspector } from './visual-inspector.js';

export class VisualBuilderUI {
  constructor(registry, themeEngine, advancedBuilder) {
    this.selectors = new VisualSelectors(advancedBuilder, themeEngine);
    this.palette = new VisualPalette(themeEngine);
    this.inspector = new VisualInspector(themeEngine);
    this.registry = registry;
    this.themeEngine = themeEngine;
    this.builder = advancedBuilder;
    this.listeners = new Map();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return this;
  }

  emit(event, data) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(cb => cb(data));
  }

  buildTemplateSelector() {
    return this.selectors.buildTemplateSelector();
  }

  buildPresetSelector() {
    return this.selectors.buildPresetSelector();
  }

  selectTemplate(name) {
    return this.selectors.selectTemplate(name);
  }

  selectPreset(name) {
    return this.selectors.selectPreset(name);
  }

  buildComponentPalette() {
    return this.palette.buildComponentPalette();
  }

  addComponentToCanvas(componentType) {
    return this.palette.addComponentToCanvas(componentType);
  }

  buildPropertyInspector(component) {
    return this.inspector.buildPropertyInspector(component);
  }

  buildPropertyFields(component) {
    return this.inspector.buildPropertyFields(component);
  }

  buildLivePreview(component) {
    return this.inspector.buildLivePreview(component);
  }

  buildCompleteBuilder() {
    return {
      type: 'flex',
      direction: 'row',
      style: { height: '100vh', width: '100%' },
      children: [
        {
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
            this.buildComponentPalette()
          ]
        },
        {
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
                    this.buildTemplateSelector(),
                    this.buildPresetSelector()
                  ]
                }
              ]
            }
          ]
        },
        {
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
        }
      ]
    };
  }
}

export const createVisualBuilder = (registry, themeEngine, advancedBuilder) =>
  new VisualBuilderUI(registry, themeEngine, advancedBuilder);
