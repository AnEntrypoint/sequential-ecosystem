// Editor facade - maintains 100% backward compatibility
import { EditorValidators } from './editor-validators.js';
import { EditorFieldBuilder } from './editor-field-builder.js';
import { EditorCodeGenerator } from './editor-code-generator.js';
import { EditorPropertySchema } from './editor-property-schema.js';
import { EditorUIBuilders } from './editor-ui-builders.js';

export class EnhancedPropertyEditor {
  constructor(registry, themeEngine) {
    this.registry = registry;
    this.themeEngine = themeEngine;
    this.validators = new EditorValidators();
    this.fieldBuilder = new EditorFieldBuilder(themeEngine);
    this.schema = new EditorPropertySchema();
    this.uiBuilders = new EditorUIBuilders(themeEngine);
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

  buildPropertyEditor(component, onPropertyChange) {
    const properties = this.getComponentProperties(component.type);

    return {
      type: 'flex',
      direction: 'column',
      gap: this.themeEngine.getSpacing('md'),
      style: { padding: this.themeEngine.getSpacing('lg') },
      children: [
        {
          type: 'heading',
          content: `Edit ${component.type}`,
          level: 4,
          style: { marginBottom: this.themeEngine.getSpacing('md') }
        },
        ...Object.entries(properties).map(([propName, propConfig]) => {
          const currentValue = component.props?.[propName] ?? propConfig.default ?? '';
          const validation = this.validateProperty(propName, currentValue, propConfig);
          return this.fieldBuilder.buildPropertyField(
            component,
            propName,
            propConfig,
            currentValue,
            validation,
            onPropertyChange,
            (event, data) => this.emit(event, data)
          );
        }),
        this.buildValidationSummary(component)
      ]
    };
  }

  buildPropertyField(component, propName, propConfig, onPropertyChange) {
    const currentValue = component.props?.[propName] ?? propConfig.default ?? '';
    const validation = this.validateProperty(propName, currentValue, propConfig);
    return this.fieldBuilder.buildPropertyField(
      component,
      propName,
      propConfig,
      currentValue,
      validation,
      onPropertyChange,
      (event, data) => this.emit(event, data)
    );
  }

  validateProperty(propName, value, propConfig) {
    return this.validators.validateProperty(propName, value, propConfig);
  }

  buildValidationSummary(component) {
    const properties = this.getComponentProperties(component.type);
    return this.uiBuilders.buildValidationSummary(
      component,
      properties,
      (propName, value, propConfig) => this.validateProperty(propName, value, propConfig)
    );
  }

  getComponentProperties(componentType) {
    return this.schema.getComponentProperties(componentType);
  }
}

export class LiveCodePreview {
  constructor(registry, themeEngine) {
    this.registry = registry;
    this.themeEngine = themeEngine;
    this.codeGen = new EditorCodeGenerator();
    this.uiBuilders = new EditorUIBuilders(themeEngine);
  }

  buildCodePreview(component) {
    const code = this.generateComponentCode(component);

    return {
      type: 'flex',
      direction: 'column',
      gap: this.themeEngine.getSpacing('md'),
      style: { padding: this.themeEngine.getSpacing('lg') },
      children: [
        this.uiBuilders.buildCodePreviewUI(
          code,
          () => this.exportJSON(component),
          () => this.copyToClipboard(code)
        )
      ]
    };
  }

  generateComponentCode(component, indent = 0) {
    return this.codeGen.generateComponentCode(component, indent);
  }

  copyToClipboard(text) {
    return this.codeGen.copyToClipboard(text);
  }

  exportJSON(component) {
    return this.codeGen.exportJSON(component);
  }
}

export const createEnhancedPropertyEditor = (registry, themeEngine) =>
  new EnhancedPropertyEditor(registry, themeEngine);

export const createLiveCodePreview = (registry, themeEngine) =>
  new LiveCodePreview(registry, themeEngine);
