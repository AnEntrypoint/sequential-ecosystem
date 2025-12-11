// Responsive viewport tracking and management
export class ResponsiveViewport {
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
      }
    };
  }
}
