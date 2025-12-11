// Accessibility and contrast analysis
export class InspectorAccessibility {
  getAccessibilityInfo(component) {
    const a11y = {
      hasAriaLabel: !!component['aria-label'],
      hasAriaRole: !!component['aria-role'],
      hasTitle: !!component.title,
      hasAlt: !!component.alt,
      keyboardAccessible: !component.style?.pointerEvents || component.style.pointerEvents !== 'none',
      contrastRatio: this.estimateContrast(component.style),
      recommendations: []
    };

    if (!a11y.hasAriaLabel && !a11y.hasAriaRole) {
      a11y.recommendations.push('Add aria-label or aria-role for screen readers');
    }

    if (!a11y.keyboardAccessible) {
      a11y.recommendations.push('Component has pointer-events: none, consider keyboard navigation');
    }

    return a11y;
  }

  estimateContrast(style = {}) {
    const bgColor = style.background || style.backgroundColor || '#ffffff';
    const fgColor = style.color || '#000000';

    const bgLum = this.getLuminance(bgColor);
    const fgLum = this.getLuminance(fgColor);

    const lighter = Math.max(bgLum, fgLum);
    const darker = Math.min(bgLum, fgLum);

    return ((lighter + 0.05) / (darker + 0.05)).toFixed(2);
  }

  getLuminance(color) {
    if (color === 'transparent') return 0;

    const hex = color.replace('#', '');
    const rgb = parseInt(hex, 16);

    const r = (rgb >> 16) & 255;
    const g = (rgb >> 8) & 255;
    const b = rgb & 255;

    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }

  getResponsiveBehavior(component) {
    const style = component.style || {};

    return {
      hasFlexGrow: !!style.flexGrow,
      hasFlex: !!style.flex,
      hasMaxWidth: !!style.maxWidth,
      hasMediaQueries: !!style.mediaQueries,
      scalesWithViewport: !!style.width?.includes('%') || !!style.width?.includes('vw'),
      recommendations: []
    };
  }

  getDependencies(component) {
    const deps = {
      externalLibraries: [],
      patterns: [],
      fonts: [],
      icons: []
    };

    const content = JSON.stringify(component);

    if (content.includes('react')) {
      deps.externalLibraries.push('react');
    }
    if (content.includes('icon') || content.includes('Icon')) {
      deps.icons.push('icon-library');
    }

    return deps;
  }
}
