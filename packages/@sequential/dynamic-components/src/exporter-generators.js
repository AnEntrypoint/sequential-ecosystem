// Code generators for different frameworks
export class ExporterGenerators {
  exportToReact(componentDef, options = {}) {
    const componentName = options.componentName || 'Component';
    const useTypeScript = options.typescript || false;
    const useHooks = options.hooks !== false;

    const imports = ['import React'];
    if (useHooks && options.useState !== false) imports.push(', { useState }');
    imports.push(' from \'react\';\n');

    const componentCode = this.generateReactComponent(componentDef, componentName, useHooks);

    let code = imports.join('');
    code += `\nexport default function ${componentName}() {\n`;
    code += this.indent(componentCode, 2);
    code += '\n}\n';

    if (useTypeScript) {
      code = `import React, { FC } from 'react';\n\n` +
        `const ${componentName}: FC = () => {\n` +
        this.indent(componentCode, 2) +
        '\n};\n\nexport default ' + componentName + ';\n';
    }

    return {
      code,
      filename: `${this.kebabCase(componentName)}.${useTypeScript ? 'tsx' : 'jsx'}`,
      framework: 'react',
      dependencies: []
    };
  }

  exportToVue3(componentDef, options = {}) {
    const componentName = options.componentName || 'Component';
    const useCompositionAPI = options.compositionAPI !== false;

    const template = this.generateVueTemplate(componentDef);
    const script = useCompositionAPI
      ? this.generateVueCompositionAPI(componentName)
      : this.generateVueOptionsAPI(componentName);

    const code = `<template>\n${this.indent(template, 2)}\n</template>\n\n` +
      `<script ${useCompositionAPI ? 'setup' : ''}>\n${this.indent(script, 2)}\n</script>\n\n` +
      `<style scoped>\n/* Component styles */\n</style>\n`;

    return {
      code,
      filename: `${this.kebabCase(componentName)}.vue`,
      framework: 'vue3',
      dependencies: ['vue']
    };
  }

  exportToSvelte(componentDef, options = {}) {
    const componentName = options.componentName || 'Component';

    const template = this.generateSvelteTemplate(componentDef);
    const script = this.generateSvelteScript();

    const code = `<script>\n${this.indent(script, 2)}\n</script>\n\n` +
      template + '\n\n' +
      `<style>\n/* Component styles */\n</style>\n`;

    return {
      code,
      filename: `${this.kebabCase(componentName)}.svelte`,
      framework: 'svelte',
      dependencies: []
    };
  }

  exportToAngular(componentDef, options = {}) {
    const componentName = options.componentName || 'Component';
    const selector = this.kebabCase(componentName);
    const className = this.pascalCase(componentName);

    const template = this.generateAngularTemplate(componentDef);
    const styles = this.generateAngularStyles(componentDef.style || {});

    const code = `import { Component, OnInit } from '@angular/core';\nimport { CommonModule } from '@angular/common';\n\n` +
      `@Component({\n` +
      `  selector: 'app-${selector}',\n` +
      `  standalone: true,\n` +
      `  imports: [CommonModule],\n` +
      `  template: \`\n${this.indent(template, 4)}\n  \`,\n` +
      `  styles: [\`\n${this.indent(styles, 4)}\n  \`]\n` +
      `})\n` +
      `export class ${className}Component implements OnInit {\n` +
      `  ngOnInit() {}\n` +
      `}\n`;

    return {
      code,
      filename: `${selector}.component.ts`,
      framework: 'angular',
      dependencies: ['@angular/core', '@angular/common']
    };
  }

  exportToWebComponents(componentDef, options = {}) {
    const componentName = options.componentName || 'Component';
    const className = this.pascalCase(componentName);
    const tagName = this.kebabCase(componentName);

    const template = this.generateWebComponentTemplate(componentDef);
    const styles = this.generateWebComponentStyles(componentDef.style || {});

    const code = `export class ${className} extends HTMLElement {\n` +
      `  constructor() {\n` +
      `    super();\n` +
      `    this.attachShadow({ mode: 'open' });\n` +
      `  }\n\n` +
      `  connectedCallback() {\n` +
      `    this.render();\n` +
      `  }\n\n` +
      `  render() {\n` +
      `    this.shadowRoot.innerHTML = \`\n` +
      `      <style>\n${this.indent(styles, 8)}</style>\n` +
      `      ${template}\n` +
      `    \`;\n` +
      `  }\n` +
      `}\n\n` +
      `customElements.define('${tagName}', ${className});\n`;

    return {
      code,
      filename: `${tagName}.component.js`,
      framework: 'web-components',
      dependencies: []
    };
  }

  exportToFlutter(componentDef, options = {}) {
    const componentName = options.componentName || 'Component';
    const className = this.pascalCase(componentName);

    const widgets = this.generateFlutterWidgets(componentDef);

    const code = `import 'package:flutter/material.dart';\n\n` +
      `class ${className} extends StatelessWidget {\n` +
      `  const ${className}({Key? key}) : super(key: key);\n\n` +
      `  @override\n` +
      `  Widget build(BuildContext context) {\n` +
      `    return ${this.indent(widgets, 6)};\n` +
      `  }\n` +
      `}\n`;

    return {
      code,
      filename: `${this.snakeCase(componentName)}.dart`,
      framework: 'flutter',
      dependencies: ['flutter/material.dart']
    };
  }

  exportToSwiftUI(componentDef, options = {}) {
    const componentName = options.componentName || 'Component';
    const structName = this.pascalCase(componentName);

    const views = this.generateSwiftUIViews(componentDef);

    const code = `import SwiftUI\n\n` +
      `struct ${structName}: View {\n` +
      `  var body: some View {\n` +
      `    ${this.indent(views, 4)}\n` +
      `  }\n` +
      `}\n\n` +
      `#Preview {\n` +
      `  ${structName}()\n` +
      `}\n`;

    return {
      code,
      filename: `${structName}.swift`,
      framework: 'swift-ui',
      dependencies: ['SwiftUI']
    };
  }

  generateReactComponent(componentDef, componentName, useHooks) {
    return `const [state, setState] = useState({});\n\n` +
      `return (\n` +
      this.indent(`<${componentDef.type || 'div'}>\n` +
        `{/* ${componentName} content */}\n` +
        `</${componentDef.type || 'div'}>`, 4) +
      '\n);\n';
  }

  generateVueTemplate(componentDef) {
    const type = componentDef.type || 'div';
    return `<${type}>\n<!-- Vue template content -->\n</${type}>`;
  }

  generateVueCompositionAPI() {
    return `import { ref } from 'vue';\n\nconst count = ref(0);\n\nconst increment = () => {\n  count.value++;\n};\n`;
  }

  generateVueOptionsAPI() {
    return `export default {\n  data() {\n    return { count: 0 };\n  },\n  methods: {\n    increment() {\n      this.count++;\n    }\n  }\n};\n`;
  }

  generateSvelteTemplate(componentDef) {
    const type = componentDef.type || 'div';
    return `<${type}>\n  <!-- Svelte template content -->\n</${type}>`;
  }

  generateSvelteScript() {
    return `let count = 0;\n\nconst increment = () => {\n  count++;\n};\n`;
  }

  generateAngularTemplate(componentDef) {
    const type = componentDef.type || 'div';
    return `<${type}>\n  <!-- Angular template content -->\n</${type}>`;
  }

  generateAngularStyles(styleObj) {
    return Object.entries(styleObj)
      .map(([key, value]) => `${this.toCSSProperty(key)}: ${value};`)
      .join('\n');
  }

  generateWebComponentTemplate(componentDef) {
    const type = componentDef.type || 'div';
    return `<${type}><!-- Web Component content --></${type}>`;
  }

  generateWebComponentStyles(styleObj) {
    return Object.entries(styleObj)
      .map(([key, value]) => `${this.toCSSProperty(key)}: ${value};`)
      .join('\n');
  }

  generateFlutterWidgets(componentDef) {
    return 'Container(\n  child: Text(\'Flutter Widget\'),\n)';
  }

  generateSwiftUIViews(componentDef) {
    return 'VStack {\n    Text("SwiftUI View")\n  }';
  }

  toCSSProperty(jsName) {
    return jsName.replace(/([A-Z])/g, '-$1').toLowerCase();
  }

  kebabCase(str) {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
  }

  pascalCase(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  snakeCase(str) {
    return str.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
  }

  indent(text, spaces = 2) {
    const indentation = ' '.repeat(spaces);
    return text.split('\n').map(line => indentation + line).join('\n');
  }
}
