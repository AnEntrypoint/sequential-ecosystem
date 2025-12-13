// Pattern registration and retrieval
export class ResponsivePatternRegistry {
  constructor(breakpoints) {
    this.patterns = new Map();
    this.breakpoints = breakpoints;
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
    const pattern = this.patterns.get(patternName);
    if (!pattern) return null;
    if (!pattern.responsive) return pattern.definition;

    const variant = pattern.variants.get(breakpoint);
    if (variant) return variant;

    const breakpointOrder = Object.keys(this.breakpoints)
      .sort((a, b) => this.breakpoints[a] - this.breakpoints[b]);
    const bpIndex = breakpointOrder.indexOf(breakpoint);

    for (let i = bpIndex; i >= 0; i--) {
      const fallback = pattern.variants.get(breakpointOrder[i]);
      if (fallback) return fallback;
    }
    return pattern.definition;
  }

  resolveResponsiveValue(value, breakpoint = null) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return value;

    if (value[breakpoint]) return value[breakpoint];

    const breakpointOrder = Object.keys(this.breakpoints)
      .sort((a, b) => this.breakpoints[a] - this.breakpoints[b]);
    const bpIndex = breakpointOrder.indexOf(breakpoint);

    for (let i = bpIndex; i >= 0; i--) {
      if (value[breakpointOrder[i]]) return value[breakpointOrder[i]];
    }
    return value.xs || value.base || Object.values(value)[0];
  }

  listPatterns() {
    return Array.from(this.patterns.values()).map(p => ({
      name: p.name,
      responsive: p.responsive,
      variants: Array.from(p.variants.keys()),
      type: p.definition?.type || 'unknown'
    }));
  }

  destroy() {
    this.patterns.clear();
  }
}
