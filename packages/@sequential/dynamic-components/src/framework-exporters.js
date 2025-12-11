// Framework-specific exporters
import { StringConverters } from './string-converters.js';
import { ExporterTemplates } from './exporter-templates.js';

export class FrameworkExporters {
  constructor() {
    this.templates = new ExporterTemplates();
  }

  exportToReact(componentDef, options = {}) {
    const componentName = options.componentName || 'Component';
    const useTypeScript = options.typescript || false;
    const useHooks = options.hooks !== false;

    const imports = ['import React'];
    if (useHooks && options.useState !== false) imports.push(', { useState }');
    imports.push(' from \'react\';\n');

    const componentCode = this.templates.generateReactComponent(componentDef, componentName, useHooks);

    let code = imports.join('');
    code += `\nexport default function ${componentName}() {\n`;
    code += StringConverters.indent(componentCode, 2);
    code += '\n}\n';

    if (useTypeScript) {
      code = `import React, { FC } from 'react';\n\n` +
        `const ${componentName}: FC = () => {\n` +
        StringConverters.indent(componentCode, 2) +
        '\n};\n\nexport default ' + componentName + ';\n';
    }

    return {
      code,
      filename: `${StringConverters.kebabCase(componentName)}.${useTypeScript ? 'tsx' : 'jsx'}`,
      framework: 'react',
      dependencies: []
    };
  }

  exportToVue3(componentDef, options = {}) {
    const componentName = options.componentName || 'Component';
    const useCompositionAPI = options.compositionAPI !== false;

    const template = this.templates.generateVueTemplate(componentDef);
    const script = useCompositionAPI
      ? this.templates.generateVueCompositionAPI()
      : this.templates.generateVueOptionsAPI();

    const code = `<template>\n${StringConverters.indent(template, 2)}\n</template>\n\n` +
      `<script ${useCompositionAPI ? 'setup' : ''}>\n${StringConverters.indent(script, 2)}\n</script>\n\n` +
      `<style scoped>\n/* Component styles */\n</style>\n`;

    return {
      code,
      filename: `${StringConverters.kebabCase(componentName)}.vue`,
      framework: 'vue3',
      dependencies: ['vue']
    };
  }

  exportToSvelte(componentDef, options = {}) {
    const componentName = options.componentName || 'Component';

    const template = this.templates.generateSvelteTemplate(componentDef);
    const script = this.templates.generateSvelteScript();

    const code = `<script>\n${StringConverters.indent(script, 2)}\n</script>\n\n` +
      template + '\n\n' +
      `<style>\n/* Component styles */\n</style>\n`;

    return {
      code,
      filename: `${StringConverters.kebabCase(componentName)}.svelte`,
      framework: 'svelte',
      dependencies: []
    };
  }

  exportToAngular(componentDef, options = {}) {
    const componentName = options.componentName || 'Component';
    const selector = StringConverters.kebabCase(componentName);
    const className = StringConverters.pascalCase(componentName);

    const template = this.templates.generateAngularTemplate(componentDef);
    const styles = this.templates.generateAngularStyles(componentDef.style || {});

    const code = `import { Component, OnInit } from '@angular/core';\nimport { CommonModule } from '@angular/common';\n\n` +
      `@Component({\n` +
      `  selector: 'app-${selector}',\n` +
      `  standalone: true,\n` +
      `  imports: [CommonModule],\n` +
      `  template: \`\n${StringConverters.indent(template, 4)}\n  \`,\n` +
      `  styles: [\`\n${StringConverters.indent(styles, 4)}\n  \`]\n` +
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
    const className = StringConverters.pascalCase(componentName);
    const tagName = StringConverters.kebabCase(componentName);

    const template = this.templates.generateWebComponentTemplate(componentDef);
    const styles = this.templates.generateWebComponentStyles(componentDef.style || {});

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
      `      <style>\n${StringConverters.indent(styles, 8)}</style>\n` +
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
    const className = StringConverters.pascalCase(componentName);

    const widgets = this.templates.generateFlutterWidgets(componentDef);

    const code = `import 'package:flutter/material.dart';\n\n` +
      `class ${className} extends StatelessWidget {\n` +
      `  const ${className}({Key? key}) : super(key: key);\n\n` +
      `  @override\n` +
      `  Widget build(BuildContext context) {\n` +
      `    return ${StringConverters.indent(widgets, 6)};\n` +
      `  }\n` +
      `}\n`;

    return {
      code,
      filename: `${StringConverters.snakeCase(componentName)}.dart`,
      framework: 'flutter',
      dependencies: ['flutter/material.dart']
    };
  }

  exportToSwiftUI(componentDef, options = {}) {
    const componentName = options.componentName || 'Component';
    const structName = StringConverters.pascalCase(componentName);

    const views = this.templates.generateSwiftUIViews(componentDef);

    const code = `import SwiftUI\n\n` +
      `struct ${structName}: View {\n` +
      `  var body: some View {\n` +
      `    ${StringConverters.indent(views, 4)}\n` +
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
}
