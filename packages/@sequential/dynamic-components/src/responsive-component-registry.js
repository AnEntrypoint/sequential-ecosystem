// Responsive component registration and management
import { ResponsivePresets } from './responsive-presets.js';

export class ResponsiveComponentRegistry {
  constructor() {
    this.componentDefinitions = new Map();
    this.breakpointOverrides = new Map();
  }

  registerComponent(name, baseDefinition) {
    this.componentDefinitions.set(name, {
      base: baseDefinition,
      overrides: new Map()
    });
    return this;
  }

  setBreakpointOverride(componentName, breakpoint, overrideDef) {
    const component = this.componentDefinitions.get(componentName);
    if (!component) return false;

    component.overrides.set(breakpoint, overrideDef);
    return true;
  }

  applyPreset(componentName, presetName, breakpoint = null) {
    const preset = ResponsivePresets.getPreset(presetName);
    if (!preset) return false;

    const component = this.componentDefinitions.get(componentName);
    if (!component) return false;

    if (breakpoint) {
      component.overrides.set(breakpoint, preset[breakpoint]);
    } else {
      Object.entries(preset).forEach(([bp, style]) => {
        component.overrides.set(bp, style);
      });
    }

    return true;
  }

  buildComponentForBreakpoint(componentName, breakpoint) {
    const component = this.componentDefinitions.get(componentName);
    if (!component) return null;

    const def = JSON.parse(JSON.stringify(component.base));
    const override = component.overrides.get(breakpoint);

    if (override) {
      def.style = { ...def.style, ...override };
    }

    return def;
  }

  createResponsiveComponent(name, definition, breakpointVariants = {}) {
    const component = {
      name,
      base: definition,
      variants: breakpointVariants,
      getForBreakpoint: (bp) => {
        return breakpointVariants[bp] || definition;
      },
      getAllVariants: () => ({
        base: definition,
        ...breakpointVariants
      })
    };

    this.componentDefinitions.set(name, component);
    return component;
  }

  listComponents() {
    return Array.from(this.componentDefinitions.keys());
  }

  getComponentDefinition(componentName) {
    const component = this.componentDefinitions.get(componentName);
    return component ? component.base : null;
  }

  exportResponsiveCSS(componentName, breakpoints) {
    const component = this.componentDefinitions.get(componentName);
    if (!component) return '';

    let css = '';

    Object.entries(breakpoints).forEach(([bp, px]) => {
      const def = this.buildComponentForBreakpoint(componentName, bp);
      if (!def || !def.style) return;

      css += `@media (min-width: ${px}px) {\n`;
      css += `  .${componentName}--${bp} {\n`;

      Object.entries(def.style).forEach(([key, value]) => {
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        css += `    ${cssKey}: ${value};\n`;
      });

      css += '  }\n}\n\n';
    });

    return css;
  }
}
