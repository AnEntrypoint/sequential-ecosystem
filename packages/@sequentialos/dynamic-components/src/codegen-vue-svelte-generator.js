/**
 * codegen-vue-svelte-generator.js - Vue 3 and Svelte code generation
 *
 * Generates Vue 3 Single File Components and Svelte components
 */

export class CodegenVueSvelteGenerator {
  constructor(utilities) {
    this.utils = utilities;
  }

  generateVue3(componentDef) {
    const styles = this.generateVueStyles(componentDef.style || {});
    const children = this.generateVueChildren(componentDef.children);
    return `<template>\n  <${componentDef.type}${styles}>\n${this.utils.indent(children, 4)}\n  </${componentDef.type}>\n</template>\n\n<script setup>\nimport { ref } from 'vue';\n\nconst state = ref({});\n</script>\n\n<style scoped>\n/* Add component styles here */\n</style>\n`;
  }

  generateSvelte(componentDef) {
    const styles = this.generateSvelteStyles(componentDef.style || {});
    const children = this.generateSvelteChildren(componentDef.children);
    return `<script>\n  let state = {};\n</script>\n\n<${componentDef.type}${styles}>\n${this.utils.indent(children, 2)}\n</${componentDef.type}>\n\n<style>\n  /* Add component styles here */\n</style>\n`;
  }

  generateVueStyles(styleObj) {
    const styles = Object.entries(styleObj)
      .filter(([key]) => !key.startsWith('_'))
      .map(([key, value]) => {
        const cssKey = this.utils.toCSSProperty(key);
        return `${cssKey}: ${this.utils.formatStyleValue(value)}`;
      })
      .join('; ');
    return styles ? ` :style="{ ${this.utils.styleObjToString(styleObj)} }"` : '';
  }

  generateSvelteStyles(styleObj) {
    const styles = Object.entries(styleObj)
      .filter(([key]) => !key.startsWith('_'))
      .map(([key, value]) => {
        const cssKey = this.utils.toCSSProperty(key);
        return `${cssKey}: ${this.utils.formatStyleValue(value)}`;
      })
      .join('; ');
    return styles ? ` style="${styles}"` : '';
  }

  generateVueChildren(children) {
    if (!children) return '';
    if (typeof children === 'string') return children;
    if (Array.isArray(children)) return children.map(child => this.generateVueChildren(child)).join('\n');
    if (typeof children === 'object') {
      const type = children.type || 'div';
      const styles = this.generateVueStyles(children.style || {});
      const childContent = children.content || this.generateVueChildren(children.children);
      return `<${type}${styles}>${childContent}</${type}>`;
    }
    return '';
  }

  generateSvelteChildren(children) {
    if (!children) return '';
    if (typeof children === 'string') return children;
    if (Array.isArray(children)) return children.map(child => this.generateSvelteChildren(child)).join('\n');
    if (typeof children === 'object') {
      const type = children.type || 'div';
      const styles = this.generateSvelteStyles(children.style || {});
      const childContent = children.content || this.generateSvelteChildren(children.children);
      return `<${type}${styles}>${childContent}</${type}>`;
    }
    return '';
  }
}
