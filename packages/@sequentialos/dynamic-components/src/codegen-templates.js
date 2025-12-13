// Code generation templates and management
export class CodegenTemplates {
  constructor() {
    this.templates = new Map();
    this.initializeTemplates();
  }

  initializeTemplates() {
    this.addTemplate('react-jsx', {
      fileExtension: '.jsx',
      language: 'jsx',
      boilerplate: 'import React, { useState } from \'react\';\n\nexport default function {componentName}() {'
    });

    this.addTemplate('react-ts', {
      fileExtension: '.tsx',
      language: 'typescript',
      boilerplate: 'import React, { useState } from \'react\';\nimport type { FC } from \'react\';\n\nconst {componentName}: FC = () => {'
    });

    this.addTemplate('vue3', {
      fileExtension: '.vue',
      language: 'html',
      boilerplate: '<template>\n  <div>'
    });

    this.addTemplate('svelte', {
      fileExtension: '.svelte',
      language: 'html',
      boilerplate: '<script>\n  let count = 0;\n</script>\n\n<div>'
    });

    this.addTemplate('web-component', {
      fileExtension: '.js',
      language: 'javascript',
      boilerplate: 'export class {ClassName} extends HTMLElement {\n  constructor() {\n    super();\n    this.attachShadow({ mode: \'open\' });\n  }'
    });

    this.addTemplate('angular', {
      fileExtension: '.component.ts',
      language: 'typescript',
      boilerplate: 'import { Component } from \'@angular/core\';\n\n@Component({\n  selector: \'app-{selector}\',\n  templateUrl: \'./{selector}.component.html\',\n  styleUrls: [\'./{selector}.component.css\']\n})\nexport class {ClassName}Component {'
    });
  }

  addTemplate(name, config) {
    this.templates.set(name, config);
    return config;
  }

  getTemplate(name) {
    return this.templates.get(name);
  }

  getAllTemplates() {
    return Array.from(this.templates.entries());
  }
}
