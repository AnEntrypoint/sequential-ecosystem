export class ComponentCodeGenerator {
  constructor() {
    this.templates = new Map();
    this.initializeTemplates();
  }

  initializeTemplates() {
    this.templates.set('jsx', this.generateJSX.bind(this));
    this.templates.set('json', this.generateJSON.bind(this));
    this.templates.set('typescript', this.generateTypeScript.bind(this));
    this.templates.set('vue', this.generateVue.bind(this));
  }

  generate(component, format = 'jsx', options = {}) {
    const generator = this.templates.get(format);
    if (!generator) {
      throw new Error(`Unknown format: ${format}`);
    }
    return generator(component, options);
  }

  generateJSX(component, options = {}) {
    const indent = options.indent || 0;
    const spaces = '  '.repeat(indent);
    const nextSpaces = '  '.repeat(indent + 1);

    let jsx = `<${component.type}`;

    if (component.props && Object.keys(component.props).length > 0) {
      Object.entries(component.props).forEach(([key, value]) => {
        if (typeof value === 'string') {
          jsx += ` ${key}="${value}"`;
        } else if (typeof value === 'boolean') {
          if (value) jsx += ` ${key}`;
        } else {
          jsx += ` ${key}={${JSON.stringify(value)}}`;
        }
      });
    }

    if (component.style && Object.keys(component.style).length > 0) {
      jsx += ` style={${JSON.stringify(component.style)}}`;
    }

    if (component.children && component.children.length > 0) {
      jsx += '>\n';
      component.children.forEach(child => {
        jsx += nextSpaces + this.generateJSX(child, { ...options, indent: indent + 1 }).trim() + '\n';
      });
      jsx += `${spaces}</${component.type}>`;
    } else if (component.content) {
      jsx += `>${component.content}</${component.type}>`;
    } else {
      jsx += ' />';
    }

    return jsx;
  }

  generateJSON(component, options = {}) {
    const pretty = options.pretty !== false;
    return JSON.stringify(component, null, pretty ? 2 : 0);
  }

  generateTypeScript(component, options = {}) {
    const indent = options.indent || 0;
    const spaces = '  '.repeat(indent);
    const nextSpaces = '  '.repeat(indent + 1);

    let ts = `interface ${this.pascalCase(component.type)}Props {\n`;

    if (component.props && Object.keys(component.props).length > 0) {
      Object.entries(component.props).forEach(([key, value]) => {
        const type = this.inferTypeScript(value);
        ts += `${nextSpaces}${key}?: ${type};\n`;
      });
    }

    if (component.children && component.children.length > 0) {
      ts += `${nextSpaces}children?: React.ReactNode;\n`;
    }

    ts += `}\n\n`;
    ts += `const ${this.pascalCase(component.type)}: React.FC<${this.pascalCase(component.type)}Props> = (props) => {\n`;
    ts += `${nextSpaces}return (\n`;
    ts += `${nextSpaces}  ${this.generateJSX(component, { ...options, indent: indent + 2 })}\n`;
    ts += `${nextSpaces});\n`;
    ts += `};\n\n`;
    ts += `export default ${this.pascalCase(component.type)};`;

    return ts;
  }

  generateVue(component, options = {}) {
    const indent = options.indent || 0;
    const spaces = '  '.repeat(indent);
    const nextSpaces = '  '.repeat(indent + 1);

    let vue = `<template>\n`;
    vue += nextSpaces + this.generateJSX(component, { ...options, indent: indent + 1 }).trim() + '\n';
    vue += `</template>\n\n`;

    vue += `<script setup>\n`;
    if (component.props && Object.keys(component.props).length > 0) {
      vue += `${nextSpaces}defineProps({\n`;
      Object.entries(component.props).forEach(([key]) => {
        vue += `${nextSpaces}  ${key}: [String, Number, Boolean, Object],\n`;
      });
      vue += `${nextSpaces}});\n`;
    }
    vue += `</script>\n\n`;

    vue += `<style scoped>\n`;
    vue += `${nextSpaces}/* Add component styles here */\n`;
    vue += `</style>`;

    return vue;
  }

  inferTypeScript(value) {
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (Array.isArray(value)) return 'any[]';
    if (typeof value === 'object') return 'Record<string, any>';
    return 'any';
  }

  pascalCase(str) {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }
}

export class TemplateCodeGenerator {
  constructor(advancedBuilder) {
    this.builder = advancedBuilder;
    this.codeGenerator = new ComponentCodeGenerator();
  }

  generateFormTemplate(fields, templateName = 'form', options = {}) {
    const component = this.builder.buildFormFromTemplate(fields, templateName, options);
    return {
      jsx: this.codeGenerator.generate(component, 'jsx'),
      json: this.codeGenerator.generate(component, 'json'),
      typescript: this.codeGenerator.generate(component, 'typescript')
    };
  }

  generateDashboardTemplate(metrics, options = {}) {
    const component = this.builder.buildDashboardFromMetrics(metrics, options);
    return {
      jsx: this.codeGenerator.generate(component, 'jsx'),
      json: this.codeGenerator.generate(component, 'json'),
      typescript: this.codeGenerator.generate(component, 'typescript')
    };
  }

  generateResponsiveGrid(items, options = {}) {
    const component = this.builder.buildResponsiveGrid(items, options);
    return {
      jsx: this.codeGenerator.generate(component, 'jsx'),
      json: this.codeGenerator.generate(component, 'json'),
      typescript: this.codeGenerator.generate(component, 'typescript')
    };
  }

  generateDataTable(columns, rows, options = {}) {
    const component = this.builder.buildDataTable(columns, rows, options);
    return {
      jsx: this.codeGenerator.generate(component, 'jsx'),
      json: this.codeGenerator.generate(component, 'json'),
      typescript: this.codeGenerator.generate(component, 'typescript')
    };
  }

  generateReactComponent(component, componentName) {
    return `import React from 'react';
import { renderJSX, AppRenderingBridge } from '@sequential/dynamic-components';

interface ${componentName}Props {
  // Add your props here
}

export const ${componentName}: React.FC<${componentName}Props> = (props) => {
  const component = ${this.codeGenerator.generate(component, 'json')};

  return (
    <div>
      {renderJSX(component, props)}
    </div>
  );
};

export default ${componentName};`;
  }

  generateAppTemplate(appName, components = []) {
    return `import { initializeAppRendering, createAdvancedBuilder, createThemeEngine } from '@sequential/dynamic-components';

class ${this.pascalCase(appName)}App {
  async init() {
    this.bridge = await initializeAppRendering('${appName}', '#app');
    this.theme = createThemeEngine();
    this.builder = createAdvancedBuilder(this.bridge.registry, this.theme);

    await this.renderUI();
  }

  async renderUI() {
    // Initialize state
    this.bridge.setState('data', {});

    // Build and render components
    ${components.map((comp, idx) => `const component${idx} = this.builder.build${this.pascalCase(comp.template || 'flex')}(this.data);`).join('\n    ')}

    const layout = {
      type: 'flex',
      direction: 'column',
      gap: '16px',
      children: [${components.map((_, idx) => `component${idx}`).join(', ')}]
    };

    this.bridge.render('flex', layout);
  }
}

const app = new ${this.pascalCase(appName)}App();
app.init().catch(err => console.error('App init failed:', err));`;
  }

  pascalCase(str) {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }
}

export const createComponentCodeGenerator = () => new ComponentCodeGenerator();
export const createTemplateCodeGenerator = (advancedBuilder) =>
  new TemplateCodeGenerator(advancedBuilder);
