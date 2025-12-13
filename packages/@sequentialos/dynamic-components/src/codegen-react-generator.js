/**
 * codegen-react-generator.js - React code generation
 *
 * Generates React and React TypeScript component code
 */

export class CodegenReactGenerator {
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

  generateReactChildren(children, indent = 0) {
    if (!children) return '';
    if (typeof children === 'string') return this.utils.indent(children, 4);
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
}
