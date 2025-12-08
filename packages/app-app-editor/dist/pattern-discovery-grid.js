class PatternDiscoveryGrid {
  constructor() {
    this.discovery = null;
    this.isOpen = false;
    this.viewMode = 'grid';
    this.selectedPattern = null;
    this.filters = {
      category: 'all',
      codeReduction: '0',
      searchQuery: ''
    };
    this.onPatternSelect = null;
  }

  init(discovery, onPatternSelect) {
    this.discovery = discovery;
    this.onPatternSelect = onPatternSelect;
  }

  buildUI() {
    return {
      type: 'box',
      style: {
        position: 'fixed',
        inset: 0,
        background: this.isOpen ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)',
        zIndex: 1004,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: this.isOpen ? 'auto' : 'none',
        opacity: this.isOpen ? 1 : 0,
        transition: 'all 0.2s'
      },
      children: [
        {
          type: 'box',
          style: {
            background: '#252526',
            borderRadius: '8px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
            width: '95%',
            maxWidth: '1400px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid #3e3e42'
          },
          children: [
            this.buildHeader(),
            this.buildControls(),
            this.buildContent()
          ]
        }
      ]
    };
  }

  buildHeader() {
    return {
      type: 'flex',
      style: {
        padding: '16px 20px',
        borderBottom: '1px solid #3e3e42',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#1e1e1e'
      },
      children: [
        {
          type: 'heading',
          content: '🎨 Pattern Grid Browser',
          level: 2,
          style: {
            margin: 0,
            fontSize: '18px',
            color: '#e0e0e0'
          }
        },
        {
          type: 'button',
          label: '✕',
          style: {
            background: 'transparent',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            color: '#999'
          },
          onClick: () => this.close()
        }
      ]
    };
  }

  buildControls() {
    const patterns = this.discovery?.getAllPatterns?.() || [];
    const categories = new Set();
    patterns.forEach(p => {
      if (p.category) categories.add(p.category);
    });

    return {
      type: 'box',
      style: {
        padding: '12px 20px',
        borderBottom: '1px solid #3e3e42',
        background: '#1e1e1e',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        flexWrap: 'wrap'
      },
      children: [
        {
          type: 'input',
          placeholder: 'Search patterns...',
          style: {
            padding: '6px 12px',
            background: '#3e3e42',
            border: '1px solid #555',
            borderRadius: '3px',
            color: '#d4d4d4',
            fontSize: '12px',
            minWidth: '200px'
          },
          id: 'gridSearchInput',
          onInput: (e) => this.filters.searchQuery = e.target.value
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            gap: '6px'
          },
          children: [
            {
              type: 'button',
              label: this.viewMode === 'grid' ? '⊞ Grid' : '⊞ Grid',
              style: {
                padding: '6px 12px',
                background: this.viewMode === 'grid' ? '#0e639c' : '#3e3e42',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 600
              },
              onClick: () => this.viewMode = 'grid'
            },
            {
              type: 'button',
              label: this.viewMode === 'list' ? '≡ List' : '≡ List',
              style: {
                padding: '6px 12px',
                background: this.viewMode === 'list' ? '#0e639c' : '#3e3e42',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 600
              },
              onClick: () => this.viewMode = 'list'
            }
          ]
        }
      ]
    };
  }

  buildContent() {
    const patterns = this.getFilteredPatterns();

    return {
      type: 'box',
      style: {
        flex: 1,
        overflow: 'y',
        padding: '16px',
        background: '#1e1e1e'
      },
      children: this.viewMode === 'grid'
        ? [this.buildGridView(patterns)]
        : [this.buildListView(patterns)]
    };
  }

  buildGridView(patterns) {
    const cols = 4;
    const items = [];

    for (let i = 0; i < patterns.length; i += cols) {
      const row = patterns.slice(i, i + cols);
      items.push({
        type: 'flex',
        style: {
          gap: '12px',
          marginBottom: '12px'
        },
        children: row.map(p => ({
          type: 'box',
          style: {
            flex: 1,
            background: '#2d2d30',
            border: this.selectedPattern?.id === p.id ? '2px solid #0e639c' : '1px solid #3e3e42',
            borderRadius: '6px',
            padding: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          },
          children: [
            {
              type: 'paragraph',
              content: p.icon || '◆',
              style: {
                margin: 0,
                fontSize: '32px',
                textAlign: 'center',
                marginBottom: '8px'
              }
            },
            {
              type: 'paragraph',
              content: p.name,
              style: {
                margin: 0,
                fontSize: '12px',
                fontWeight: 600,
                color: '#e0e0e0',
                textAlign: 'center',
                marginBottom: '4px'
              }
            },
            {
              type: 'paragraph',
              content: p.category,
              style: {
                margin: 0,
                fontSize: '10px',
                color: '#858585',
                textAlign: 'center',
                marginBottom: '8px'
              }
            },
            {
              type: 'paragraph',
              content: p.codeReduction,
              style: {
                margin: 0,
                fontSize: '10px',
                color: '#28a745',
                textAlign: 'center',
                fontWeight: 600,
                marginBottom: '8px'
              }
            },
            {
              type: 'button',
              label: '+ Insert',
              style: {
                width: '100%',
                padding: '6px 8px',
                background: '#0e639c',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 600
              },
              onClick: () => {
                if (this.onPatternSelect) {
                  this.onPatternSelect(p);
                }
                this.close();
              }
            }
          ],
          onClick: () => this.selectedPattern = p
        }))
      });
    }

    return {
      type: 'box',
      children: items
    };
  }

  buildListView(patterns) {
    return {
      type: 'box',
      children: patterns.map(p => ({
        type: 'box',
        style: {
          background: this.selectedPattern?.id === p.id ? '#0e639c' : '#2d2d30',
          border: this.selectedPattern?.id === p.id ? '2px solid #0e639c' : '1px solid #3e3e42',
          borderRadius: '4px',
          padding: '12px',
          marginBottom: '8px',
          cursor: 'pointer',
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        },
        children: [
          {
            type: 'paragraph',
            content: p.icon || '◆',
            style: {
              margin: 0,
              fontSize: '24px',
              minWidth: '40px'
            }
          },
          {
            type: 'box',
            style: { flex: 1 },
            children: [
              {
                type: 'paragraph',
                content: p.name,
                style: {
                  margin: 0,
                  fontSize: '13px',
                  fontWeight: 600,
                  color: this.selectedPattern?.id === p.id ? '#fff' : '#e0e0e0'
                }
              },
              {
                type: 'paragraph',
                content: p.description,
                style: {
                  margin: '4px 0 0 0',
                  fontSize: '11px',
                  color: this.selectedPattern?.id === p.id ? '#ccc' : '#858585'
                }
              }
            ]
          },
          {
            type: 'box',
            style: { display: 'flex', gap: '8px', alignItems: 'center' },
            children: [
              {
                type: 'paragraph',
                content: p.codeReduction,
                style: {
                  margin: 0,
                  fontSize: '11px',
                  color: '#28a745',
                  fontWeight: 600,
                  minWidth: '40px',
                  textAlign: 'right'
                }
              },
              {
                type: 'button',
                label: '+ Insert',
                style: {
                  padding: '6px 12px',
                  background: '#0e639c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 600
                },
                onClick: () => {
                  if (this.onPatternSelect) {
                    this.onPatternSelect(p);
                  }
                  this.close();
                }
              }
            ]
          }
        ],
        onClick: () => this.selectedPattern = p
      }))
    };
  }

  getFilteredPatterns() {
    let patterns = this.discovery?.getAllPatterns?.() || [];

    if (this.filters.category !== 'all') {
      patterns = patterns.filter(p => p.category === this.filters.category);
    }

    if (this.filters.searchQuery) {
      const query = this.filters.searchQuery.toLowerCase();
      patterns = patterns.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      );
    }

    return patterns;
  }

  open() {
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
    this.selectedPattern = null;
  }

  render(container) {
    const ui = this.buildUI();
    if (container && typeof renderComponentTree === 'function') {
      renderComponentTree(ui, container);
    }
  }
}

function createPatternDiscoveryGrid() {
  return new PatternDiscoveryGrid();
}
