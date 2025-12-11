// Component documentation generation
import { usageExamples, typeSpecificProps, componentRelationships } from './dom-mappings.js';

export class ComponentDocGenerator {
  constructor(registry) {
    this.registry = registry;
  }

  generateComponentDocs(componentName) {
    const meta = this.registry.metadata.get(componentName);

    return {
      name: componentName,
      description: meta?.description || '',
      category: meta?.category || 'uncategorized',
      usage: this.generateUsageExample(componentName),
      props: this.extractProps(componentName),
      relatedComponents: this.findRelated(componentName)
    };
  }

  generateUsageExample(componentName) {
    return usageExamples[componentName] || `const ${componentName} = {
  type: '${componentName}',
  // Add props here
};`;
  }

  extractProps(componentName) {
    const commonProps = ['className', 'style', 'onClick', 'onChange'];
    return [...commonProps, ...(typeSpecificProps[componentName] || [])];
  }

  findRelated(componentName) {
    return componentRelationships[componentName] || [];
  }
}
