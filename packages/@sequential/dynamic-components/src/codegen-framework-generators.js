// Framework-specific code generators
export class CodegenFrameworkGenerators {
  constructor(utilities) {
    this.utils = utilities;
  }

  generateReact(componentDef, componentName = 'MyComponent') {
    const styles = this.generateInlineStyles(componentDef.style || {});
    const children = this.generateReactChildren(componentDef.children);

    const jsx = `<${componentDef.type}${styles}>\n${children}\n</${componentDef.type}>`;

    return `import React from 'react';\n\nexport default function ${componentName}() {\n  return (\n    ${this.utils.indent(jsx, 4)}\n  );\n}\n`;
  }

  generateReactTS(componentDef, componentName = 'MyComponent') {
    const styles = this.generateInlineStyles(componentDef.style || {});
    const children = this.generateReactChildren(componentDef.children);

    const jsx = `<${componentDef.type}${styles}>\n${children}\n</${componentDef.type}>`;

    return `import React, { FC } from 'react';\n\nconst ${componentName}: FC = () => {\n  return (\n    ${this.utils.indent(jsx, 4)}\n  );\n};\n\nexport default ${componentName};\n`;
  }

  generateVue3(componentDef) {
    const styles = this.generateVueStyles(componentDef.style || {});
    const children = this.generateVueChildren(componentDef.children);

    return `<template>\n  <${componentDef.type}${styles}>\n${this.utils.indent(children, 4)}\n  </${componentDef.type}>\n</template>\n\n<script setup>\nimport { ref } from 'vue';\n\nconst state = ref({});\n</script>\n\n<style scoped>\n/* Add component styles here */\n</style>\n`;
  }

  generateSvelte(componentDef) {
    const styles = this.generateSvelteStyles(componentDef.style || {});
    const children = this.generateSvelteChildren(componentDef.children);

    return `<script>\n  let state = {};\n</script>\n\n<${componentDef.type}${styles}>\n${this.utils.indent(children, 2)}\n</${componentDef.type}>\n\n<style>\n  /* Add component styles here */\n</style>\n`;
  }

  generateWebComponent(componentDef, className = 'MyComponent') {
    const styles = this.generateCSSStyles(componentDef.style || {});
    const template = this.generateWebComponentTemplate(componentDef);

    return `export class ${className} extends HTMLElement {\n  constructor() {\n    super();\n    this.attachShadow({ mode: 'open' });\n  }\n\n  connectedCallback() {\n    this.render();\n  }\n\n  render() {\n    this.shadowRoot.innerHTML = \`\n      <style>\n${this.utils.indent(styles, 8)}\n      </style>\n${this.utils.indent(template, 6)}\n    \`;\n  }\n}\n\ncustomElements.define('app-${this.utils.kebabCase(className)}', ${className});\n`;
  }

  generateAngular(componentDef, componentName = 'MyComponent') {
    const className = this.utils.pascalCase(componentName);
    const selector = this.utils.kebabCase(componentName);
    const styles = this.generateCSSStyles(componentDef.style || {});
    const template = this.generateAngularTemplate(componentDef);

    const tsCode = `import { Component } from '@angular/core';\n\n@Component({\n  selector: 'app-${selector}',\n  template: \`\n${this.utils.indent(template, 4)}\n  \`,\n  styles: [\`\n${this.utils.indent(styles, 4)}\n  \`]\n})\nexport class ${className}Component {\n}\n`;

    return tsCode;
  }

  generateInlineStyles(styleObj) {
    const styles = Object.entries(styleObj)
      .filter(([key]) => !key.startsWith('_'))
      .map(([key, value]) => {
        const cssKey = this.utils.toCSSProperty(key);
        return `${cssKey}: ${this.utils.formatStyleValue(value)}`;
      })
      .join('; ');

    return styles ? ` style={{ ${this.utils.styleObjToString(styleObj)} }}` : '';
  }

  generateVueStyles(styleObj) {
    const styles = Object.entries(styleObj)
      .filter(([key]) => !key.startsWith('_'))
      .map(([key, value]) => {
        const cssKey = this.utils.toCSSProperty(key);
        return `${cssKey}: ${this.utils.formatStyleValue(value)}`;
      })
      .join('; ');

    return styles ? ` :style="{ ${this.utils.styleObjToString(styleObj)} }"` : '';
  }

  generateSvelteStyles(styleObj) {
    const styles = Object.entries(styleObj)
      .filter(([key]) => !key.startsWith('_'))
      .map(([key, value]) => {
        const cssKey = this.utils.toCSSProperty(key);
        return `${cssKey}: ${this.utils.formatStyleValue(value)}`;
      })
      .join('; ');

    return styles ? ` style="${styles}"` : '';
  }

  generateCSSStyles(styleObj) {
    return Object.entries(styleObj)
      .filter(([key]) => !key.startsWith('_'))
      .map(([key, value]) => {
        const cssKey = this.utils.toCSSProperty(key);
        return `${cssKey}: ${this.utils.formatStyleValue(value)};`;
      })
      .join('\n');
  }

  generateAngularStyleBinding(styleObj) {
    const styles = Object.entries(styleObj)
      .filter(([key]) => !key.startsWith('_'))
      .map(([key, value]) => {
        const cssKey = this.utils.toCSSProperty(key);
        return `${cssKey}: ${this.utils.formatStyleValue(value)}`;
      })
      .join('; ');

    return styles ? ` [style]="'${styles}'"` : '';
  }

  generateReactChildren(children, indent = 0) {
    if (!children) return '';
    if (typeof children === 'string') {
      return this.utils.indent(children, 4);
    }
    if (Array.isArray(children)) {
      return children.map(child => this.generateReactChildren(child)).join('\n');
    }
    if (typeof children === 'object') {
      const type = children.type || 'div';
      const styles = this.generateInlineStyles(children.style || {});
      const childContent = children.content || this.generateReactChildren(children.children);
      return this.utils.indent(`<${type}${styles}>${childContent}</${type}>`, indent);
    }
    return '';
  }

  generateVueChildren(children) {
    if (!children) return '';
    if (typeof children === 'string') return children;
    if (Array.isArray(children)) return children.map(child => this.generateVueChildren(child)).join('\n');
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
    if (typeof children === 'string') return children;
    if (Array.isArray(children)) return children.map(child => this.generateSvelteChildren(child)).join('\n');
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
}
