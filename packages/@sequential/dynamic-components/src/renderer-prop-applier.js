// Property and style application
export class RendererPropApplier {
  applyCommonProps(el, def) {
    if (def.id) el.id = def.id;
    if (def.className) el.className = def.className;
    if (def.dataAttributes) {
      Object.entries(def.dataAttributes).forEach(([key, value]) => {
        el.setAttribute(`data-${key}`, String(value));
      });
    }
    this.applyStyles(el, def.style);
    this.applyAttributes(el, def.attributes);
  }

  applyStyles(el, styles) {
    if (!styles || typeof styles !== 'object') return;

    Object.entries(styles).forEach(([key, value]) => {
      const cssKey = this.toCSSProperty(key);
      try {
        el.style.setProperty(cssKey, String(value));
      } catch (e) {
        // Style error, continue
      }
    });
  }

  applyAttributes(el, attrs) {
    if (!attrs || typeof attrs !== 'object') return;

    Object.entries(attrs).forEach(([key, value]) => {
      if (key.startsWith('aria-') || key.startsWith('data-')) {
        el.setAttribute(key, String(value));
      } else if (typeof value === 'boolean') {
        if (value) el.setAttribute(key, '');
      } else {
        el.setAttribute(key, String(value));
      }
    });
  }

  applyEventListeners(el, def) {
    const events = ['click', 'change', 'input', 'blur', 'focus', 'submit'];
    events.forEach(event => {
      const handler = def[`on${event.charAt(0).toUpperCase() + event.slice(1)}`];
      if (handler && typeof handler === 'function') {
        el.addEventListener(event, handler);
      }
    });
  }

  toCSSProperty(jsName) {
    return jsName.replace(/([A-Z])/g, '-$1').toLowerCase();
  }
}
