class ResponsiveBuilder {
  constructor(responsivePatternSystem) {
    this.rps = responsivePatternSystem;
    this.componentDefinitions = new Map();
    this.breakpointOverrides = new Map();
    this.presets = this.initializePresets();
  }

  initializePresets() {
    return {
      mobileFirst: {
        xs: { display: 'block', width: '100%' },
        md: { display: 'block', width: '100%' },
        lg: { display: 'flex', width: '100%' }
      },
      desktopFirst: {
        xs: { display: 'none' },
        lg: { display: 'block', width: '100%' }
      },
      hideOnMobile: {
        xs: { display: 'none' },
        md: { display: 'block' }
      },
      showOnMobile: {
        xs: { display: 'block' },
        md: { display: 'none' }
      },
      singleColumnOnMobile: {
        xs: { gridTemplateColumns: '1fr' },
        md: { gridTemplateColumns: 'repeat(2, 1fr)' },
        lg: { gridTemplateColumns: 'repeat(3, 1fr)' }
      },
      adaptiveGap: {
        xs: { gap: '8px' },
        sm: { gap: '12px' },
        md: { gap: '16px' },
        lg: { gap: '20px' },
        xl: { gap: '24px' }
      },
      adaptiveTextSize: {
        xs: { fontSize: '12px' },
        sm: { fontSize: '14px' },
        md: { fontSize: '16px' },
        lg: { fontSize: '18px' },
        xl: { fontSize: '20px' }
      },
      adaptivePadding: {
        xs: { padding: '8px' },
        sm: { padding: '12px' },
        md: { padding: '16px' },
        lg: { padding: '20px' },
        xl: { padding: '24px' }
      }
    };
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
    const preset = this.presets[presetName];
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

  buildResponsiveStack(componentName, stackConfig = {}) {
    const defaultConfig = {
      xs: { direction: 'column', gap: '8px' },
      sm: { direction: 'column', gap: '12px' },
      md: { direction: 'row', gap: '16px' },
      lg: { direction: 'row', gap: '20px' }
    };

    const config = { ...defaultConfig, ...stackConfig };
    const component = this.componentDefinitions.get(componentName);
    if (!component) return null;

    const container = {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: config.xs.direction,
        gap: config.xs.gap
      },
      children: [component.base]
    };

    return container;
  }

  buildBreakpointPreview() {
    const breakpoints = this.rps.getBreakpoints();
    const current = this.rps.getCurrentBreakpoint();

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '16px',
        backgroundColor: '#f5f5f5',
        borderRadius: '6px'
      },
      children: [
        {
          type: 'heading',
          content: `Current Breakpoint: ${current}`,
          level: 4,
          style: { margin: 0, fontSize: '14px', fontWeight: 600 }
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          },
          children: Object.entries(breakpoints).map(([name, px]) => ({
            type: 'box',
            style: {
              padding: '6px 12px',
              backgroundColor: current === name ? '#667eea' : '#ddd',
              color: current === name ? '#fff' : '#333',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: current === name ? 600 : 400
            },
            children: [{
              type: 'text',
              content: `${name} (${px}px)`
            }]
          }))
        }
      ]
    };
  }

  buildBreakpointEditor(componentName) {
    const component = this.componentDefinitions.get(componentName);
    if (!component) return null;

    const breakpoints = this.rps.getBreakpoints();

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '16px',
        backgroundColor: '#f9f9f9',
        borderRadius: '6px'
      },
      children: [
        {
          type: 'heading',
          content: `Edit ${componentName}`,
          level: 4,
          style: { margin: 0, fontSize: '14px', fontWeight: 600 }
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          },
          children: Object.keys(breakpoints).map(bp => ({
            type: 'box',
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              padding: '12px',
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '4px'
            },
            children: [
              {
                type: 'heading',
                content: `${bp.toUpperCase()} (${breakpoints[bp]}px)`,
                level: 5,
                style: { margin: 0, fontSize: '12px', fontWeight: 600 }
              },
              {
                type: 'box',
                style: {
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr',
                  gap: '8px',
                  fontSize: '12px'
                },
                children: [
                  { type: 'text', content: 'Property:', style: { fontWeight: 500 } },
                  { type: 'input', value: 'style.property', placeholder: 'e.g., padding', style: { padding: '4px 8px' } },
                  { type: 'text', content: 'Value:', style: { fontWeight: 500 } },
                  { type: 'input', value: '', placeholder: 'e.g., 16px', style: { padding: '4px 8px' } }
                ]
              }
            ]
          }))
        }
      ]
    };
  }

  buildResponsivePreview(componentName) {
    const component = this.componentDefinitions.get(componentName);
    if (!component) return null;

    const breakpoints = this.rps.getBreakpoints();
    const breakpointNames = Object.keys(breakpoints).sort(
      (a, b) => breakpoints[a] - breakpoints[b]
    );

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      },
      children: breakpointNames.map(bp => ({
        type: 'box',
        style: {
          border: '1px solid #ddd',
          borderRadius: '4px',
          padding: '12px',
          backgroundColor: '#f9f9f9'
        },
        children: [
          {
            type: 'heading',
            content: `${bp} (${breakpoints[bp]}px)`,
            level: 5,
            style: {
              margin: '0 0 8px 0',
              fontSize: '12px',
              fontWeight: 600,
              color: '#666'
            }
          },
          {
            type: 'box',
            style: {
              ...this.buildComponentForBreakpoint(componentName, bp)?.style,
              border: '1px dashed #ccc',
              padding: '16px',
              backgroundColor: '#fff',
              borderRadius: '4px',
              minHeight: '100px'
            },
            children: [this.buildComponentForBreakpoint(componentName, bp)]
          }
        ]
      }))
    };
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

  exportResponsiveCSS(componentName) {
    const component = this.componentDefinitions.get(componentName);
    if (!component) return '';

    const breakpoints = this.rps.getBreakpoints();
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

  listComponents() {
    return Array.from(this.componentDefinitions.keys());
  }

  getComponentDefinition(componentName) {
    const component = this.componentDefinitions.get(componentName);
    return component ? component.base : null;
  }
}

function createResponsiveBuilder(responsivePatternSystem) {
  return new ResponsiveBuilder(responsivePatternSystem);
}

export { ResponsiveBuilder, createResponsiveBuilder };
