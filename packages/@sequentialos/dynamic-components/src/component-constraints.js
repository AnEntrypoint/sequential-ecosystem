// Component constraints - validates props, children, and component structure
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

    return { valid: errors.length === 0, errors };
  }
}
