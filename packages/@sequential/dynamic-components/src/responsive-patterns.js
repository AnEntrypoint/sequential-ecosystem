class ResponsivePatternSystem {
  constructor(breakpoints = {}) {
    this.breakpoints = {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
      ...breakpoints
    };

    this.patterns = new Map();
    this.listeners = [];
    this.currentBreakpoint = this.detectBreakpoint();
    this.resizeObserver = null;
    this.mediaQueryLists = new Map();
    this.setupMediaQueries();
  }

  detectBreakpoint() {
    if (typeof window === 'undefined') return 'md';
    const width = window.innerWidth;
    const sorted = Object.entries(this.breakpoints).sort((a, b) => b[1] - a[1]);

    for (const [name, px] of sorted) {
      if (width >= px) return name;
    }
    return 'xs';
  }

  setupMediaQueries() {
    if (typeof window === 'undefined') return;

    const breakpointArray = Object.entries(this.breakpoints)
      .sort((a, b) => a[1] - b[1]);

    breakpointArray.forEach((breakpoint, idx) => {
      const [name, px] = breakpoint;
      const nextBreakpoint = breakpointArray[idx + 1];

      let query = `(min-width: ${px}px)`;
      if (nextBreakpoint) {
        query = `(min-width: ${px}px) and (max-width: ${nextBreakpoint[1] - 1}px)`;
      }

      const mql = window.matchMedia(query);
      this.mediaQueryLists.set(name, mql);

      mql.addListener((e) => {
        if (e.matches) {
          this.currentBreakpoint = name;
          this.notifyListeners('breakpointChanged', { breakpoint: name });
        }
      });
    });
  }

  registerPattern(name, definition) {
    const pattern = {
      name,
      definition,
      variants: new Map(),
      responsive: false
    };

    this.patterns.set(name, pattern);
    return this;
  }

  addVariant(patternName, breakpoint, variantDef) {
    const pattern = this.patterns.get(patternName);
    if (!pattern) return false;

    pattern.variants.set(breakpoint, variantDef);
    pattern.responsive = true;
    return true;
  }

  createResponsivePattern(name, baseDefinition, variantsByBreakpoint = {}) {
    const pattern = {
      name,
      definition: baseDefinition,
      variants: new Map(Object.entries(variantsByBreakpoint)),
      responsive: Object.keys(variantsByBreakpoint).length > 0
    };

    this.patterns.set(name, pattern);
    return this;
  }

  getPatternForBreakpoint(patternName, breakpoint = null) {
    const bp = breakpoint || this.currentBreakpoint;
    const pattern = this.patterns.get(patternName);

    if (!pattern) return null;
    if (!pattern.responsive) return pattern.definition;

    const variant = pattern.variants.get(bp);
    if (variant) return variant;

    const breakpointOrder = Object.keys(this.breakpoints)
      .sort((a, b) => this.breakpoints[a] - this.breakpoints[b]);

    const bpIndex = breakpointOrder.indexOf(bp);

    for (let i = bpIndex; i >= 0; i--) {
      const fallback = pattern.variants.get(breakpointOrder[i]);
      if (fallback) return fallback;
    }

    return pattern.definition;
  }

  resolveResponsiveValue(value, breakpoint = null) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return value;
    }

    const bp = breakpoint || this.currentBreakpoint;

    if (value[bp]) return value[bp];

    const breakpointOrder = Object.keys(this.breakpoints)
      .sort((a, b) => this.breakpoints[a] - this.breakpoints[b]);

    const bpIndex = breakpointOrder.indexOf(bp);

    for (let i = bpIndex; i >= 0; i--) {
      if (value[breakpointOrder[i]]) return value[breakpointOrder[i]];
    }

    return value.xs || value.base || Object.values(value)[0];
  }

  applyResponsiveStyles(element, responsiveStylesMap) {
    Object.entries(responsiveStylesMap).forEach(([breakpoint, styles]) => {
      const mql = this.mediaQueryLists.get(breakpoint);
      if (!mql) return;

      const applyStyles = () => {
        if (mql.matches) {
          Object.assign(element.style, this.convertStylesToCSS(styles));
        }
      };

      applyStyles();
      mql.addListener(applyStyles);
    });

    return this;
  }

  convertStylesToCSS(styles) {
    const cssStyles = {};
    Object.entries(styles).forEach(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      cssStyles[key] = value;
    });
    return cssStyles;
  }

  buildResponsiveComponent(name, baseDefinition, variantsByBreakpoint = {}) {
    return {
      type: 'responsive-component',
      name,
      base: baseDefinition,
      variants: variantsByBreakpoint,
      currentBreakpoint: this.currentBreakpoint,
      getForCurrentBreakpoint: () => {
        const variant = variantsByBreakpoint[this.currentBreakpoint];
        return variant || baseDefinition;
      }
    };
  }

  createLayoutPattern(name, layouts = {}) {
    const pattern = {
      type: 'layout',
      name,
      layouts,
      currentBreakpoint: this.currentBreakpoint,
      getCurrent: () => layouts[this.currentBreakpoint] || layouts.xs || Object.values(layouts)[0]
    };

    this.patterns.set(name, pattern);
    return pattern;
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

    const pattern = {
      type: 'grid',
      name,
      configs,
      getCurrent: () => configs[this.currentBreakpoint] || configs.md,
      toCSS: (breakpoint) => {
        const config = configs[breakpoint || this.currentBreakpoint];
        return {
          display: 'grid',
          gridTemplateColumns: `repeat(${config.columns}, 1fr)`,
          gap: config.gap
        };
      }
    };

    this.patterns.set(name, pattern);
    return pattern;
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

    const pattern = {
      type: 'flex',
      name,
      configs,
      getCurrent: () => configs[this.currentBreakpoint] || configs.md,
      toCSS: (breakpoint) => {
        const config = configs[breakpoint || this.currentBreakpoint];
        return {
          display: 'flex',
          flexDirection: config.direction,
          gap: config.gap,
          flexWrap: 'wrap'
        };
      }
    };

    this.patterns.set(name, pattern);
    return pattern;
  }

  createResponsiveValue(valuesByBreakpoint) {
    return {
      xs: valuesByBreakpoint.xs || valuesByBreakpoint.base,
      sm: valuesByBreakpoint.sm || valuesByBreakpoint.xs || valuesByBreakpoint.base,
      md: valuesByBreakpoint.md || valuesByBreakpoint.sm || valuesByBreakpoint.xs || valuesByBreakpoint.base,
      lg: valuesByBreakpoint.lg || valuesByBreakpoint.md || valuesByBreakpoint.sm || valuesByBreakpoint.xs || valuesByBreakpoint.base,
      xl: valuesByBreakpoint.xl || valuesByBreakpoint.lg || valuesByBreakpoint.md || valuesByBreakpoint.sm || valuesByBreakpoint.xs || valuesByBreakpoint.base,
      xxl: valuesByBreakpoint.xxl || valuesByBreakpoint.xl || valuesByBreakpoint.lg || valuesByBreakpoint.md || valuesByBreakpoint.sm || valuesByBreakpoint.xs || valuesByBreakpoint.base,
      getCurrent: function() {
        const bp = this.currentBreakpoint || 'md';
        return this[bp];
      }
    };
  }

  buildResponsiveUI(componentDef, variantsByBreakpoint) {
    const ui = {
      type: 'box',
      className: `responsive-container`,
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

  listPatterns() {
    return Array.from(this.patterns.values()).map(p => ({
      name: p.name,
      responsive: p.responsive,
      variants: Array.from(p.variants.keys()),
      type: p.definition?.type || 'unknown'
    }));
  }

  on(event, callback) {
    this.listeners.push({ event, callback });
    return this;
  }

  off(event, callback) {
    this.listeners = this.listeners.filter(
      l => !(l.event === event && l.callback === callback)
    );
    return this;
  }

  notifyListeners(event, data) {
    this.listeners
      .filter(l => l.event === event)
      .forEach(l => {
        try {
          l.callback(data);
        } catch (e) {
          console.error(`Responsive pattern listener error for ${event}:`, e);
        }
      });
  }

  getBreakpoints() {
    return { ...this.breakpoints };
  }

  getCurrentBreakpoint() {
    return this.currentBreakpoint;
  }

  destroy() {
    this.mediaQueryLists.forEach(mql => {
      if (mql.removeListener) mql.removeListener(() => {});
    });
    this.mediaQueryLists.clear();
    this.listeners = [];
    this.patterns.clear();
  }
}

function createResponsivePatternSystem(breakpoints = {}) {
  return new ResponsivePatternSystem(breakpoints);
}

export { ResponsivePatternSystem, createResponsivePatternSystem };
