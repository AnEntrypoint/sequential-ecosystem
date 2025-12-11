// Responsive layout handling
export class LayoutResponsive {
  constructor(presets, applier) {
    this.presets = presets;
    this.applier = applier;
    this.layouts = new Map();
  }

  getResponsiveLayout(layoutName, breakpoint) {
    const layout = this.presets.getLayout(layoutName);
    if (!layout || !layout.responsive) return layout;

    const responsive = layout.responsive[breakpoint] || {};
    return { ...layout, ...responsive };
  }

  createResponsiveLayout(configs) {
    const layout = {
      type: 'responsive',
      configs: configs,
      created: Date.now()
    };

    const uniqueName = `responsive-${Date.now()}`;
    this.layouts.set(uniqueName, layout);
    return { name: uniqueName, layout };
  }

  applyResponsiveLayout(componentDef, layoutName, currentBreakpoint) {
    const layout = this.presets.getLayout(layoutName);
    if (!layout) return componentDef;

    if (layout.type === 'responsive') {
      const config = layout.configs[currentBreakpoint] || layout.configs.md;
      return this.applier.applyLayout(componentDef, config.layout);
    }

    return this.applier.applyLayout(componentDef, layoutName);
  }
}
