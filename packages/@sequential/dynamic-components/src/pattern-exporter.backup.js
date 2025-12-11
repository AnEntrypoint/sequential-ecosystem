class PatternExporter {
  constructor() {
    this.exportConfigs = new Map();
    this.exportHistory = [];
    this.frameworks = [
      'react',
      'vue3',
      'svelte',
      'angular',
      'web-components',
      'flutter',
      'swift-ui'
    ];
    this.initializeFrameworks();
  }

  initializeFrameworks() {
    this.registerFramework('react', {
      name: 'React',
      version: '18+',
      extension: 'jsx',
      defaultTemplate: 'functional',
      features: ['hooks', 'props', 'state-management'],
      dependencies: []
    });

    this.registerFramework('vue3', {
      name: 'Vue 3',
      version: '3+',
      extension: 'vue',
      defaultTemplate: 'composition-api',
      features: ['composition-api', 'template-syntax', 'reactivity'],
      dependencies: ['vue']
    });

    this.registerFramework('svelte', {
      name: 'Svelte',
      version: '4+',
      extension: 'svelte',
      defaultTemplate: 'reactive',
      features: ['reactivity', 'animations', 'stores'],
      dependencies: []
    });

    this.registerFramework('angular', {
      name: 'Angular',
      version: '16+',
      extension: 'component.ts',
      defaultTemplate: 'standalone',
      features: ['directives', 'pipes', 'services'],
      dependencies: ['@angular/core', '@angular/common']
    });

    this.registerFramework('web-components', {
      name: 'Web Components',
      version: 'ES2020+',
      extension: 'js',
      defaultTemplate: 'custom-element',
      features: ['shadow-dom', 'slots', 'custom-elements'],
      dependencies: []
    });

    this.registerFramework('flutter', {
      name: 'Flutter',
      version: '3.0+',
      extension: 'dart',
      defaultTemplate: 'stateless-widget',
      features: ['widgets', 'material-design', 'responsive'],
      dependencies: ['flutter/material.dart']
    });

    this.registerFramework('swift-ui', {
      name: 'SwiftUI',
      version: '14+',
      extension: 'swift',
      defaultTemplate: 'view-protocol',
      features: ['property-wrappers', 'modifiers', 'layout'],
      dependencies: ['SwiftUI']
    });
  }

  registerFramework(name, config) {
    this.exportConfigs.set(name, config);
  }

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

  export(componentDef, framework, options = {}) {
    let result;

    switch (framework) {
      case 'react':
        result = this.exportToReact(componentDef, options);
        break;
      case 'vue3':
        result = this.exportToVue3(componentDef, options);
        break;
      case 'svelte':
        result = this.exportToSvelte(componentDef, options);
        break;
      case 'angular':
        result = this.exportToAngular(componentDef, options);
        break;
      case 'web-components':
        result = this.exportToWebComponents(componentDef, options);
        break;
      case 'flutter':
        result = this.exportToFlutter(componentDef, options);
        break;
      case 'swift-ui':
        result = this.exportToSwiftUI(componentDef, options);
        break;
      default:
        result = this.exportToReact(componentDef, options);
    }

    this.exportHistory.push({
      framework,
      timestamp: Date.now(),
      componentName: options.componentName || 'Component'
    });

    return result;
  }

  exportMultiple(componentDef, frameworks = ['react', 'vue3'], options = {}) {
    const exports = {};

    frameworks.forEach(framework => {
      if (this.exportConfigs.has(framework)) {
        exports[framework] = this.export(componentDef, framework, options);
      }
    });

    return {
      componentDef,
      exports,
      exportedAt: new Date().toISOString(),
      availableFrameworks: this.frameworks
    };
  }

  buildExporterUI() {
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
          content: '📦 Pattern Exporter',
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
          children: this.frameworks.map(framework => ({
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
              content: this.exportConfigs.get(framework)?.name || framework,
              style: { margin: 0 }
            }]
          }))
        }
      ]
    };
  }

  getFrameworkInfo(framework) {
    return this.exportConfigs.get(framework);
  }

  getAllFrameworks() {
    return Array.from(this.exportConfigs.entries()).map(([name, config]) => ({
      name,
      ...config
    }));
  }

  exportSummary() {
    return {
      totalExports: this.exportHistory.length,
      frameworks: this.getAllFrameworks(),
      recentExports: this.exportHistory.slice(-10),
      exportedAt: new Date().toISOString()
    };
  }
}

function createPatternExporter() {
  return new PatternExporter();
}

export { PatternExporter, createPatternExporter };
