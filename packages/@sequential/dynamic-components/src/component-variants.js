// Component variants - manages variant definitions, props, and styles
export class ComponentVariants {
  constructor(registry) {
    this.registry = registry;
    this.variants = new Map();
  }

  defineVariant(componentType, variantName, props = {}, styles = {}) {
    const key = `${componentType}:${variantName}`;
    this.variants.set(key, { props, styles });
    return this;
  }

  getVariant(componentType, variantName) {
    return this.variants.get(`${componentType}:${variantName}`);
  }

  applyVariant(componentType, variantName, baseProps = {}) {
    const variant = this.getVariant(componentType, variantName);
    if (!variant) {
      throw new Error(`Variant ${variantName} not found for ${componentType}`);
    }
    return { props: { ...variant.props, ...baseProps }, styles: variant.styles };
  }

  listVariants(componentType) {
    return Array.from(this.variants.keys())
      .filter(key => key.startsWith(`${componentType}:`))
      .map(key => key.split(':')[1]);
  }

  registerVariantTemplate(componentType, variantName, template) {
    const jsxCode = `<${componentType} ${Object.entries(template.props)
      .map(([k, v]) => `${k}="${v}"`)
      .join(' ')} />`;

    this.registry.register(`${componentType}-${variantName}`, jsxCode, {
      category: 'variants',
      description: template.description,
      tags: ['variant', componentType]
    });

    this.defineVariant(componentType, variantName, template.props, template.styles);
    return this;
  }
}
