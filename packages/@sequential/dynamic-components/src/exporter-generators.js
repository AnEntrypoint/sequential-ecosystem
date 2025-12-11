// Exporter generators facade - maintains 100% backward compatibility
import { FrameworkExporters } from './framework-exporters.js';

export class ExporterGenerators {
  constructor() {
    this.exporters = new FrameworkExporters();
  }

  exportToReact(componentDef, options = {}) {
    return this.exporters.exportToReact(componentDef, options);
  }

  exportToVue3(componentDef, options = {}) {
    return this.exporters.exportToVue3(componentDef, options);
  }

  exportToSvelte(componentDef, options = {}) {
    return this.exporters.exportToSvelte(componentDef, options);
  }

  exportToAngular(componentDef, options = {}) {
    return this.exporters.exportToAngular(componentDef, options);
  }

  exportToWebComponents(componentDef, options = {}) {
    return this.exporters.exportToWebComponents(componentDef, options);
  }

  exportToFlutter(componentDef, options = {}) {
    return this.exporters.exportToFlutter(componentDef, options);
  }

  exportToSwiftUI(componentDef, options = {}) {
    return this.exporters.exportToSwiftUI(componentDef, options);
  }
}
