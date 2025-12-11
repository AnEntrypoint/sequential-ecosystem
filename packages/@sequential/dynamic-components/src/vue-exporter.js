/**
 * vue-exporter.js
 *
 * Vue 3 component export functionality
 */

import { StringConverters } from './string-converters.js';
import { ExporterTemplates } from './exporter-templates.js';

export class VueExporter {
  constructor() {
    this.templates = new ExporterTemplates();
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
}
