class ResponsiveRenderer {
  constructor() {
    this.breakpoints = {
      xs: 0,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536
    };
    this.currentBreakpoint = 'md';
    this.viewportWidth = 768;
    this.viewportHeight = 1024;
    this.orientation = 'portrait';
    this.devicePixelRatio = 1;
    this.isTouch = false;
    this.listeners = new Map();
    this.cache = new Map();
    this.mediaQueries = new Map();
  }

  init() {
    this.updateViewport();
    this.setupMediaQueries();
    this.setupEventListeners();
  }

  updateViewport() {
    if (typeof window !== 'undefined') {
      this.viewportWidth = window.innerWidth;
      this.viewportHeight = window.innerHeight;
      this.devicePixelRatio = window.devicePixelRatio || 1;
      this.isTouch = this.detectTouchDevice();
      this.orientation = this.viewportWidth > this.viewportHeight ? 'landscape' : 'portrait';
    }
    this.currentBreakpoint = this.getBreakpoint();
  }

  getBreakpoint() {
    const width = this.viewportWidth;

    if (width < this.breakpoints.sm) return 'xs';
    if (width < this.breakpoints.md) return 'sm';
    if (width < this.breakpoints.lg) return 'md';
    if (width < this.breakpoints.xl) return 'lg';
    if (width < this.breakpoints.xxl) return 'xl';
    return 'xxl';
  }

  detectTouchDevice() {
    if (typeof window === 'undefined') return false;
    return (('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0) ||
            (navigator.msMaxTouchPoints > 0));
  }

  setupMediaQueries() {
    Object.entries(this.breakpoints).forEach(([key, value]) => {
      if (typeof window !== 'undefined' && window.matchMedia) {
        const query = window.matchMedia(`(min-width: ${value}px)`);
        this.mediaQueries.set(key, query);
      }
    });
  }

  setupEventListeners() {
    if (typeof window === 'undefined') return;

    window.addEventListener('resize', () => {
      const oldBreakpoint = this.currentBreakpoint;
      this.updateViewport();

      if (oldBreakpoint !== this.currentBreakpoint) {
        this.emit('breakpoint-change', { from: oldBreakpoint, to: this.currentBreakpoint });
        this.clearCache();
      }
    });

    window.addEventListener('orientationchange', () => {
      this.updateViewport();
      this.emit('orientation-change', { orientation: this.orientation });
    });
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  emit(event, data) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(cb => {
      try {
        cb(data);
      } catch (e) {
        console.error(`Error in ${event} listener:`, e);
      }
    });
  }

  applyResponsiveStyles(componentDef, overrides = {}) {
    const breakpoint = this.currentBreakpoint;
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
    if (this.currentBreakpoint !== 'xs' && this.currentBreakpoint !== 'sm') {
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

  optimizeForTablet(componentDef) {
    if (this.currentBreakpoint !== 'md' && this.currentBreakpoint !== 'lg') {
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
    if (this.currentBreakpoint !== 'xl' && this.currentBreakpoint !== 'xxl') {
      return componentDef;
    }

    const optimized = JSON.parse(JSON.stringify(componentDef));

    if (optimized.style?.gridTemplateColumns === 'repeat(auto-fit, minmax(100%, 1fr))') {
      optimized.style.gridTemplateColumns = 'repeat(auto-fit, minmax(300px, 1fr))';
    }

    return optimized;
  }

  getResponsiveLayoutConfig(breakpoint = null) {
    const bp = breakpoint || this.currentBreakpoint;

    const configs = {
      xs: {
        columns: 1,
        gap: 6,
        padding: 8,
        fontSize: { base: 12, heading: 14 },
        touchTarget: 40,
        containerWidth: '100%'
      },
      sm: {
        columns: 1,
        gap: 8,
        padding: 10,
        fontSize: { base: 13, heading: 15 },
        touchTarget: 44,
        containerWidth: '100%'
      },
      md: {
        columns: 2,
        gap: 12,
        padding: 12,
        fontSize: { base: 14, heading: 16 },
        touchTarget: 48,
        containerWidth: '90%'
      },
      lg: {
        columns: 3,
        gap: 12,
        padding: 16,
        fontSize: { base: 14, heading: 18 },
        touchTarget: 44,
        containerWidth: '85%'
      },
      xl: {
        columns: 4,
        gap: 16,
        padding: 20,
        fontSize: { base: 15, heading: 20 },
        touchTarget: 40,
        containerWidth: '80%'
      },
      xxl: {
        columns: 5,
        gap: 20,
        padding: 24,
        fontSize: { base: 16, heading: 22 },
        touchTarget: 40,
        containerWidth: '75%'
      }
    };

    return configs[bp] || configs.md;
  }

  buildResponsivePreview(componentDef) {
    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px',
        background: '#1e1e1e',
        borderRadius: '6px'
      },
      children: [
        {
          type: 'heading',
          content: '📱 Responsive Preview',
          level: 3,
          style: {
            margin: 0,
            fontSize: '12px',
            color: '#e0e0e0',
            textTransform: 'uppercase'
          }
        },
        this.buildViewportSelector(),
        this.buildResponsiveViewer(componentDef),
        this.buildBreakpointInfo()
      ]
    };
  }

  buildViewportSelector() {
    const viewports = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 13', width: 390, height: 844 },
      { name: 'iPad', width: 768, height: 1024 },
      { name: 'iPad Pro', width: 1024, height: 1366 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];

    return {
      type: 'box',
      style: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        marginBottom: '8px'
      },
      children: viewports.map(vp => ({
        type: 'box',
        style: {
          padding: '6px 12px',
          background: '#2d2d30',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '10px',
          color: this.viewportWidth === vp.width ? '#667eea' : '#858585',
          border: this.viewportWidth === vp.width ? '1px solid #667eea' : '1px solid #3e3e42'
        },
        children: [{
          type: 'paragraph',
          content: `${vp.name} (${vp.width}x${vp.height})`,
          style: { margin: 0 }
        }]
      }))
    };
  }

  buildResponsiveViewer(componentDef) {
    const optimized = this.optimizeForMobile(componentDef);

    return {
      type: 'box',
      style: {
        padding: '12px',
        background: '#2d2d30',
        borderRadius: '4px',
        border: '1px solid #3e3e42',
        maxHeight: '400px',
        overflow: 'auto',
        fontSize: '11px'
      },
      children: [
        optimized
      ]
    };
  }

  buildBreakpointInfo() {
    const config = this.getResponsiveLayoutConfig();

    return {
      type: 'box',
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px'
      },
      children: [
        {
          type: 'box',
          style: {
            padding: '8px 12px',
            background: '#2d2d30',
            borderRadius: '4px'
          },
          children: [
            {
              type: 'paragraph',
              content: 'Breakpoint',
              style: {
                margin: 0,
                fontSize: '9px',
                color: '#858585'
              }
            },
            {
              type: 'heading',
              content: this.currentBreakpoint.toUpperCase(),
              level: 4,
              style: {
                margin: '4px 0 0 0',
                fontSize: '12px',
                color: '#667eea'
              }
            }
          ]
        },
        {
          type: 'box',
          style: {
            padding: '8px 12px',
            background: '#2d2d30',
            borderRadius: '4px'
          },
          children: [
            {
              type: 'paragraph',
              content: 'Viewport',
              style: {
                margin: 0,
                fontSize: '9px',
                color: '#858585'
              }
            },
            {
              type: 'heading',
              content: `${this.viewportWidth}x${this.viewportHeight}`,
              level: 4,
              style: {
                margin: '4px 0 0 0',
                fontSize: '11px',
                color: '#d4d4d4'
              }
            }
          ]
        },
        {
          type: 'box',
          style: {
            padding: '8px 12px',
            background: '#2d2d30',
            borderRadius: '4px'
          },
          children: [
            {
              type: 'paragraph',
              content: 'Columns',
              style: {
                margin: 0,
                fontSize: '9px',
                color: '#858585'
              }
            },
            {
              type: 'heading',
              content: config.columns.toString(),
              level: 4,
              style: {
                margin: '4px 0 0 0',
                fontSize: '12px',
                color: '#4ade80'
              }
            }
          ]
        }
      ]
    };
  }

  generateResponsiveCSSQuery(componentDef) {
    const queries = [];

    Object.entries(this.breakpoints).forEach(([bp, width]) => {
      const config = this.getResponsiveLayoutConfig(bp);
      queries.push({
        breakpoint: bp,
        minWidth: width,
        config
      });
    });

    return queries;
  }

  clearCache() {
    this.cache.clear();
  }

  exportResponsiveConfig() {
    return {
      breakpoints: this.breakpoints,
      currentBreakpoint: this.currentBreakpoint,
      viewport: {
        width: this.viewportWidth,
        height: this.viewportHeight,
        devicePixelRatio: this.devicePixelRatio,
        orientation: this.orientation,
        isTouch: this.isTouch
      },
      layoutConfigs: Object.fromEntries(
        Object.keys(this.breakpoints).map(bp => [
          bp,
          this.getResponsiveLayoutConfig(bp)
        ])
      )
    };
  }
}

function createResponsiveRenderer() {
  return new ResponsiveRenderer();
}

export { ResponsiveRenderer, createResponsiveRenderer };
