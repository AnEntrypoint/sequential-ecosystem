// Validator rule definitions
export class ValidatorRules {
  constructor() {
    this.rules = new Map();
    this.customValidators = new Map();
    this.initializeRules();
  }

  initializeRules() {
    this.addRule('required-type', (component) => {
      if (!component.type) {
        return { valid: false, message: 'Component type is required' };
      }
      return { valid: true };
    });

    this.addRule('valid-style', (component) => {
      if (!component.style) return { valid: true };

      const validCSSProps = ['width', 'height', 'padding', 'margin', 'background', 'color', 'display', 'flexDirection', 'gap'];
      const styleKeys = Object.keys(component.style);

      for (const key of styleKeys) {
        if (!validCSSProps.includes(key) && !key.startsWith('aria-') && !key.startsWith('data-')) {
          return { valid: false, message: `Invalid CSS property: ${key}` };
        }
      }

      return { valid: true };
    });

    this.addRule('valid-children', (component) => {
      if (!component.children) return { valid: true };

      if (Array.isArray(component.children)) {
        for (const child of component.children) {
          if (typeof child === 'string') {
            continue;
          }
          if (!child.type) {
            return { valid: false, message: 'Child component must have a type' };
          }
        }
      } else if (typeof component.children !== 'string' && !component.children.type) {
        return { valid: false, message: 'Child component must have a type' };
      }

      return { valid: true };
    });

    this.addRule('accessible-text', (component) => {
      if (!component.content && !component.children) {
        if (!component['aria-label'] && component.type !== 'container') {
          return { valid: false, message: 'Component should have content or aria-label', severity: 'warning' };
        }
      }
      return { valid: true };
    });

    this.addRule('color-contrast', (component) => {
      if (!component.style) return { valid: true };

      const hasBackground = component.style.background || component.style.backgroundColor;
      const hasColor = component.style.color;

      if (hasBackground && hasColor && component.content) {
        return { valid: true };
      }

      return { valid: true };
    });

    this.addRule('reasonable-dimensions', (component) => {
      if (!component.style) return { valid: true };

      const width = component.style.width;
      const height = component.style.height;

      if (width && typeof width === 'string') {
        const pxValue = parseInt(width);
        if (pxValue > 0 && pxValue < 10) {
          return { valid: false, message: `Width ${width} is too small`, severity: 'warning' };
        }
        if (pxValue > 10000) {
          return { valid: false, message: `Width ${width} is unreasonably large`, severity: 'warning' };
        }
      }

      return { valid: true };
    });
  }

  addRule(ruleName, validator) {
    this.rules.set(ruleName, validator);
  }

  addCustomValidator(name, fn) {
    this.customValidators.set(name, fn);
  }

  getRule(ruleName) {
    return this.rules.get(ruleName);
  }

  getAllRules() {
    return Array.from(this.rules.keys());
  }

  getCustomValidators() {
    return this.customValidators;
  }
}
