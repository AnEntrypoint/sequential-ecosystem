// WCAG accessibility check methods
export class ValidatorChecks {
  constructor(utils) {
    this.utils = utils;
  }

  checkAltText(definition) {
    if (!definition) return true;

    if (['image', 'img'].includes(definition.type)) {
      return !!(definition.attributes?.alt || definition.attributes?.['aria-label'] || definition.content);
    }

    if (definition.children) {
      return definition.children.every(child => this.checkAltText(child));
    }

    return true;
  }

  checkContrast(definition) {
    if (!definition || !definition.style) return true;

    const bgColor = definition.style.backgroundColor || '#ffffff';
    const textColor = definition.style.color || '#000000';

    const luminance1 = this.utils.getRelativeLuminance(bgColor);
    const luminance2 = this.utils.getRelativeLuminance(textColor);

    const contrast = (Math.max(luminance1, luminance2) + 0.05) / (Math.min(luminance1, luminance2) + 0.05);

    return contrast >= 4.5;
  }

  checkUIContrast(definition) {
    if (!definition || !definition.style) return true;

    const bgColor = definition.style.backgroundColor || '#ffffff';
    const borderColor = definition.style.borderColor || bgColor;

    const luminance1 = this.utils.getRelativeLuminance(bgColor);
    const luminance2 = this.utils.getRelativeLuminance(borderColor);

    const contrast = (Math.max(luminance1, luminance2) + 0.05) / (Math.min(luminance1, luminance2) + 0.05);

    return contrast >= 3;
  }

  checkKeyboardAccess(definition) {
    if (!definition) return true;

    const interactive = ['button', 'input', 'link', 'select', 'textarea'].includes(definition.type);

    if (interactive) {
      return !!(definition.attributes?.tabindex !== undefined || definition.onClick);
    }

    if (definition.children) {
      return definition.children.some(child => this.checkKeyboardAccess(child));
    }

    return true;
  }

  checkNoKeyboardTrap(definition) {
    return true;
  }

  checkFocusOrder(definition) {
    if (!definition) return true;

    if (definition.children && Array.isArray(definition.children)) {
      const hasTabIndexes = definition.children.some(c => c.attributes?.tabindex !== undefined);

      if (hasTabIndexes) {
        const tabIndexes = definition.children
          .map(c => parseInt(c.attributes?.tabindex) || 0)
          .sort((a, b) => a - b);

        for (let i = 0; i < tabIndexes.length - 1; i++) {
          if (tabIndexes[i] > 0 && tabIndexes[i] >= 32767) {
            return false;
          }
        }
      }
    }

    return true;
  }

  checkFocusIndicator(definition) {
    if (!definition) return true;

    const interactive = ['button', 'input', 'link'].includes(definition.type);

    if (interactive) {
      return !!(definition.style?.outline || definition.style?.boxShadow || definition.style?.borderColor);
    }

    if (definition.children) {
      return definition.children.some(child => this.checkFocusIndicator(child));
    }

    return true;
  }

  checkLanguage(definition) {
    return definition?.attributes?.lang !== undefined;
  }

  checkConsistency(definition) {
    return true;
  }

  checkLabels(definition) {
    if (!definition) return true;

    if (['input', 'textarea', 'select'].includes(definition.type)) {
      return !!(definition.attributes?.['aria-label'] || definition.attributes?.['aria-labelledby']);
    }

    if (definition.children) {
      return definition.children.every(child => this.checkLabels(child));
    }

    return true;
  }

  checkNameRoleValue(definition) {
    if (!definition) return true;

    if (definition.type.includes('custom-')) {
      return !!(definition.attributes?.role && definition.attributes?.['aria-label']);
    }

    return true;
  }

  checkStatusMessages(definition) {
    if (!definition) return true;

    if (definition.attributes?.['aria-live']) {
      return true;
    }

    if (definition.children) {
      return definition.children.some(child => this.checkStatusMessages(child));
    }

    return true;
  }
}
