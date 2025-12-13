// Main code generation orchestrator
export class CodegenEngine {
  constructor(generators) {
    this.generators = generators;
    this.generatedCode = new Map();
  }

  generate(componentDef, format, componentName = 'MyComponent') {
    const key = `${format}_${componentName}_${Date.now()}`;

    let code;
    switch (format) {
      case 'react-jsx':
        code = this.generators.generateReact(componentDef, componentName);
        break;
      case 'react-ts':
        code = this.generators.generateReactTS(componentDef, componentName);
        break;
      case 'vue3':
        code = this.generators.generateVue3(componentDef);
        break;
      case 'svelte':
        code = this.generators.generateSvelte(componentDef);
        break;
      case 'web-component':
        code = this.generators.generateWebComponent(componentDef, componentName);
        break;
      case 'angular':
        code = this.generators.generateAngular(componentDef, componentName);
        break;
      default:
        code = this.generators.generateReact(componentDef, componentName);
    }

    this.generatedCode.set(key, {
      code,
      format,
      componentName,
      generatedAt: Date.now(),
      componentDef
    });

    return code;
  }

  getGenerated(key) {
    return this.generatedCode.get(key);
  }

  getAllGenerated() {
    return Array.from(this.generatedCode.values());
  }

  clear() {
    this.generatedCode.clear();
  }
}
