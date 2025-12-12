/**
 * codegen-framework-generators.js - Framework Code Generators Facade
 *
 * Delegates to framework-specific generator modules
 */

import { CodegenReactGenerator } from './codegen-react-generator.js';
import { CodegenVueSvelteGenerator } from './codegen-vue-svelte-generator.js';
import { CodegenWebAngularGenerator } from './codegen-web-angular-generator.js';

export class CodegenFrameworkGenerators {
  constructor(utilities) {
    this.utils = utilities;
    this.react = new CodegenReactGenerator(utilities);
    this.vueSvelte = new CodegenVueSvelteGenerator(utilities);
    this.webAngular = new CodegenWebAngularGenerator(utilities);
  }

  generateReact(componentDef, componentName = 'MyComponent') {
    return this.react.generateReact(componentDef, componentName);
  }

  generateReactTS(componentDef, componentName = 'MyComponent') {
    return this.react.generateReactTS(componentDef, componentName);
  }

  generateVue3(componentDef) {
    return this.vueSvelte.generateVue3(componentDef);
  }

  generateSvelte(componentDef) {
    return this.vueSvelte.generateSvelte(componentDef);
  }

  generateWebComponent(componentDef, className = 'MyComponent') {
    return this.webAngular.generateWebComponent(componentDef, className);
  }

  generateAngular(componentDef, componentName = 'MyComponent') {
    return this.webAngular.generateAngular(componentDef, componentName);
  }
}
