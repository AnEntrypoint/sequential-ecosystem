// Facade maintaining 100% backward compatibility with focused modules
import { CodeGenFormatters } from './code-gen-formatters.js';
import { TemplateCodeGenerator as TemplateCodeGeneratorImpl } from './template-code-generator.js';

export class ComponentCodeGenerator {
  constructor() {
    this.templates = new Map();
    this.initializeTemplates();
  }

  initializeTemplates() {
    this.templates.set('jsx', this.generate.bind(this, undefined, 'jsx'));
    this.templates.set('json', this.generate.bind(this, undefined, 'json'));
    this.templates.set('typescript', this.generate.bind(this, undefined, 'typescript'));
    this.templates.set('vue', this.generate.bind(this, undefined, 'vue'));
  }

  generate(component, format = 'jsx', options = {}) {
    const generators = {
      jsx: () => CodeGenFormatters.generateJSX(component, options),
      json: () => CodeGenFormatters.generateJSON(component, options),
      typescript: () => CodeGenFormatters.generateTypeScript(component, options),
      vue: () => CodeGenFormatters.generateVue(component, options)
    };

    if (!generators[format]) {
      throw new Error(`Unknown format: ${format}`);
    }
    return generators[format]();
  }

  generateJSX(component, options = {}) {
    return CodeGenFormatters.generateJSX(component, options);
  }

  generateJSON(component, options = {}) {
    return CodeGenFormatters.generateJSON(component, options);
  }

  generateTypeScript(component, options = {}) {
    return CodeGenFormatters.generateTypeScript(component, options);
  }

  generateVue(component, options = {}) {
    return CodeGenFormatters.generateVue(component, options);
  }

  inferTypeScript(value) {
    return CodeGenFormatters.inferTypeScript(value);
  }

  pascalCase(str) {
    return CodeGenFormatters.pascalCase(str);
  }
}

export class TemplateCodeGenerator extends TemplateCodeGeneratorImpl {
  constructor(advancedBuilder) {
    super(advancedBuilder);
  }
}

export const createComponentCodeGenerator = () => new ComponentCodeGenerator();
export const createTemplateCodeGenerator = (advancedBuilder) =>
  new TemplateCodeGenerator(advancedBuilder);
