export class CompositionUI {
  constructor(core) {
    this.core = core;
  }

  buildCompositionUI() {
    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px',
        backgroundColor: '#f9fafb',
        borderRadius: '6px'
      },
      children: [
        this.buildLayoutSelector(),
        this.buildPatternList(),
        this.buildLayoutControls()
      ]
    };
  }

  buildLayoutSelector() {
    const layouts = ['grid', 'flex', 'stack', 'carousel'];

    return {
      type: 'box',
      style: { display: 'flex', flexDirection: 'column', gap: '8px' },
      children: [
        {
          type: 'heading',
          content: 'Layout',
          level: 4,
          style: { margin: 0, fontSize: '12px', fontWeight: 600 }
        },
        {
          type: 'box',
          style: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
          children: layouts.map(layout => ({
            type: 'button',
            content: layout.charAt(0).toUpperCase() + layout.slice(1),
            style: {
              padding: '6px 12px',
              backgroundColor: this.core.layoutMode === layout ? '#667eea' : '#e5e7eb',
              color: this.core.layoutMode === layout ? '#fff' : '#374151',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: this.core.layoutMode === layout ? 600 : 400
            },
            onClick: () => this.core.setLayoutMode(layout)
          }))
        }
      ]
    };
  }

  buildPatternList() {
    return {
      type: 'box',
      style: { display: 'flex', flexDirection: 'column', gap: '8px' },
      children: [
        {
          type: 'heading',
          content: `Patterns (${this.core.selectedPatterns.length})`,
          level: 4,
          style: { margin: 0, fontSize: '12px', fontWeight: 600 }
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            maxHeight: '200px',
            overflow: 'auto'
          },
          children: this.core.selectedPatterns.length === 0
            ? [{
              type: 'paragraph',
              content: 'No patterns added',
              style: { margin: 0, fontSize: '11px', color: '#6b7280' }
            }]
            : this.core.selectedPatterns.map((pattern, idx) => ({
              type: 'box',
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px',
                backgroundColor: '#fff',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '12px'
              },
              children: [
                {
                  type: 'paragraph',
                  content: `${idx + 1}. ${pattern.id}`,
                  style: { margin: 0, flex: 1 }
                },
                {
                  type: 'box',
                  style: { display: 'flex', gap: '4px' },
                  children: [
                    idx > 0 ? {
                      type: 'button',
                      content: '↑',
                      style: {
                        padding: '2px 6px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px'
                      },
                      onClick: () => this.core.reorderPatterns(idx, idx - 1)
                    } : null,
                    idx < this.core.selectedPatterns.length - 1 ? {
                      type: 'button',
                      content: '↓',
                      style: {
                        padding: '2px 6px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px'
                      },
                      onClick: () => this.core.reorderPatterns(idx, idx + 1)
                    } : null,
                    {
                      type: 'button',
                      content: '×',
                      style: {
                        padding: '2px 6px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: '#ef4444'
                      },
                      onClick: () => this.core.removePattern(pattern.id)
                    }
                  ].filter(Boolean)
                }
              ]
            }))
        }
      ]
    };
  }

  buildLayoutControls() {
    return {
      type: 'box',
      style: { display: 'flex', flexDirection: 'column', gap: '8px' },
      children: [
        {
          type: 'heading',
          content: 'Layout Settings',
          level: 4,
          style: { margin: 0, fontSize: '12px', fontWeight: 600 }
        },
        this.core.layoutMode === 'grid'
          ? this.buildGridControls()
          : this.buildFlexControls()
      ]
    };
  }

  buildGridControls() {
    return {
      type: 'box',
      style: { display: 'flex', flexDirection: 'column', gap: '6px' },
      children: [
        {
          type: 'box',
          style: { display: 'flex', gap: '8px', alignItems: 'center' },
          children: [
            { type: 'paragraph', content: 'Columns:', style: { margin: 0, fontSize: '11px', flex: '0 0 70px' } },
            { type: 'input', value: this.core.gridConfig.columns, style: { padding: '4px 8px', fontSize: '11px', flex: 1 } }
          ]
        },
        {
          type: 'box',
          style: { display: 'flex', gap: '8px', alignItems: 'center' },
          children: [
            { type: 'paragraph', content: 'Gap:', style: { margin: 0, fontSize: '11px', flex: '0 0 70px' } },
            { type: 'input', value: this.core.gridConfig.gap, style: { padding: '4px 8px', fontSize: '11px', flex: 1 } }
          ]
        }
      ]
    };
  }

  buildFlexControls() {
    return {
      type: 'box',
      style: { display: 'flex', flexDirection: 'column', gap: '6px' },
      children: [
        {
          type: 'box',
          style: { display: 'flex', gap: '8px', alignItems: 'center' },
          children: [
            { type: 'paragraph', content: 'Direction:', style: { margin: 0, fontSize: '11px', flex: '0 0 70px' } },
            {
              type: 'select',
              options: ['row', 'column'],
              value: this.core.layoutConfig.direction,
              style: { padding: '4px 8px', fontSize: '11px', flex: 1 }
            }
          ]
        },
        {
          type: 'box',
          style: { display: 'flex', gap: '8px', alignItems: 'center' },
          children: [
            { type: 'paragraph', content: 'Gap:', style: { margin: 0, fontSize: '11px', flex: '0 0 70px' } },
            { type: 'input', value: this.core.layoutConfig.gap, style: { padding: '4px 8px', fontSize: '11px', flex: 1 } }
          ]
        }
      ]
    };
  }
}
