import * as panels from './panels.js';

export class ComponentRegistry {
  constructor(patternBridge) {
    this.patternBridge = patternBridge;
    this.components = new Map();
    this.componentStates = new Map();
    this.initializeComponents();
  }

  initializeComponents() {
    this.registerComponent('pattern-palette', props => panels.createPatternPalette(this.patternBridge));
    this.registerComponent('inspector-panel', props => panels.createInspectorPanel(this.patternBridge, props.componentId));
    this.registerComponent('validation-panel', props => panels.createValidationPanel(this.patternBridge, props.componentId));
    this.registerComponent('accessibility-panel', props => panels.createAccessibilityPanel(this.patternBridge, props.componentId));
    this.registerComponent('code-preview', props => panels.createCodePreview(this.patternBridge, props.componentId, props.framework));
    this.registerComponent('animation-panel', props => panels.createAnimationPanel(props.componentId));
    this.registerComponent('layout-panel', props => panels.createLayoutPanel(props.componentId));
    this.registerComponent('export-panel', props => panels.createExportPanel(props.componentId));
  }

  registerComponent(name, renderer) {
    this.components.set(name, renderer);
  }

  renderComponent(name, props = {}) {
    const renderer = this.components.get(name);
    if (!renderer) {
      return {
        type: 'box',
        children: [{
          type: 'text',
          content: `Unknown component: ${name}`
        }]
      };
    }

    return renderer(props);
  }

  getAvailableComponents() {
    return Array.from(this.components.keys());
  }
}
