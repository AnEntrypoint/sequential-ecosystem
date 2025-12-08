class PatternCodeGenerator {
  constructor() {
    this.patterns = new Map();
    this.templates = new Map();
    this.generatedCode = new Map();
    this.initializeTemplates();
  }

  initializeTemplates() {
    this.addTemplate('react-jsx', {
      fileExtension: '.jsx',
      language: 'jsx',
      boilerplate: `import React, { useState } from 'react';\n\nexport default function {componentName}() {`
    });

    this.addTemplate('react-ts', {
      fileExtension: '.tsx',
      language: 'typescript',
      boilerplate: `import React, { useState } from 'react';\nimport type { FC } from 'react';\n\nconst {componentName}: FC = () => {`
    });

    this.addTemplate('vue3', {
      fileExtension: '.vue',
      language: 'html',
      boilerplate: `<template>\n  <div>`
    });

    this.addTemplate('svelte', {
      fileExtension: '.svelte',
      language: 'html',
      boilerplate: `<script>\n  let count = 0;\n</script>\n\n<div>`
    });

    this.addTemplate('web-component', {
      fileExtension: '.js',
      language: 'javascript',
      boilerplate: `export class {ClassName} extends HTMLElement {\n  constructor() {\n    super();\n    this.attachShadow({ mode: 'open' });\n  }`
    });

    this.addTemplate('angular', {
      fileExtension: '.component.ts',
      language: 'typescript',
      boilerplate: `import { Component } from '@angular/core';\n\n@Component({\n  selector: 'app-{selector}',\n  templateUrl: './{selector}.component.html',\n  styleUrls: ['./{selector}.component.css']\n})\nexport class {ClassName}Component {`
    });
  }

  addTemplate(name, config) {
    this.templates.set(name, config);
    return config;
  }

  registerPattern(name, componentDef) {
    this.patterns.set(name, {
      name,
      definition: JSON.parse(JSON.stringify(componentDef)),
      createdAt: Date.now()
    });
  }

  generateReact(componentDef, componentName = 'MyComponent') {
    const styles = this.generateInlineStyles(componentDef.style || {});
    const children = this.generateReactChildren(componentDef.children);

    const jsx = `<${componentDef.type}${styles}>\n${children}\n</${componentDef.type}>`;

    return `import React from 'react';\n\nexport default function ${componentName}() {\n  return (\n    ${this.indent(jsx, 4)}\n  );\n}\n`;
  }

  generateReactTS(componentDef, componentName = 'MyComponent') {
    const styles = this.generateInlineStyles(componentDef.style || {});
    const children = this.generateReactChildren(componentDef.children);

    const jsx = `<${componentDef.type}${styles}>\n${children}\n</${componentDef.type}>`;

    return `import React, { FC } from 'react';\n\nconst ${componentName}: FC = () => {\n  return (\n    ${this.indent(jsx, 4)}\n  );\n};\n\nexport default ${componentName};\n`;
  }

  generateVue3(componentDef) {
    const styles = this.generateVueStyles(componentDef.style || {});
    const children = this.generateVueChildren(componentDef.children);

    return `<template>\n  <${componentDef.type}${styles}>\n${this.indent(children, 4)}\n  </${componentDef.type}>\n</template>\n\n<script setup>\nimport { ref } from 'vue';\n\nconst state = ref({});\n</script>\n\n<style scoped>\n/* Add component styles here */\n</style>\n`;
  }

  generateSvelte(componentDef) {
    const styles = this.generateSvelteStyles(componentDef.style || {});
    const children = this.generateSvelteChildren(componentDef.children);

    return `<script>\n  let state = {};\n</script>\n\n<${componentDef.type}${styles}>\n${this.indent(children, 2)}\n</${componentDef.type}>\n\n<style>\n  /* Add component styles here */\n</style>\n`;
  }

  generateWebComponent(componentDef, className = 'MyComponent') {
    const styles = this.generateCSSStyles(componentDef.style || {});
    const template = this.generateWebComponentTemplate(componentDef);

    return `export class ${className} extends HTMLElement {\n  constructor() {\n    super();\n    this.attachShadow({ mode: 'open' });\n  }\n\n  connectedCallback() {\n    this.render();\n  }\n\n  render() {\n    this.shadowRoot.innerHTML = \`\n      <style>\n${this.indent(styles, 8)}\n      </style>\n${this.indent(template, 6)}\n    \`;\n  }\n}\n\ncustomElements.define('app-${this.kebabCase(className)}', ${className});\n`;
  }

  generateAngular(componentDef, componentName = 'MyComponent') {
    const className = this.pascalCase(componentName);
    const selector = this.kebabCase(componentName);
    const styles = this.generateCSSStyles(componentDef.style || {});
    const template = this.generateAngularTemplate(componentDef);

    const tsCode = `import { Component } from '@angular/core';\n\n@Component({\n  selector: 'app-${selector}',\n  template: \`\n${this.indent(template, 4)}\n  \`,\n  styles: [\`\n${this.indent(styles, 4)}\n  \`]\n})\nexport class ${className}Component {\n}\n`;

    return tsCode;
  }

  generateReactChildren(children, indent = 0) {
    if (!children) return '';

    if (typeof children === 'string') {
      return this.indent(children, 4);
    }

    if (Array.isArray(children)) {
      return children.map(child => this.generateReactChildren(child)).join('\n');
    }

    if (typeof children === 'object') {
      const type = children.type || 'div';
      const styles = this.generateInlineStyles(children.style || {});
      const childContent = children.content || this.generateReactChildren(children.children);

      return this.indent(`<${type}${styles}>${childContent}</${type}>`, indent);
    }

    return '';
  }

  generateVueChildren(children) {
    if (!children) return '';

    if (typeof children === 'string') {
      return children;
    }

    if (Array.isArray(children)) {
      return children.map(child => this.generateVueChildren(child)).join('\n');
    }

    if (typeof children === 'object') {
      const type = children.type || 'div';
      const styles = this.generateVueStyles(children.style || {});
      const childContent = children.content || this.generateVueChildren(children.children);

      return `<${type}${styles}>${childContent}</${type}>`;
    }

    return '';
  }

  generateSvelteChildren(children) {
    if (!children) return '';

    if (typeof children === 'string') {
      return children;
    }

    if (Array.isArray(children)) {
      return children.map(child => this.generateSvelteChildren(child)).join('\n');
    }

    if (typeof children === 'object') {
      const type = children.type || 'div';
      const styles = this.generateSvelteStyles(children.style || {});
      const childContent = children.content || this.generateSvelteChildren(children.children);

      return `<${type}${styles}>${childContent}</${type}>`;
    }

    return '';
  }

  generateWebComponentTemplate(componentDef) {
    const type = componentDef.type || 'div';
    const childContent = this.generateWebComponentTemplate(componentDef.children);

    return `<${type}>${childContent}</${type}>`;
  }

  generateAngularTemplate(componentDef) {
    const type = componentDef.type || 'div';
    const styles = this.generateAngularStyleBinding(componentDef.style || {});
    const childContent = this.generateAngularTemplate(componentDef.children);

    return `<${type}${styles}>${childContent}</${type}>`;
  }

  generateInlineStyles(styleObj) {
    const styles = Object.entries(styleObj)
      .filter(([key]) => !key.startsWith('_'))
      .map(([key, value]) => {
        const cssKey = this.toCSSProperty(key);
        return `${cssKey}: ${this.formatStyleValue(value)}`;
      })
      .join('; ');

    return styles ? ` style={{ ${this.styleObjToString(styleObj)} }}` : '';
  }

  generateVueStyles(styleObj) {
    const styles = Object.entries(styleObj)
      .filter(([key]) => !key.startsWith('_'))
      .map(([key, value]) => {
        const cssKey = this.toCSSProperty(key);
        return `${cssKey}: ${this.formatStyleValue(value)}`;
      })
      .join('; ');

    return styles ? ` :style="{ ${this.styleObjToString(styleObj)} }"` : '';
  }

  generateSvelteStyles(styleObj) {
    const styles = Object.entries(styleObj)
      .filter(([key]) => !key.startsWith('_'))
      .map(([key, value]) => {
        const cssKey = this.toCSSProperty(key);
        return `${cssKey}: ${this.formatStyleValue(value)}`;
      })
      .join('; ');

    return styles ? ` style="${styles}"` : '';
  }

  generateCSSStyles(styleObj) {
    return Object.entries(styleObj)
      .filter(([key]) => !key.startsWith('_'))
      .map(([key, value]) => {
        const cssKey = this.toCSSProperty(key);
        return `${cssKey}: ${this.formatStyleValue(value)};`;
      })
      .join('\n');
  }

  generateAngularStyleBinding(styleObj) {
    const styles = Object.entries(styleObj)
      .filter(([key]) => !key.startsWith('_'))
      .map(([key, value]) => {
        const cssKey = this.toCSSProperty(key);
        return `${cssKey}: ${this.formatStyleValue(value)}`;
      })
      .join('; ');

    return styles ? ` [style]="'${styles}'"` : '';
  }

  styleObjToString(styleObj) {
    return Object.entries(styleObj)
      .filter(([key]) => !key.startsWith('_'))
      .map(([key, value]) => {
        const jsKey = this.toCamelCase(key);
        const formattedValue = typeof value === 'string' ? `'${value}'` : value;
        return `${jsKey}: ${formattedValue}`;
      })
      .join(', ');
  }

  toCSSProperty(jsName) {
    return jsName.replace(/([A-Z])/g, '-$1').toLowerCase();
  }

  toCamelCase(str) {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }

  kebabCase(str) {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
  }

  pascalCase(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  formatStyleValue(value) {
    if (typeof value === 'number') {
      return value > 100 ? `${value}px` : value;
    }
    return value;
  }

  indent(text, spaces = 2) {
    const indentation = ' '.repeat(spaces);
    return text.split('\n').map(line => indentation + line).join('\n');
  }

  generate(componentDef, format, componentName = 'MyComponent') {
    const key = `${format}_${componentName}_${Date.now()}`;

    let code;
    switch (format) {
      case 'react-jsx':
        code = this.generateReact(componentDef, componentName);
        break;
      case 'react-ts':
        code = this.generateReactTS(componentDef, componentName);
        break;
      case 'vue3':
        code = this.generateVue3(componentDef);
        break;
      case 'svelte':
        code = this.generateSvelte(componentDef);
        break;
      case 'web-component':
        code = this.generateWebComponent(componentDef, componentName);
        break;
      case 'angular':
        code = this.generateAngular(componentDef, componentName);
        break;
      default:
        code = this.generateReact(componentDef, componentName);
    }

    this.generatedCode.set(key, {
      code,
      format,
      componentName,
      generatedAt: Date.now(),
      componentDef
    });

    return code;
  }

  buildCodegenUI(supportedFormats = ['react-jsx', 'react-ts', 'vue3', 'svelte', 'web-component', 'angular']) {
    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '12px',
        background: '#1e1e1e',
        borderRadius: '6px'
      },
      children: [
        {
          type: 'heading',
          content: '⚙️ Code Generator',
          level: 3,
          style: { margin: 0, fontSize: '12px', color: '#e0e0e0' }
        },
        {
          type: 'box',
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px'
          },
          children: supportedFormats.map(format => ({
            type: 'box',
            style: {
              padding: '8px 12px',
              background: '#2d2d30',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '10px',
              color: '#d4d4d4',
              border: '1px solid #3e3e42',
              textAlign: 'center'
            },
            children: [{
              type: 'paragraph',
              content: format.replace('-', ' ').toUpperCase(),
              style: { margin: 0 }
            }]
          }))
        }
      ]
    };
  }

  exportGeneratedCode() {
    return {
      generatedAt: new Date().toISOString(),
      totalGenerated: this.generatedCode.size,
      code: Array.from(this.generatedCode.entries()).map(([key, value]) => ({
        key,
        format: value.format,
        componentName: value.componentName,
        code: value.code
      }))
    };
  }
}

function createPatternCodeGenerator() {
  return new PatternCodeGenerator();
}

export { PatternCodeGenerator, createPatternCodeGenerator };
