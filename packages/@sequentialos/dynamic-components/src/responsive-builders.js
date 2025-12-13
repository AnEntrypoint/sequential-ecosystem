// Responsive pattern builders for layouts, grids, and flex
export class ResponsiveBuilders {
  constructor(breakpoints, mediaQueryLists) {
    this.breakpoints = breakpoints;
    this.mediaQueryLists = mediaQueryLists;
  }

  createLayoutPattern(name, layouts = {}) {
    return {
      type: 'layout',
      name,
      layouts,
      getCurrent: (currentBp) => layouts[currentBp] || layouts.xs || Object.values(layouts)[0]
    };
  }

  createGridPattern(name, gridConfigs = {}) {
    const defaults = {
      xs: { columns: 1, gap: '12px' },
      sm: { columns: 2, gap: '16px' },
      md: { columns: 3, gap: '20px' },
      lg: { columns: 4, gap: '24px' },
      xl: { columns: 4, gap: '24px' },
      xxl: { columns: 5, gap: '28px' }
    };

    const configs = { ...defaults, ...gridConfigs };
    return {
      type: 'grid',
      name,
      configs,
      getCurrent: (currentBp) => configs[currentBp] || configs.md,
      toCSS: (breakpoint, currentBp) => {
        const config = configs[breakpoint || currentBp];
        return {
          display: 'grid',
          gridTemplateColumns: `repeat(${config.columns}, 1fr)`,
          gap: config.gap
        };
      }
    };
  }

  createFlexPattern(name, flexConfigs = {}) {
    const defaults = {
      xs: { direction: 'column', gap: '12px' },
      sm: { direction: 'column', gap: '16px' },
      md: { direction: 'row', gap: '16px' },
      lg: { direction: 'row', gap: '20px' },
      xl: { direction: 'row', gap: '20px' },
      xxl: { direction: 'row', gap: '24px' }
    };

    const configs = { ...defaults, ...flexConfigs };
    return {
      type: 'flex',
      name,
      configs,
      getCurrent: (currentBp) => configs[currentBp] || configs.md,
      toCSS: (breakpoint, currentBp) => {
        const config = configs[breakpoint || currentBp];
        return {
          display: 'flex',
          flexDirection: config.direction,
          gap: config.gap,
          flexWrap: 'wrap'
        };
      }
    };
  }

  createResponsiveValue(valuesByBreakpoint) {
    return {
      xs: valuesByBreakpoint.xs || valuesByBreakpoint.base,
      sm: valuesByBreakpoint.sm || valuesByBreakpoint.xs || valuesByBreakpoint.base,
      md: valuesByBreakpoint.md || valuesByBreakpoint.sm || valuesByBreakpoint.xs || valuesByBreakpoint.base,
      lg: valuesByBreakpoint.lg || valuesByBreakpoint.md || valuesByBreakpoint.sm || valuesByBreakpoint.xs || valuesByBreakpoint.base,
      xl: valuesByBreakpoint.xl || valuesByBreakpoint.lg || valuesByBreakpoint.md || valuesByBreakpoint.sm || valuesByBreakpoint.xs || valuesByBreakpoint.base,
      xxl: valuesByBreakpoint.xxl || valuesByBreakpoint.xl || valuesByBreakpoint.lg || valuesByBreakpoint.md || valuesByBreakpoint.sm || valuesByBreakpoint.xs || valuesByBreakpoint.base
    };
  }

  buildResponsiveComponent(componentDef, variantsByBreakpoint, currentBp) {
    const ui = {
      type: 'box',
      className: 'responsive-container',
      children: []
    };

    Object.entries(variantsByBreakpoint).forEach(([breakpoint, variant]) => {
      const child = JSON.parse(JSON.stringify(variant || componentDef));
      child.breakpoint = breakpoint;
      child.style = {
        ...child.style,
        display: this.mediaQueryLists.get(breakpoint)?.matches ? 'block' : 'none'
      };
      ui.children.push(child);
    });

    return ui;
  }

  applyResponsiveStyles(element, responsiveStylesMap) {
    Object.entries(responsiveStylesMap).forEach(([breakpoint, styles]) => {
      const mql = this.mediaQueryLists.get(breakpoint);
      if (!mql) return;

      const applyStyles = () => {
        if (mql.matches) {
          Object.assign(element.style, styles);
        }
      };

      applyStyles();
      mql.addListener(applyStyles);
    });
  }
}
