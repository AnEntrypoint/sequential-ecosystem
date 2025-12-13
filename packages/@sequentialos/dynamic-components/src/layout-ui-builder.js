// Layout UI building and visualization
export class LayoutUIBuilder {
  constructor(presets, applier) {
    this.presets = presets;
    this.applier = applier;
  }

  buildLayoutPreview(layoutName) {
    const layout = this.presets.getLayout(layoutName);
    if (!layout) return null;

    const items = [
      { id: '1', content: 'Item 1' },
      { id: '2', content: 'Item 2' },
      { id: '3', content: 'Item 3' }
    ];

    const style = this.applier.getLayoutStyle(layout);

    return {
      type: 'box',
      style: {
        ...style,
        minHeight: '300px',
        background: '#2d2d30',
        borderRadius: '6px',
        border: '1px solid #3e3e42',
        padding: '12px'
      },
      children: items.map(item => ({
        type: 'box',
        style: {
          background: '#667eea',
          padding: '16px',
          borderRadius: '4px',
          color: '#fff',
          textAlign: 'center',
          minWidth: layout.type === 'flex' ? '80px' : 'auto'
        },
        children: [{
          type: 'paragraph',
          content: item.content,
          style: { margin: 0 }
        }]
      }))
    };
  }

  buildLayoutSelector() {
    const layouts = Array.from(this.presets.presets.keys());

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '12px',
        background: '#1e1e1e',
        borderRadius: '6px'
      },
      children: [
        {
          type: 'heading',
          content: '📐 Layouts',
          level: 3,
          style: { margin: 0, fontSize: '12px', color: '#e0e0e0' }
        },
        {
          type: 'box',
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px'
          },
          children: layouts.map(name => ({
            type: 'box',
            style: {
              padding: '8px 12px',
              background: '#2d2d30',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '10px',
              color: '#d4d4d4',
              border: '1px solid #3e3e42'
            },
            children: [{
              type: 'paragraph',
              content: name,
              style: { margin: 0, wordBreak: 'break-word' }
            }]
          }))
        }
      ]
    };
  }

  exportLayouts() {
    return {
      layouts: this.presets.getAllLayouts(),
      exportedAt: new Date().toISOString()
    };
  }
}
