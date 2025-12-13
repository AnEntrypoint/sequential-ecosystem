/**
 * other-exporters.js
 *
 * Svelte, Angular, and Web Components export functionality
 */

import { StringConverters } from './string-converters.js';
import { ExporterTemplates } from './exporter-templates.js';

export class SvelteExporter {
  constructor() {
    this.templates = new ExporterTemplates();
  }

  exportToSvelte(componentDef, options = {}) {
    const componentName = options.componentName || 'Component';

    const template = this.templates.generateSvelteTemplate(componentDef);
    const script = this.templates.generateSvelteScript();

    const code = `<script>\n${StringConverters.indent(script, 2)}\n</script>\n\n` +
      template + '\n\n' +
      '<style>\n/* Component styles */\n</style>\n';

    return {
      code,
      filename: `${StringConverters.kebabCase(componentName)}.svelte`,
      framework: 'svelte',
      dependencies: []
    };
  }
}

export class AngularExporter {
  constructor() {
    this.templates = new ExporterTemplates();
  }

  exportToAngular(componentDef, options = {}) {
    const componentName = options.componentName || 'Component';
    const selector = StringConverters.kebabCase(componentName);
    const className = StringConverters.pascalCase(componentName);

    const template = this.templates.generateAngularTemplate(componentDef);
    const styles = this.templates.generateAngularStyles(componentDef.style || {});

    const code = 'import { Component, OnInit } from \'@angular/core\';\nimport { CommonModule } from \'@angular/common\';\n\n' +
      '@Component({\n' +
      `  selector: 'app-${selector}',\n` +
      '  standalone: true,\n' +
      '  imports: [CommonModule],\n' +
      `  template: \`\n${StringConverters.indent(template, 4)}\n  \`,\n` +
      `  styles: [\`\n${StringConverters.indent(styles, 4)}\n  \`]\n` +
      '})\n' +
      `export class ${className}Component implements OnInit {\n` +
      '  ngOnInit() {}\n' +
      '}\n';

    return {
      code,
      filename: `${selector}.component.ts`,
      framework: 'angular',
      dependencies: ['@angular/core', '@angular/common']
    };
  }
}

export class WebComponentExporter {
  constructor() {
    this.templates = new ExporterTemplates();
  }

  exportToWebComponents(componentDef, options = {}) {
    const componentName = options.componentName || 'Component';
    const className = StringConverters.pascalCase(componentName);
    const tagName = StringConverters.kebabCase(componentName);

    const template = this.templates.generateWebComponentTemplate(componentDef);
    const styles = this.templates.generateWebComponentStyles(componentDef.style || {});

    const code = `export class ${className} extends HTMLElement {\n` +
      '  constructor() {\n' +
      '    super();\n' +
      '    this.attachShadow({ mode: \'open\' });\n' +
      '  }\n\n' +
      '  connectedCallback() {\n' +
      '    this.render();\n' +
      '  }\n\n' +
      '  render() {\n' +
      '    this.shadowRoot.innerHTML = `\n' +
      `      <style>\n${StringConverters.indent(styles, 8)}</style>\n` +
      `      ${template}\n` +
      '    `;\n' +
      '  }\n' +
      '}\n\n' +
      `customElements.define('${tagName}', ${className});\n`;

    return {
      code,
      filename: `${tagName}.component.js`,
      framework: 'web-components',
      dependencies: []
    };
  }
}
