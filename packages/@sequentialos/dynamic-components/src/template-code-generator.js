// Higher-level template builders for forms, dashboards, grids, data tables, React components, and app templates
import { CodeGenFormatters } from './code-gen-formatters.js';

export class TemplateCodeGenerator {
  constructor(advancedBuilder) {
    this.builder = advancedBuilder;
  }

  generateFormTemplate(fields, templateName = 'form', options = {}) {
    const component = this.builder.buildFormFromTemplate(fields, templateName, options);
    return {
      jsx: CodeGenFormatters.generateJSX(component),
      json: CodeGenFormatters.generateJSON(component),
      typescript: CodeGenFormatters.generateTypeScript(component)
    };
  }

  generateDashboardTemplate(metrics, options = {}) {
    const component = this.builder.buildDashboardFromMetrics(metrics, options);
    return {
      jsx: CodeGenFormatters.generateJSX(component),
      json: CodeGenFormatters.generateJSON(component),
      typescript: CodeGenFormatters.generateTypeScript(component)
    };
  }

  generateResponsiveGrid(items, options = {}) {
    const component = this.builder.buildResponsiveGrid(items, options);
    return {
      jsx: CodeGenFormatters.generateJSX(component),
      json: CodeGenFormatters.generateJSON(component),
      typescript: CodeGenFormatters.generateTypeScript(component)
    };
  }

  generateDataTable(columns, rows, options = {}) {
    const component = this.builder.buildDataTable(columns, rows, options);
    return {
      jsx: CodeGenFormatters.generateJSX(component),
      json: CodeGenFormatters.generateJSON(component),
      typescript: CodeGenFormatters.generateTypeScript(component)
    };
  }

  generateReactComponent(component, componentName) {
    return `import React from 'react';
import { renderJSX, AppRenderingBridge } from '@sequentialos/dynamic-components';

interface ${componentName}Props {
  // Add your props here
}

export const ${componentName}: React.FC<${componentName}Props> = (props) => {
  const component = ${CodeGenFormatters.generateJSON(component)};

  return (
    <div>
      {renderJSX(component, props)}
    </div>
  );
};

export default ${componentName};`;
  }

  generateAppTemplate(appName, components = []) {
    return `import { initializeAppRendering, createAdvancedBuilder, createThemeEngine } from '@sequentialos/dynamic-components';

class ${CodeGenFormatters.pascalCase(appName)}App {
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
    ${components.map((comp, idx) => `const component${idx} = this.builder.build${CodeGenFormatters.pascalCase(comp.template || 'flex')}(this.data);`).join('\n    ')}

    const layout = {
      type: 'flex',
      direction: 'column',
      gap: '16px',
      children: [${components.map((_, idx) => `component${idx}`).join(', ')}]
    };

    this.bridge.render('flex', layout);
  }
}

const app = new ${CodeGenFormatters.pascalCase(appName)}App();
app.init().catch(err => console.error('App init failed:', err));`;
  }
}
