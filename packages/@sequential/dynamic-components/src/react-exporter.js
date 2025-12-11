/**
 * react-exporter.js
 *
 * React/TypeScript component export functionality
 */

import { StringConverters } from './string-converters.js';
import { ExporterTemplates } from './exporter-templates.js';

export class ReactExporter {
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
}
