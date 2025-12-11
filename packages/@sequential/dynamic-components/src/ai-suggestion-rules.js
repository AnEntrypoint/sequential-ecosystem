// AI suggestion rules and analysis
export class AISuggestionRules {
  constructor() {
    this.rules = this.initializeRules();
  }

  initializeRules() {
    return {
      performance: [
        {
          name: 'Use memoization',
          detect: (pattern) => pattern.definition && pattern.definition.children?.length > 5,
          suggestion: 'This pattern has many children. Consider using composition to reduce re-renders.'
        },
        {
          name: 'Optimize event handlers',
          detect: (pattern) => this.countEventHandlers(pattern.definition) > 3,
          suggestion: 'Too many event handlers. Consider using delegation or event bubbling.'
        },
        {
          name: 'Extract reusable components',
          detect: (pattern) => this.hasDuplicateStructures(pattern.definition),
          suggestion: 'Duplicate structures detected. Extract to reusable pattern.'
        }
      ],
      accessibility: [
        {
          name: 'Add ARIA labels',
          detect: (pattern) => this.missingAriaLabels(pattern.definition),
          suggestion: 'Add aria-label or aria-describedby for better accessibility.'
        },
        {
          name: 'Ensure color contrast',
          detect: (pattern) => this.hasLowContrast(pattern.definition),
          suggestion: 'Color contrast may be too low. Ensure text is readable.'
        },
        {
          name: 'Add keyboard navigation',
          detect: (pattern) => this.missingKeyboardSupport(pattern.definition),
          suggestion: 'Add keyboard event handlers for better accessibility.'
        }
      ],
      design: [
        {
          name: 'Use consistent spacing',
          detect: (pattern) => this.hasInconsistentSpacing(pattern.definition),
          suggestion: 'Spacing values are inconsistent. Use a standard spacing scale.'
        },
        {
          name: 'Apply responsive design',
          detect: (pattern) => !this.hasResponsiveStyles(pattern.definition),
          suggestion: 'Pattern not responsive. Add breakpoint-specific styles.'
        },
        {
          name: 'Improve visual hierarchy',
          detect: (pattern) => !this.hasVisualHierarchy(pattern.definition),
          suggestion: 'Improve visual hierarchy with font sizes and weights.'
        }
      ]
    };
  }

  countEventHandlers(definition) {
    if (!definition) return 0;
    let count = 0;
    const eventProps = ['onClick', 'onHover', 'onFocus', 'onChange', 'onSubmit'];
    for (const prop of eventProps) {
      if (definition[prop]) count++;
    }
    if (definition.children) {
      count += definition.children.reduce((sum, child) => sum + this.countEventHandlers(child), 0);
    }
    return count;
  }

  hasDuplicateStructures(definition, seen = new Map()) {
    if (!definition) return false;
    const key = `${definition.type}-${definition.className || ''}`;
    if (seen.has(key)) return true;
    seen.set(key, true);
    if (definition.children) {
      for (const child of definition.children) {
        if (this.hasDuplicateStructures(child, seen)) return true;
      }
    }
    return false;
  }

  missingAriaLabels(definition) {
    if (!definition) return false;
    const needsLabel = ['button', 'input', 'link'].includes(definition.type);
    if (needsLabel && !definition.attributes?.['aria-label']) return true;
    if (definition.children) {
      for (const child of definition.children) {
        if (this.missingAriaLabels(child)) return true;
      }
    }
    return false;
  }

  hasLowContrast(definition) {
    if (!definition || !definition.style) return false;
    const fg = definition.style.color || '#000000';
    const bg = definition.style.backgroundColor || '#ffffff';
    const contrast = this.getContrast(fg, bg);
    return contrast < 4.5;
  }

  missingKeyboardSupport(definition) {
    if (!definition) return false;
    const interactive = ['button', 'input', 'link'].includes(definition.type);
    if (interactive && !definition.attributes?.tabIndex && !definition.onKeyDown) return true;
    if (definition.children) {
      for (const child of definition.children) {
        if (this.missingKeyboardSupport(child)) return true;
      }
    }
    return false;
  }

  hasInconsistentSpacing(definition) {
    if (!definition?.style) return false;
    const spacings = [];
    if (definition.style.padding) spacings.push(definition.style.padding);
    if (definition.style.margin) spacings.push(definition.style.margin);
    return spacings.length > 1 && new Set(spacings).size > 1;
  }

  hasResponsiveStyles(definition) {
    if (!definition?.style) return false;
    return definition.style.mediaQueries || definition.style.breakpoints;
  }

  hasVisualHierarchy(definition) {
    if (!definition?.style) return false;
    return definition.style.fontSize || definition.style.fontWeight;
  }

  getContrast(fg, bg) {
    const l1 = this.getRelativeLuminance(fg);
    const l2 = this.getRelativeLuminance(bg);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  getRelativeLuminance(hexColor) {
    const rgb = parseInt(hexColor.slice(1), 16);
    const r = (rgb >> 16) & 255;
    const g = (rgb >> 8) & 255;
    const b = rgb & 255;
    const rs = r / 255;
    const gs = g / 255;
    const bs = b / 255;
    const luminance = 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    return luminance <= 0.03928 ? luminance / 12.92 : Math.pow((luminance + 0.055) / 1.055, 2.4);
  }
}
