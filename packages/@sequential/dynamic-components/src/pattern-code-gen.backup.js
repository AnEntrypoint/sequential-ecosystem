class PatternCodeGenerator {
  constructor() {
    this.templates = this.initializeTemplates();
    this.listeners = [];
  }

  initializeTemplates() {
    return {
      react: {
        name: 'React',
        extension: '.jsx',
        features: ['hooks', 'jsx', 'typescript'],
        template: (name, definition) => this.generateReact(name, definition)
      },
      vue: {
        name: 'Vue 3',
        extension: '.vue',
        features: ['composition-api', 'typescript', 'scoped-styles'],
        template: (name, definition) => this.generateVue(name, definition)
      },
      svelte: {
        name: 'Svelte',
        extension: '.svelte',
        features: ['reactivity', 'stores', 'transitions'],
        template: (name, definition) => this.generateSvelte(name, definition)
      },
      angular: {
        name: 'Angular',
        extension: '.ts',
        features: ['components', 'decorators', 'services'],
        template: (name, definition) => this.generateAngular(name, definition)
      },
      web: {
        name: 'Web Components',
        extension: '.js',
        features: ['custom-elements', 'shadow-dom', 'slots'],
        template: (name, definition) => this.generateWebComponent(name, definition)
      }
    };
  }

  generateReact(name, definition) {
    const camelCaseName = this.toCamelCase(name);
    const PascalCaseName = this.toPascalCase(name);

    return `import React, { useState } from 'react';

const ${PascalCaseName} = () => {
  ${this.generateReactState(definition)}

  return (
    ${this.definitionToJSX(definition, 4)}
  );
};

export default ${PascalCaseName};
`;
  }

  generateReactState(definition) {
    const hasInteractive = this.countEventHandlers(definition) > 0;

    if (hasInteractive) {
      return 'const [state, setState] = useState({});';
    }

    return '';
  }

  definitionToJSX(definition, indent = 0) {
    const spaces = ' '.repeat(indent);
    const selfClosing = !definition.children || definition.children.length === 0;

    let jsx = `<${definition.type}`;

    if (definition.id) {
      jsx += ` id="${definition.id}"`;
    }

    if (definition.className) {
      jsx += ` className="${definition.className}"`;
    }

    if (definition.style) {
      jsx += ` style={${JSON.stringify(definition.style)}}`;
    }

    if (definition.onClick) {
      jsx += ' onClick={() => {}}';
    }

    if (definition.onChange) {
      jsx += ' onChange={() => {}}';
    }

    if (selfClosing) {
      jsx += ' />';
    } else {
      jsx += '>\n';

      if (definition.content) {
        jsx += spaces + '  ' + definition.content + '\n';
      }

      if (definition.children) {
        definition.children.forEach(child => {
          jsx += spaces + '  ' + this.definitionToJSX(child, indent + 2) + '\n';
        });
      }

      jsx += spaces + `</${definition.type}>`;
    }

    return jsx;
  }

  generateVue(name, definition) {
    const PascalCaseName = this.toPascalCase(name);

    return `<template>
  ${this.definitionToVueTemplate(definition, 2)}
</template>

<script setup lang="ts">
import { ref } from 'vue';

const state = ref({});
</script>

<style scoped>
${this.generateVueStyles(definition)}
</style>
`;
  }

  definitionToVueTemplate(definition, indent = 0) {
    const spaces = ' '.repeat(indent);
    const selfClosing = !definition.children || definition.children.length === 0;

    let template = `<${definition.type}`;

    if (definition.id) {
      template += ` :id="'${definition.id}'"`;
    }

    if (definition.className) {
      template += ` class="${definition.className}"`;
    }

    if (definition.style) {
      template += ` :style="${JSON.stringify(definition.style)}"`;
    }

    if (definition.onClick) {
      template += ' @click="() => {}"';
    }

    if (selfClosing) {
      template += ' />';
    } else {
      template += '>\n';

      if (definition.content) {
        template += spaces + '  ' + definition.content + '\n';
      }

      if (definition.children) {
        definition.children.forEach(child => {
          template += spaces + '  ' + this.definitionToVueTemplate(child, indent + 2) + '\n';
        });
      }

      template += spaces + `</${definition.type}>`;
    }

    return template;
  }

  generateVueStyles(definition) {
    const styles = this.extractStyles(definition);

    let css = '';

    Object.entries(styles).forEach(([selector, props]) => {
      css += `${selector} {\n`;

      Object.entries(props).forEach(([prop, value]) => {
        const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
        css += `  ${cssProp}: ${value};\n`;
      });

      css += '}\n';
    });

    return css;
  }

  generateSvelte(name, definition) {
    const PascalCaseName = this.toPascalCase(name);

    return `<script>
  let state = {};

  function handleChange(e) {
    // Handle changes
  }
</script>

${this.definitionToSvelteTemplate(definition)}

<style>
${this.generateSvelteStyles(definition)}
</style>
`;
  }

  definitionToSvelteTemplate(definition, indent = 0) {
    const spaces = ' '.repeat(indent);
    const selfClosing = !definition.children || definition.children.length === 0;

    let template = `<${definition.type}`;

    if (definition.id) {
      template += ` id="${definition.id}"`;
    }

    if (definition.className) {
      template += ` class="${definition.className}"`;
    }

    if (definition.style) {
      template += ` style="${this.styleToCSSString(definition.style)}"`;
    }

    if (definition.onClick) {
      template += ' on:click={handleChange}';
    }

    if (selfClosing) {
      template += ' />';
    } else {
      template += '>\n';

      if (definition.content) {
        template += spaces + '  ' + definition.content + '\n';
      }

      if (definition.children) {
        definition.children.forEach(child => {
          template += spaces + '  ' + this.definitionToSvelteTemplate(child, indent + 2) + '\n';
        });
      }

      template += spaces + `</${definition.type}>`;
    }

    return template;
  }

  generateSvelteStyles(definition) {
    const styles = this.extractStyles(definition);
    let css = '';

    Object.entries(styles).forEach(([selector, props]) => {
      css += `${selector} {\n`;

      Object.entries(props).forEach(([prop, value]) => {
        const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
        css += `  ${cssProp}: ${value};\n`;
      });

      css += '}\n';
    });

    return css;
  }

  generateAngular(name, definition) {
    const PascalCaseName = this.toPascalCase(name);
    const kebabCaseName = this.toKebabCase(name);

    return `import { Component } from '@angular/core';

@Component({
  selector: 'app-${kebabCaseName}',
  templateUrl: './${kebabCaseName}.component.html',
  styleUrls: ['./${kebabCaseName}.component.css']
})
export class ${PascalCaseName}Component {
  state = {};

  handleChange() {
    // Handle changes
  }
}
`;
  }

  generateWebComponent(name, definition) {
    const PascalCaseName = this.toPascalCase(name);
    const kebabCaseName = this.toKebabCase(name);

    return `class ${PascalCaseName} extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = \`
      ${this.definitionToHTML(definition)}
      <style>
        ${this.generateWebComponentStyles(definition)}
      </style>
    \`;
  }
}

customElements.define('${kebabCaseName}', ${PascalCaseName});
export default ${PascalCaseName};
`;
  }

  definitionToHTML(definition, indent = 0) {
    const spaces = ' '.repeat(indent);
    const selfClosing = !definition.children || definition.children.length === 0;

    let html = `<${definition.type}`;

    if (definition.id) {
      html += ` id="${definition.id}"`;
    }

    if (definition.className) {
      html += ` class="${definition.className}"`;
    }

    if (definition.style) {
      html += ` style="${this.styleToCSSString(definition.style)}"`;
    }

    if (selfClosing) {
      html += '>';
    } else {
      html += '>\n';

      if (definition.content) {
        html += spaces + '  ' + definition.content + '\n';
      }

      if (definition.children) {
        definition.children.forEach(child => {
          html += spaces + '  ' + this.definitionToHTML(child, indent + 2) + '\n';
        });
      }

      html += spaces + `</${definition.type}>`;
    }

    return html;
  }

  generateWebComponentStyles(definition) {
    const styles = this.extractStyles(definition);
    let css = ':host { display: block; }\n';

    Object.entries(styles).forEach(([selector, props]) => {
      css += `${selector} {\n`;

      Object.entries(props).forEach(([prop, value]) => {
        const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
        css += `  ${cssProp}: ${value};\n`;
      });

      css += '}\n';
    });

    return css;
  }

  styleToCSSString(style) {
    return Object.entries(style)
      .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
      .join('; ');
  }

  extractStyles(definition, styles = {}) {
    if (definition.style) {
      styles[definition.type] = definition.style;
    }

    if (definition.children) {
      definition.children.forEach(child => {
        this.extractStyles(child, styles);
      });
    }

    return styles;
  }

  generateCSS(definition) {
    const styles = this.extractStyles(definition);
    let css = '';

    Object.entries(styles).forEach(([selector, props]) => {
      css += `${selector} {\n`;

      Object.entries(props).forEach(([prop, value]) => {
        const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
        css += `  ${cssProp}: ${value};\n`;
      });

      css += '}\n';
    });

    return css;
  }

  countEventHandlers(definition) {
    if (!definition) return 0;

    let count = 0;

    const eventProps = ['onClick', 'onChange', 'onSubmit'];
    eventProps.forEach(prop => {
      if (definition[prop]) count++;
    });

    if (definition.children) {
      definition.children.forEach(child => {
        count += this.countEventHandlers(child);
      });
    }

    return count;
  }

  toCamelCase(str) {
    return str.replace(/[-_\s](.)/g, (_, c) => c.toUpperCase())
      .replace(/^(.)/, c => c.toLowerCase());
  }

  toPascalCase(str) {
    return str.replace(/[-_\s](.)/g, (_, c) => c.toUpperCase())
      .replace(/^(.)/, c => c.toUpperCase());
  }

  toKebabCase(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]/g, '-')
      .toLowerCase();
  }

  generate(name, definition, framework = 'react') {
    const template = this.templates[framework];

    if (!template) return null;

    const code = template.template(name, definition);

    this.notifyListeners('codeGenerated', {
      name,
      framework,
      code,
      extension: template.extension
    });

    return {
      name,
      framework,
      code,
      extension: template.extension,
      filename: `${this.toKebabCase(name)}${template.extension}`
    };
  }

  generateAll(name, definition) {
    const results = {};

    Object.keys(this.templates).forEach(framework => {
      results[framework] = this.generate(name, definition, framework);
    });

    return results;
  }

  buildCodePreview(code, language = 'jsx') {
    return {
      type: 'box',
      style: {
        padding: '16px',
        backgroundColor: '#1e1e1e',
        borderRadius: '4px',
        overflow: 'auto',
        fontFamily: 'monospace'
      },
      children: [
        {
          type: 'paragraph',
          content: code,
          style: {
            margin: 0,
            color: '#d4d4d4',
            fontSize: '12px',
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap'
          }
        }
      ]
    };
  }

  on(event, callback) {
    this.listeners.push({ event, callback });
    return this;
  }

  off(event, callback) {
    this.listeners = this.listeners.filter(
      l => !(l.event === event && l.callback === callback)
    );
    return this;
  }

  notifyListeners(event, data) {
    this.listeners
      .filter(l => l.event === event)
      .forEach(l => {
        try {
          l.callback(data);
        } catch (e) {
          console.error(`Code generator listener error for ${event}:`, e);
        }
      });
  }

  clear() {
    this.listeners = [];
    return this;
  }
}

function createPatternCodeGenerator() {
  return new PatternCodeGenerator();
}

export { PatternCodeGenerator, createPatternCodeGenerator };
