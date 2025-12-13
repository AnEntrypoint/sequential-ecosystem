// Code generation templates for multiple frameworks
export class CodeGenTemplates {
  constructor() {
    this.templates = this.initializeTemplates();
  }

  initializeTemplates() {
    return {
      react: {
        name: 'React',
        extension: '.jsx',
        features: ['hooks', 'jsx', 'typescript'],
        generate: (name, def) => this.generateReact(name, def)
      },
      vue: {
        name: 'Vue 3',
        extension: '.vue',
        features: ['composition-api', 'typescript', 'scoped-styles'],
        generate: (name, def) => this.generateVue(name, def)
      },
      svelte: {
        name: 'Svelte',
        extension: '.svelte',
        features: ['reactivity', 'stores', 'transitions'],
        generate: (name, def) => this.generateSvelte(name, def)
      },
      angular: {
        name: 'Angular',
        extension: '.ts',
        features: ['components', 'decorators', 'services'],
        generate: (name, def) => this.generateAngular(name, def)
      },
      web: {
        name: 'Web Components',
        extension: '.js',
        features: ['custom-elements', 'shadow-dom', 'slots'],
        generate: (name, def) => this.generateWebComponent(name, def)
      }
    };
  }

  generateReact(name, definition) {
    const PascalCase = this.toPascalCase(name);
    return `import React, { useState } from 'react';

const ${PascalCase} = () => {
  const [state, setState] = useState({});

  return <div>{/* ${name} component */}</div>;
};

export default ${PascalCase};`;
  }

  generateVue(name, definition) {
    return `<template>
  <div class="${this.toKebabCase(name)}">
    <!-- Vue 3 component: ${name} -->
  </div>
</template>

<script setup>
import { ref } from 'vue';

const state = ref({});
</script>

<style scoped>
.${this.toKebabCase(name)} {
  /* Component styles */
}
</style>`;
  }

  generateSvelte(name, definition) {
    return `<script>
  let state = {};
</script>

<div class="${this.toKebabCase(name)}">
  <!-- Svelte component: ${name} -->
</div>

<style>
  .${this.toKebabCase(name)} {
    /* Styles */
  }
</style>`;
  }

  generateAngular(name, definition) {
    const PascalCase = this.toPascalCase(name);
    return `import { Component } from '@angular/core';

@Component({
  selector: 'app-${this.toKebabCase(name)}',
  templateUrl: './${this.toKebabCase(name)}.component.html',
  styleUrls: ['./${this.toKebabCase(name)}.component.css']
})
export class ${PascalCase}Component {
  state = {};
}`;
  }

  generateWebComponent(name, definition) {
    const PascalCase = this.toPascalCase(name);
    return `class ${PascalCase} extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = \`<div><!-- ${name} component --></div>\`;
  }
}

customElements.define('${this.toKebabCase(name)}', ${PascalCase});`;
  }

  toPascalCase(str) {
    return str.replace(/[-_]([a-z])/g, (g) => g[1].toUpperCase()).charAt(0).toUpperCase() + str.slice(1);
  }

  toKebabCase(str) {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase();
  }

  toCamelCase(str) {
    return str.replace(/[-_]([a-z])/g, (g) => g[1].toUpperCase());
  }

  getTemplate(framework) {
    return this.templates[framework];
  }

  getAvailableFrameworks() {
    return Object.keys(this.templates);
  }
}
