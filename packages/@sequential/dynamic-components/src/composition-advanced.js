import { renderJSX } from './core.js';

export class ComponentComposer {
  constructor(registry) {
    this.registry = registry;
    this.compositions = new Map();
    this.slots = new Map();
    this.defaults = new Map();
  }

  createComposition(name, slots = {}, defaultContent = {}) {
    this.slots.set(name, slots);
    this.defaults.set(name, defaultContent);
    this.compositions.set(name, { slots, defaultContent });
    return this;
  }

  defineSlot(compositionName, slotName, description = '', constraints = {}) {
    if (!this.slots.has(compositionName)) {
      this.slots.set(compositionName, {});
    }
    this.slots.get(compositionName)[slotName] = {
      description,
      constraints,
      optional: constraints.optional !== false
    };
    return this;
  }

  renderComposition(name, props = {}) {
    const slots = this.slots.get(name);
    const defaults = this.defaults.get(name);

    if (!slots) {
      throw new Error(`Composition ${name} not found`);
    }

    const resolved = { ...defaults, ...props };
    return this.validateAndRender(name, resolved, slots);
  }

  validateAndRender(compositionName, props, slots) {
    const errors = [];

    Object.entries(slots).forEach(([slotName, slotDef]) => {
      if (!slotDef.optional && !props[slotName]) {
        errors.push(`Slot ${slotName} is required for ${compositionName}`);
      }

      if (props[slotName] && slotDef.constraints) {
        const constraint = slotDef.constraints;
        if (constraint.type && typeof props[slotName] !== constraint.type) {
          errors.push(`${slotName} must be of type ${constraint.type}`);
        }
        if (constraint.minLength && props[slotName].length < constraint.minLength) {
          errors.push(`${slotName} must have minimum length ${constraint.minLength}`);
        }
        if (constraint.maxLength && props[slotName].length > constraint.maxLength) {
          errors.push(`${slotName} must have maximum length ${constraint.maxLength}`);
        }
        if (constraint.enum && !constraint.enum.includes(props[slotName])) {
          errors.push(`${slotName} must be one of: ${constraint.enum.join(', ')}`);
        }
      }
    });

    if (errors.length > 0) {
      throw new Error(`Composition validation failed:\n${errors.join('\n')}`);
    }

    return props;
  }

  registerCompositionTemplate(name, template) {
    this.registry.register(name, template.code, {
      category: 'compositions',
      description: template.description,
      tags: template.tags || ['composition']
    });

    if (template.slots) {
      this.createComposition(name, template.slots, template.defaults);
    }

    return this;
  }

  listCompositions() {
    return Array.from(this.compositions.keys());
  }

  getCompositionSchema(name) {
    return {
      name,
      slots: this.slots.get(name) || {},
      defaults: this.defaults.get(name) || {},
      description: this.registry.metadata.get(name)?.description || ''
    };
  }
}

export class ComponentConstraints {
  constructor() {
    this.constraints = new Map();
  }

  defineConstraint(componentType, constraints = {}) {
    this.constraints.set(componentType, {
      maxChildren: constraints.maxChildren,
      allowedChildren: constraints.allowedChildren || [],
      requiredProps: constraints.requiredProps || [],
      forbiddenProps: constraints.forbiddenProps || [],
      propRules: constraints.propRules || {}
    });
    return this;
  }

  validate(componentType, props, children) {
    const constraint = this.constraints.get(componentType);
    if (!constraint) return { valid: true };

    const errors = [];

    if (constraint.maxChildren && children.length > constraint.maxChildren) {
      errors.push(`${componentType} can have maximum ${constraint.maxChildren} children, got ${children.length}`);
    }

    if (constraint.allowedChildren.length > 0) {
      const invalidChildren = children.filter(child => !constraint.allowedChildren.includes(child.type));
      if (invalidChildren.length > 0) {
        errors.push(`${componentType} only allows children of type: ${constraint.allowedChildren.join(', ')}`);
      }
    }

    constraint.requiredProps.forEach(prop => {
      if (!props[prop]) {
        errors.push(`${componentType} requires prop: ${prop}`);
      }
    });

    constraint.forbiddenProps.forEach(prop => {
      if (props[prop] !== undefined) {
        errors.push(`${componentType} forbids prop: ${prop}`);
      }
    });

    Object.entries(constraint.propRules).forEach(([prop, rule]) => {
      if (rule.type && props[prop] && typeof props[prop] !== rule.type) {
        errors.push(`Prop ${prop} must be of type ${rule.type}`);
      }
      if (rule.values && props[prop] && !rule.values.includes(props[prop])) {
        errors.push(`Prop ${prop} must be one of: ${rule.values.join(', ')}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

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
    return {
      props: { ...variant.props, ...baseProps },
      styles: variant.styles
    };
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

export class ComponentLibrary {
  constructor(registry) {
    this.registry = registry;
    this.composer = new ComponentComposer(registry);
    this.constraints = new ComponentConstraints();
    this.variants = new ComponentVariants(registry);
    this.categories = new Map();
    this.favorites = new Set();
    this.recent = [];
  }

  registerComponent(name, code, options = {}) {
    this.registry.register(name, code, options);

    const category = options.category || 'general';
    if (!this.categories.has(category)) {
      this.categories.set(category, []);
    }
    this.categories.get(category).push(name);

    this.recent.unshift(name);
    if (this.recent.length > 20) this.recent.pop();

    return this;
  }

  markFavorite(componentName) {
    this.favorites.add(componentName);
    return this;
  }

  unmarkFavorite(componentName) {
    this.favorites.delete(componentName);
    return this;
  }

  isFavorite(componentName) {
    return this.favorites.has(componentName);
  }

  getFavorites() {
    return Array.from(this.favorites);
  }

  getRecent() {
    return this.recent;
  }

  getByCategory(category) {
    return this.categories.get(category) || [];
  }

  search(query) {
    return this.registry.search(query);
  }

  getComponentMetadata(name) {
    return this.registry.metadata.get(name);
  }

  listAllComponents() {
    return this.registry.list();
  }

  exportAsJSON() {
    return {
      components: Array.from(this.registry.components.entries()).map(([name, code]) => ({
        name,
        code,
        metadata: this.registry.metadata.get(name),
        isFavorite: this.favorites.has(name)
      })),
      categories: Array.from(this.categories.entries()).map(([name, items]) => ({
        name,
        items
      }))
    };
  }

  importFromJSON(json) {
    const data = typeof json === 'string' ? JSON.parse(json) : json;
    data.components.forEach(comp => {
      this.registerComponent(comp.name, comp.code, comp.metadata);
      if (comp.isFavorite) this.markFavorite(comp.name);
    });
    return this;
  }
}

export class ComponentPattern {
  constructor(name, description = '') {
    this.name = name;
    this.description = description;
    this.steps = [];
    this.examples = [];
  }

  addStep(description, code) {
    this.steps.push({ description, code });
    return this;
  }

  addExample(name, props) {
    this.examples.push({ name, props });
    return this;
  }

  getSteps() {
    return this.steps;
  }

  getExamples() {
    return this.examples;
  }

  toJSON() {
    return {
      name: this.name,
      description: this.description,
      steps: this.steps,
      examples: this.examples
    };
  }
}

export const createComposer = (registry) => new ComponentComposer(registry);
export const createConstraints = () => new ComponentConstraints();
export const createVariants = (registry) => new ComponentVariants(registry);
export const createLibrary = (registry) => new ComponentLibrary(registry);
export const createPattern = (name, description) => new ComponentPattern(name, description);
