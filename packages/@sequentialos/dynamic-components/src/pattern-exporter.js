// Facade maintaining 100% backward compatibility
import { ExporterGenerators } from './exporter-generators.js';
import { ExporterConfig } from './exporter-config.js';
import { ExporterUI } from './exporter-ui.js';

class PatternExporter {
  constructor() {
    this.config = new ExporterConfig();
    this.generators = new ExporterGenerators();
    this.ui = new ExporterUI();
    this.exportConfigs = this.config.exportConfigs;
    this.exportHistory = this.config.exportHistory;
    this.frameworks = this.config.frameworks;
  }

  registerFramework(name, config) {
    return this.config.registerFramework(name, config);
  }

  exportToReact(componentDef, options = {}) {
    const result = this.generators.exportToReact(componentDef, options);
    this.config.recordExport('react', options.componentName || 'Component');
    return result;
  }

  exportToVue3(componentDef, options = {}) {
    const result = this.generators.exportToVue3(componentDef, options);
    this.config.recordExport('vue3', options.componentName || 'Component');
    return result;
  }

  exportToSvelte(componentDef, options = {}) {
    const result = this.generators.exportToSvelte(componentDef, options);
    this.config.recordExport('svelte', options.componentName || 'Component');
    return result;
  }

  exportToAngular(componentDef, options = {}) {
    const result = this.generators.exportToAngular(componentDef, options);
    this.config.recordExport('angular', options.componentName || 'Component');
    return result;
  }

  exportToWebComponents(componentDef, options = {}) {
    const result = this.generators.exportToWebComponents(componentDef, options);
    this.config.recordExport('web-components', options.componentName || 'Component');
    return result;
  }

  exportToFlutter(componentDef, options = {}) {
    const result = this.generators.exportToFlutter(componentDef, options);
    this.config.recordExport('flutter', options.componentName || 'Component');
    return result;
  }

  exportToSwiftUI(componentDef, options = {}) {
    const result = this.generators.exportToSwiftUI(componentDef, options);
    this.config.recordExport('swift-ui', options.componentName || 'Component');
    return result;
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

    return result;
  }

  exportMultiple(componentDef, frameworks = ['react', 'vue3'], options = {}) {
    const exports = {};

    frameworks.forEach(framework => {
      if (this.config.exportConfigs.has(framework)) {
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
    return this.ui.buildExporterUI(this.frameworks, this.exportConfigs);
  }

  getFrameworkInfo(framework) {
    return this.config.getFrameworkInfo(framework);
  }

  getAllFrameworks() {
    return this.config.getAllFrameworks();
  }

  exportSummary() {
    return this.config.exportSummary();
  }
}

function createPatternExporter() {
  return new PatternExporter();
}

export { PatternExporter, createPatternExporter };
