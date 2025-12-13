/**
 * codegen-web-angular-generator.js - Web Component and Angular code generation
 *
 * Generates Web Component and Angular component code
 */

export class CodegenWebAngularGenerator {
  constructor(utilities) {
    this.utils = utilities;
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
    return `import { Component } from '@angular/core';\n\n@Component({\n  selector: 'app-${selector}',\n  template: \`\n${this.utils.indent(template, 4)}\n  \`,\n  styles: [\`\n${this.utils.indent(styles, 4)}\n  \`]\n})\nexport class ${className}Component {\n}\n`;
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
