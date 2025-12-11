// Pattern code generator facade - maintains 100% backward compatibility
import { CodegenTemplates } from './codegen-templates.js';
import { CodegenUtilities } from './codegen-utilities.js';
import { CodegenFrameworkGenerators } from './codegen-framework-generators.js';
import { CodegenEngine } from './codegen-engine.js';
import { CodegenUIBuilder } from './codegen-ui-builder.js';
import { CodegenPersistence } from './codegen-persistence.js';

class PatternCodeGenerator {
  constructor() {
    this.templates = new CodegenTemplates();
    this.utilities = new CodegenUtilities();
    this.generators = new CodegenFrameworkGenerators(this.utilities);
    this.engine = new CodegenEngine(this.generators);
    this.uiBuilder = new CodegenUIBuilder();
    this.persistence = new CodegenPersistence(this.engine);

    // Expose for backward compatibility
    this.patterns = new Map();
    this.generatedCode = this.engine.generatedCode;
  }

  // Delegate to templates
  addTemplate(name, config) {
    return this.templates.addTemplate(name, config);
  }

  initializeTemplates() {
    this.templates.initializeTemplates();
  }

  // Delegate to generators
  generateReact(componentDef, componentName = 'MyComponent') {
    return this.generators.generateReact(componentDef, componentName);
  }

  generateReactTS(componentDef, componentName = 'MyComponent') {
    return this.generators.generateReactTS(componentDef, componentName);
  }

  generateVue3(componentDef) {
    return this.generators.generateVue3(componentDef);
  }

  generateSvelte(componentDef) {
    return this.generators.generateSvelte(componentDef);
  }

  generateWebComponent(componentDef, className = 'MyComponent') {
    return this.generators.generateWebComponent(componentDef, className);
  }

  generateAngular(componentDef, componentName = 'MyComponent') {
    return this.generators.generateAngular(componentDef, componentName);
  }

  generateReactChildren(children, indent = 0) {
    return this.generators.generateReactChildren(children, indent);
  }

  generateVueChildren(children) {
    return this.generators.generateVueChildren(children);
  }

  generateSvelteChildren(children) {
    return this.generators.generateSvelteChildren(children);
  }

  generateWebComponentTemplate(componentDef) {
    return this.generators.generateWebComponentTemplate(componentDef);
  }

  generateAngularTemplate(componentDef) {
    return this.generators.generateAngularTemplate(componentDef);
  }

  generateInlineStyles(styleObj) {
    return this.generators.generateInlineStyles(styleObj);
  }

  generateVueStyles(styleObj) {
    return this.generators.generateVueStyles(styleObj);
  }

  generateSvelteStyles(styleObj) {
    return this.generators.generateSvelteStyles(styleObj);
  }

  generateCSSStyles(styleObj) {
    return this.generators.generateCSSStyles(styleObj);
  }

  generateAngularStyleBinding(styleObj) {
    return this.generators.generateAngularStyleBinding(styleObj);
  }

  // Delegate to utilities
  toCSSProperty(jsName) {
    return this.utilities.toCSSProperty(jsName);
  }

  toCamelCase(str) {
    return this.utilities.toCamelCase(str);
  }

  kebabCase(str) {
    return this.utilities.kebabCase(str);
  }

  pascalCase(str) {
    return this.utilities.pascalCase(str);
  }

  formatStyleValue(value) {
    return this.utilities.formatStyleValue(value);
  }

  indent(text, spaces = 2) {
    return this.utilities.indent(text, spaces);
  }

  styleObjToString(styleObj) {
    return this.utilities.styleObjToString(styleObj);
  }

  // Delegate to engine
  generate(componentDef, format, componentName = 'MyComponent') {
    return this.engine.generate(componentDef, format, componentName);
  }

  registerPattern(name, componentDef) {
    this.patterns.set(name, {
      name,
      definition: JSON.parse(JSON.stringify(componentDef)),
      createdAt: Date.now()
    });
  }

  // Delegate to UI builder
  buildCodegenUI(supportedFormats = ['react-jsx', 'react-ts', 'vue3', 'svelte', 'web-component', 'angular']) {
    return this.uiBuilder.buildCodegenUI(supportedFormats);
  }

  // Delegate to persistence
  exportGeneratedCode() {
    return this.persistence.exportGeneratedCode();
  }
}

function createPatternCodeGenerator() {
  return new PatternCodeGenerator();
}

export { PatternCodeGenerator, createPatternCodeGenerator };
