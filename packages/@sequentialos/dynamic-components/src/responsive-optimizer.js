// Responsive component optimization for different device types
export class ResponsiveOptimizer {
  constructor(viewport) {
    this.viewport = viewport;
    this.layoutConfigs = {
      xs: {
        columns: 1, gap: 6, padding: 8, fontSize: { base: 12, heading: 14 },
        touchTarget: 40, containerWidth: '100%'
      },
      sm: {
        columns: 1, gap: 8, padding: 10, fontSize: { base: 13, heading: 15 },
        touchTarget: 44, containerWidth: '100%'
      },
      md: {
        columns: 2, gap: 12, padding: 12, fontSize: { base: 14, heading: 16 },
        touchTarget: 48, containerWidth: '90%'
      },
      lg: {
        columns: 3, gap: 12, padding: 16, fontSize: { base: 14, heading: 18 },
        touchTarget: 44, containerWidth: '85%'
      },
      xl: {
        columns: 4, gap: 16, padding: 20, fontSize: { base: 15, heading: 20 },
        touchTarget: 40, containerWidth: '80%'
      },
      xxl: {
        columns: 5, gap: 20, padding: 24, fontSize: { base: 16, heading: 22 },
        touchTarget: 40, containerWidth: '75%'
      }
    };
  }

  applyResponsiveStyles(componentDef, overrides = {}) {
    const breakpoint = this.viewport.currentBreakpoint;
    const responsive = componentDef.responsive || {};
    const breakpointStyles = responsive[breakpoint] || {};

    const style = {
      ...componentDef.style,
      ...breakpointStyles,
      ...overrides
    };

    return { ...componentDef, style };
  }

  optimizeForMobile(componentDef) {
    if (this.viewport.currentBreakpoint !== 'xs' && this.viewport.currentBreakpoint !== 'sm') {
      return componentDef;
    }

    const optimized = JSON.parse(JSON.stringify(componentDef));

    optimized.style = {
      ...optimized.style,
      padding: this.scalePadding(optimized.style?.padding || '12px', 0.8),
      gap: this.scalePadding(optimized.style?.gap || '8px', 0.8),
      fontSize: this.scaleFontSize(optimized.style?.fontSize || '14px', 0.9)
    };

    if (optimized.children && Array.isArray(optimized.children)) {
      optimized.children = optimized.children.map(child =>
        this.optimizeForMobile(child)
      ).filter(child => {
        if (child.mobile === false) return false;
        return true;
      });
    }

    if (optimized.style?.gridTemplateColumns) {
      optimized.style.gridTemplateColumns = 'repeat(auto-fit, minmax(100%, 1fr))';
    }

    return optimized;
  }

  optimizeForTablet(componentDef) {
    if (this.viewport.currentBreakpoint !== 'md' && this.viewport.currentBreakpoint !== 'lg') {
      return componentDef;
    }

    const optimized = JSON.parse(JSON.stringify(componentDef));

    if (optimized.style?.gridTemplateColumns) {
      optimized.style.gridTemplateColumns = 'repeat(2, 1fr)';
    }

    optimized.style = {
      ...optimized.style,
      padding: this.scalePadding(optimized.style?.padding || '12px', 0.95),
      gap: this.scalePadding(optimized.style?.gap || '8px', 0.95)
    };

    return optimized;
  }

  optimizeForDesktop(componentDef) {
    if (this.viewport.currentBreakpoint !== 'xl' && this.viewport.currentBreakpoint !== 'xxl') {
      return componentDef;
    }

    const optimized = JSON.parse(JSON.stringify(componentDef));

    if (optimized.style?.gridTemplateColumns === 'repeat(auto-fit, minmax(100%, 1fr))') {
      optimized.style.gridTemplateColumns = 'repeat(auto-fit, minmax(300px, 1fr))';
    }

    return optimized;
  }

  scalePadding(padding, factor) {
    const match = padding.match(/(\d+)/);
    if (!match) return padding;
    const value = parseInt(match[1]) * factor;
    return `${Math.round(value)}px`;
  }

  scaleFontSize(fontSize, factor) {
    const match = fontSize.match(/(\d+)/);
    if (!match) return fontSize;
    const value = parseInt(match[1]) * factor;
    return `${Math.round(value)}px`;
  }

  getResponsiveLayoutConfig(breakpoint = null) {
    const bp = breakpoint || this.viewport.currentBreakpoint;
    return this.layoutConfigs[bp] || this.layoutConfigs.md;
  }

  generateResponsiveCSSQuery() {
    const queries = [];

    Object.entries(this.viewport.breakpoints).forEach(([bp, width]) => {
      queries.push({
        breakpoint: bp,
        minWidth: width,
        config: this.getResponsiveLayoutConfig(bp)
      });
    });

    return queries;
  }
}
