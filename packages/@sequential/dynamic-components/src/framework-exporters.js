/**
 * framework-exporters.js - Framework Exporters Facade
 *
 * Delegates to focused exporter modules:
 * - react-exporter: React and TypeScript export
 * - vue-exporter: Vue 3 export (Composition & Options API)
 * - other-exporters: Svelte, Angular, Web Components
 * - native-exporters: Flutter and SwiftUI export
 */

import { ReactExporter } from './react-exporter.js';
import { VueExporter } from './vue-exporter.js';
import { SvelteExporter, AngularExporter, WebComponentExporter } from './other-exporters.js';
import { FlutterExporter, SwiftUIExporter } from './native-exporters.js';

export class FrameworkExporters {
  constructor() {
    this.react = new ReactExporter();
    this.vue = new VueExporter();
    this.svelte = new SvelteExporter();
    this.angular = new AngularExporter();
    this.webComponent = new WebComponentExporter();
    this.flutter = new FlutterExporter();
    this.swift = new SwiftUIExporter();
  }

  exportToReact(componentDef, options) {
    return this.react.exportToReact.call(this.react, componentDef, options);
  }

  exportToVue3(componentDef, options) {
    return this.vue.exportToVue3.call(this.vue, componentDef, options);
  }

  exportToSvelte(componentDef, options) {
    return this.svelte.exportToSvelte.call(this.svelte, componentDef, options);
  }

  exportToAngular(componentDef, options) {
    return this.angular.exportToAngular.call(this.angular, componentDef, options);
  }

  exportToWebComponents(componentDef, options) {
    return this.webComponent.exportToWebComponents.call(this.webComponent, componentDef, options);
  }

  exportToFlutter(componentDef, options) {
    return this.flutter.exportToFlutter.call(this.flutter, componentDef, options);
  }

  exportToSwiftUI(componentDef, options) {
    return this.swift.exportToSwiftUI.call(this.swift, componentDef, options);
  }
}
