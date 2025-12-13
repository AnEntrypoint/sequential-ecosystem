// Component preview rendering
export class ComponentPreviewRenderer {
  constructor(registry, rootElement, { AppRenderer, renderJSX } = {}) {
    this.registry = registry;
    this.rootElement = typeof rootElement === 'string'
      ? document.querySelector(rootElement)
      : rootElement;
    this.AppRenderer = AppRenderer;
    this.renderJSX = renderJSX;
    this.renderer = AppRenderer ? new AppRenderer(registry, rootElement) : null;
    this.currentComponent = null;
  }

  previewComponent(component) {
    try {
      this.currentComponent = component;
      const jsx = this.buildComponentJSX(component);
      if (this.renderJSX && this.rootElement && window.ReactDOM) {
        const result = this.renderJSX(jsx, component.props, { React: window.React });
        const root = window.ReactDOM.createRoot(this.rootElement);
        root.render(result);
      }
    } catch (err) {
      this.renderPreviewError(err);
    }
  }

  previewTree(tree) {
    try {
      const roots = tree.getRoots();
      const jsx = roots.map(root => this.buildComponentJSX(root)).join('\n');
      const wrappedJSX = `<div style={{padding: '16px'}}>\n${jsx}\n</div>`;
      if (this.renderJSX && this.rootElement && window.ReactDOM) {
        const result = this.renderJSX(wrappedJSX, {}, { React: window.React });
        const root = window.ReactDOM.createRoot(this.rootElement);
        root.render(result);
      }
    } catch (err) {
      this.renderPreviewError(err);
    }
  }

  buildComponentJSX(component) {
    const propsStr = Object.entries(component.props)
      .map(([k, v]) => {
        if (typeof v === 'string') {
          return `${k}="${v}"`;
        } else {
          return `${k}={${JSON.stringify(v)}}`;
        }
      })
      .join(' ');

    if (!component.children || component.children.length === 0) {
      return `<${component.type} ${propsStr} />`;
    }

    return `<${component.type} ${propsStr}>...</${component.type}>`;
  }

  renderPreviewError(err) {
    if (!this.rootElement) return;
    this.rootElement.innerHTML = `
      <div style="background: #fee2e2; border: 1px solid #fecaca; borderRadius: 6px; padding: 12px; color: #dc2626;">
        <div style="fontWeight: 600; marginBottom: 4px; fontSize: 12px;">Preview Error</div>
        <div style="fontSize: 12px; fontFamily: monospace; whiteSpace: pre-wrap;">${err.message}</div>
      </div>
    `;
  }

  clear() {
    if (this.rootElement) {
      this.rootElement.innerHTML = '';
    }
    this.currentComponent = null;
  }
}
