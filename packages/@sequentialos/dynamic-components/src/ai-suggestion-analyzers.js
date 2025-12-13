/**
 * ai-suggestion-analyzers.js - Pattern analysis methods for AI suggestions
 *
 * Analyze pattern definitions for various issues
 */

export class PatternAnalyzers {
  static countEventHandlers(definition) {
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

  static hasDuplicateStructures(definition, seen = new Map()) {
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

  static missingAriaLabels(definition) {
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

  static hasLowContrast(definition) {
    if (!definition || !definition.style) return false;
    const fg = definition.style.color || '#000000';
    const bg = definition.style.backgroundColor || '#ffffff';
    const contrast = this.getContrast(fg, bg);
    return contrast < 4.5;
  }

  static missingKeyboardSupport(definition) {
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

  static hasInconsistentSpacing(definition) {
    if (!definition?.style) return false;
    const spacings = [];
    if (definition.style.padding) spacings.push(definition.style.padding);
    if (definition.style.margin) spacings.push(definition.style.margin);
    return spacings.length > 1 && new Set(spacings).size > 1;
  }

  static hasResponsiveStyles(definition) {
    if (!definition?.style) return false;
    return definition.style.mediaQueries || definition.style.breakpoints;
  }

  static hasVisualHierarchy(definition) {
    if (!definition?.style) return false;
    return definition.style.fontSize || definition.style.fontWeight;
  }

  static getContrast(fg, bg) {
    const l1 = this.getRelativeLuminance(fg);
    const l2 = this.getRelativeLuminance(bg);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  static getRelativeLuminance(hexColor) {
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
