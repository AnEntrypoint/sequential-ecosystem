// Framework configuration and export management
export class ExporterConfig {
  constructor() {
    this.exportConfigs = new Map();
    this.exportHistory = [];
    this.frameworks = [
      'react',
      'vue3',
      'svelte',
      'angular',
      'web-components',
      'flutter',
      'swift-ui'
    ];
    this.initializeFrameworks();
  }

  initializeFrameworks() {
    this.registerFramework('react', {
      name: 'React',
      version: '18+',
      extension: 'jsx',
      defaultTemplate: 'functional',
      features: ['hooks', 'props', 'state-management'],
      dependencies: []
    });

    this.registerFramework('vue3', {
      name: 'Vue 3',
      version: '3+',
      extension: 'vue',
      defaultTemplate: 'composition-api',
      features: ['composition-api', 'template-syntax', 'reactivity'],
      dependencies: ['vue']
    });

    this.registerFramework('svelte', {
      name: 'Svelte',
      version: '4+',
      extension: 'svelte',
      defaultTemplate: 'reactive',
      features: ['reactivity', 'animations', 'stores'],
      dependencies: []
    });

    this.registerFramework('angular', {
      name: 'Angular',
      version: '16+',
      extension: 'component.ts',
      defaultTemplate: 'standalone',
      features: ['directives', 'pipes', 'services'],
      dependencies: ['@angular/core', '@angular/common']
    });

    this.registerFramework('web-components', {
      name: 'Web Components',
      version: 'ES2020+',
      extension: 'js',
      defaultTemplate: 'custom-element',
      features: ['shadow-dom', 'slots', 'custom-elements'],
      dependencies: []
    });

    this.registerFramework('flutter', {
      name: 'Flutter',
      version: '3.0+',
      extension: 'dart',
      defaultTemplate: 'stateless-widget',
      features: ['widgets', 'material-design', 'responsive'],
      dependencies: ['flutter/material.dart']
    });

    this.registerFramework('swift-ui', {
      name: 'SwiftUI',
      version: '14+',
      extension: 'swift',
      defaultTemplate: 'view-protocol',
      features: ['property-wrappers', 'modifiers', 'layout'],
      dependencies: ['SwiftUI']
    });
  }

  registerFramework(name, config) {
    this.exportConfigs.set(name, config);
  }

  recordExport(framework, componentName) {
    this.exportHistory.push({
      framework,
      timestamp: Date.now(),
      componentName
    });
  }

  getFrameworkInfo(framework) {
    return this.exportConfigs.get(framework);
  }

  getAllFrameworks() {
    return Array.from(this.exportConfigs.entries()).map(([name, config]) => ({
      name,
      ...config
    }));
  }

  exportSummary() {
    return {
      totalExports: this.exportHistory.length,
      frameworks: this.getAllFrameworks(),
      recentExports: this.exportHistory.slice(-10),
      exportedAt: new Date().toISOString()
    };
  }
}
