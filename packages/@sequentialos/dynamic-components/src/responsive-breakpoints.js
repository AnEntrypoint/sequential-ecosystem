// Breakpoint detection and media query management
export class ResponsiveBreakpoints {
  constructor(breakpoints = {}) {
    this.breakpoints = {
      xs: 320, sm: 640, md: 768, lg: 1024, xl: 1280, xxl: 1536, ...breakpoints
    };
    this.currentBreakpoint = this.detectBreakpoint();
    this.mediaQueryLists = new Map();
    this.listeners = [];
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
    const breakpointArray = Object.entries(this.breakpoints).sort((a, b) => a[1] - b[1]);
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

  on(event, callback) {
    this.listeners.push({ event, callback });
    return this;
  }

  off(event, callback) {
    this.listeners = this.listeners.filter(l => !(l.event === event && l.callback === callback));
    return this;
  }

  notifyListeners(event, data) {
    this.listeners.filter(l => l.event === event).forEach(l => {
      try { l.callback(data); } catch (e) {
        console.error(`Responsive breakpoint listener error for ${event}:`, e);
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
  }
}
