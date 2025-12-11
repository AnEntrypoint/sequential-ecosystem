// Component and layout builder with template builtins
export class ComponentBuilder {
  constructor(registry) {
    this.registry = registry;
  }

  createLayout(type, props = {}, children = []) {
    const layouts = {
      flex: (p, c) => `<div style={{display: 'flex', flexDirection: '${p.direction || 'row'}', gap: '${p.gap || '12px'}', alignItems: '${p.align || 'stretch'}'}}>${c.join('')}</div>`,
      grid: (p, c) => `<div style={{display: 'grid', gridTemplateColumns: '${p.cols || '1fr'}', gap: '${p.gap || '16px'}'}}>${c.join('')}</div>`,
      stack: (p, c) => `<div style={{display: 'flex', flexDirection: 'column', gap: '${p.gap || '12px'}'}}>${c.join('')}</div>`,
      section: (p, c) => `<section style={{padding: '${p.padding || '16px'}', borderRadius: '${p.radius || '8px'}', border: '1px solid #e0e0e0'}}>${c.join('')}</section>`,
    };

    const layout = layouts[type];
    if (!layout) {
      throw new Error(`Unknown layout type: ${type}`);
    }

    return layout(props, children);
  }

  createComponent(type, props = {}) {
    const components = {
      heading: (p) => `<h${p.level || 1} style={{margin: 0}}>${p.content}</h${p.level || 1}>`,
      paragraph: (p) => `<p style={{margin: 0}}>${p.content}</p>`,
      button: (p) => `<button style={{padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer'}}>${p.label || 'Button'}</button>`,
      input: (p) => `<input type="${p.type || 'text'}" placeholder="${p.placeholder || ''}" style={{padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px'}}/>`,
      card: (p) => `<div style={{border: '1px solid #ddd', borderRadius: '8px', padding: '16px'}}>${p.content || ''}</div>`,
      text: (p) => `<span>${p.content || ''}</span>`,
    };

    const component = components[type];
    if (!component) {
      throw new Error(`Unknown component type: ${type}`);
    }

    return component(props);
  }

  registerBuiltins() {
    const builtins = {
      'layout-flex': '<div style={{display: "flex", gap: "12px"}}>...</div>',
      'layout-grid': '<div style={{display: "grid", gap: "16px"}}>...</div>',
      'text-heading': '<h2>Heading</h2>',
      'text-paragraph': '<p>Paragraph text</p>',
      'form-button': '<button style={{padding: "8px 16px"}}>Button</button>',
      'form-input': '<input type="text" placeholder="Enter text" style={{padding: "8px 12px"}}/>',
      'card-basic': '<div style={{border: "1px solid #ddd", borderRadius: "8px", padding: "16px"}}>Card content</div>',
    };

    Object.entries(builtins).forEach(([name, code]) => {
      this.registry.register(name, code, {
        category: 'builtins',
        description: `Built-in ${name} component`
      });
    });
  }
}
