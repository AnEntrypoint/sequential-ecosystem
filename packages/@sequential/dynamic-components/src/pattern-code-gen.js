// Facade maintaining 100% backward compatibility
import { CodeGenTemplates } from './code-gen-templates.js';
import { CodeGenOptimizer } from './code-gen-optimizer.js';

class PatternCodeGenerator {
  constructor() {
    this.templates = new CodeGenTemplates();
    this.optimizer = new CodeGenOptimizer();
    this.listeners = [];
  }

  // Template methods (delegated to templates)
  generateReact(name, definition) {
    return this.templates.generateReact(name, definition);
  }

  generateVue(name, definition) {
    return this.templates.generateVue(name, definition);
  }

  generateSvelte(name, definition) {
    return this.templates.generateSvelte(name, definition);
  }

  generateAngular(name, definition) {
    return this.templates.generateAngular(name, definition);
  }

  generateWebComponent(name, definition) {
    return this.templates.generateWebComponent(name, definition);
  }

  // Framework selection
  generate(framework, name, definition) {
    const template = this.templates.getTemplate(framework);
    if (!template) throw new Error(`Unknown framework: ${framework}`);
    const code = template.generate(name, definition);
    this.emit('generated', { framework, name, codeLength: code.length });
    return code;
  }

  // Optimization (delegated to optimizer)
  optimize(code, options) {
    return this.optimizer.optimize(code, options);
  }

  minify(code) {
    return this.optimizer.minify(code);
  }

  format(code, options) {
    return this.optimizer.format(code, options);
  }

  validate(code, language) {
    return this.optimizer.validateCode(code, language);
  }

  estimate(code, language) {
    return this.optimizer.estimate(code, language);
  }

  // Utilities
  toPascalCase(str) {
    return this.templates.toPascalCase(str);
  }

  toKebabCase(str) {
    return this.templates.toKebabCase(str);
  }

  toCamelCase(str) {
    return this.templates.toCamelCase(str);
  }

  getAvailableFrameworks() {
    return this.templates.getAvailableFrameworks();
  }

  // Event system
  on(event, callback) {
    this.listeners.push({ event, callback });
  }

  off(event, callback) {
    this.listeners = this.listeners.filter(l => !(l.event === event && l.callback === callback));
  }

  emit(event, data) {
    for (const listener of this.listeners) {
      if (listener.event === event) {
        listener.callback(data);
      }
    }
  }
}

function createPatternCodeGenerator() {
  return new PatternCodeGenerator();
}

export { PatternCodeGenerator, createPatternCodeGenerator };
