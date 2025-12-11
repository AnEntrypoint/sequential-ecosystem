// Component composition and slot management
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
