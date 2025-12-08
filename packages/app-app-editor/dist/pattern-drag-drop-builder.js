class PatternDragDropBuilder {
  constructor() {
    this.discovery = null;
    this.isOpen = false;
    this.canvas = [];
    this.draggedPattern = null;
    this.selectedCanvasItem = null;
    this.onCompositionCreate = null;
    this.compositionName = '';
    this.compositionLayout = 'vertical';
  }

  init(discovery, onCompositionCreate) {
    this.discovery = discovery;
    this.onCompositionCreate = onCompositionCreate;
  }

  buildUI() {
    return {
      type: 'box',
      style: {
        position: 'fixed',
        inset: 0,
        background: this.isOpen ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)',
        zIndex: 1005,
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
            maxWidth: '1300px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid #3e3e42'
          },
          children: [
            this.buildHeader(),
            this.buildMain()
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
          content: '🎨 Drag-Drop Composition Builder',
          level: 2,
          style: {
            margin: 0,
            fontSize: '18px',
            color: '#e0e0e0'
          }
        },
        {
          type: 'box',
          style: { display: 'flex', gap: '8px' },
          children: [
            {
              type: 'button',
              label: `✓ Create${this.canvas.length > 0 ? ` (${this.canvas.length})` : ''}`,
              style: {
                background: this.canvas.length > 0 ? '#28a745' : '#555',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '3px',
                cursor: this.canvas.length > 0 ? 'pointer' : 'default',
                fontSize: '11px',
                fontWeight: 600
              },
              onClick: () => this.createComposition()
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
        }
      ]
    };
  }

  buildMain() {
    const patterns = this.discovery?.getAllPatterns?.() || [];

    return {
      type: 'flex',
      style: {
        flex: 1,
        overflow: 'hidden',
        gap: '16px',
        padding: '16px',
        background: '#1e1e1e'
      },
      children: [
        this.buildPatternPalette(patterns),
        this.buildCanvas(),
        this.buildProperties()
      ]
    };
  }

  buildPatternPalette(patterns) {
    return {
      type: 'box',
      style: {
        width: '250px',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #3e3e42'
      },
      children: [
        {
          type: 'heading',
          content: 'Patterns',
          level: 3,
          style: {
            margin: '0 0 12px 0',
            fontSize: '12px',
            color: '#e0e0e0',
            textTransform: 'uppercase'
          }
        },
        {
          type: 'box',
          style: {
            flex: 1,
            overflow: 'y',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          },
          children: patterns.slice(0, 15).map(p => ({
            type: 'box',
            draggable: true,
            style: {
              padding: '8px',
              background: '#3e3e42',
              borderRadius: '4px',
              cursor: 'grab',
              fontSize: '11px',
              color: '#d4d4d4',
              userSelect: 'none',
              border: '1px solid #555'
            },
            children: [
              {
                type: 'paragraph',
                content: `${p.icon || '◆'} ${p.name}`,
                style: {
                  margin: 0,
                  fontSize: '11px',
                  fontWeight: 600
                }
              }
            ],
            onDragStart: () => this.draggedPattern = p
          }))
        }
      ]
    };
  }

  buildCanvas() {
    return {
      type: 'box',
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: '#2d2d30',
        borderRadius: '6px',
        border: '2px dashed #3e3e42',
        padding: '16px',
        overflow: 'y',
        position: 'relative'
      },
      children: [
        {
          type: 'heading',
          content: 'Canvas (Drag patterns here)',
          level: 3,
          style: {
            margin: '0 0 12px 0',
            fontSize: '12px',
            color: '#858585'
          }
        },
        {
          type: 'box',
          style: {
            flex: 1,
            display: 'flex',
            flexDirection: this.compositionLayout === 'horizontal' ? 'row' : 'column',
            gap: '12px'
          },
          children: this.canvas.length > 0
            ? this.canvas.map((item, idx) => ({
              type: 'box',
              style: {
                padding: '12px',
                background: this.selectedCanvasItem === idx ? '#0e639c' : '#3e3e42',
                borderRadius: '4px',
                border: this.selectedCanvasItem === idx ? '2px solid #0e639c' : '1px solid #555',
                cursor: 'pointer',
                fontSize: '12px',
                color: '#d4d4d4',
                position: 'relative',
                minWidth: '100px'
              },
              children: [
                {
                  type: 'flex',
                  style: {
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    gap: '8px'
                  },
                  children: [
                    {
                      type: 'paragraph',
                      content: `${item.icon || '◆'} ${item.name}`,
                      style: {
                        margin: 0,
                        fontSize: '11px',
                        fontWeight: 600
                      }
                    },
                    {
                      type: 'button',
                      label: '✕',
                      style: {
                        background: 'transparent',
                        border: 'none',
                        color: '#999',
                        cursor: 'pointer',
                        fontSize: '12px',
                        padding: 0
                      },
                      onClick: () => this.removeFromCanvas(idx)
                    }
                  ]
                }
              ],
              onClick: () => this.selectedCanvasItem = idx
            }))
            : [
              {
                type: 'paragraph',
                content: '← Drag patterns from left to start building',
                style: {
                  margin: 0,
                  fontSize: '12px',
                  color: '#858585',
                  textAlign: 'center',
                  padding: '20px'
                }
              }
            ]
        }
      ],
      onDragOver: (e) => e.preventDefault(),
      onDrop: () => {
        if (this.draggedPattern) {
          this.canvas.push(this.draggedPattern);
          this.draggedPattern = null;
        }
      }
    };
  }

  buildProperties() {
    return {
      type: 'box',
      style: {
        width: '220px',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '1px solid #3e3e42'
      },
      children: [
        {
          type: 'heading',
          content: 'Settings',
          level: 3,
          style: {
            margin: '0 0 12px 0',
            fontSize: '12px',
            color: '#e0e0e0',
            textTransform: 'uppercase'
          }
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          },
          children: [
            {
              type: 'box',
              children: [
                {
                  type: 'paragraph',
                  content: 'Composition Name',
                  style: {
                    margin: 0,
                    fontSize: '10px',
                    color: '#858585',
                    fontWeight: 600,
                    marginBottom: '4px'
                  }
                },
                {
                  type: 'input',
                  placeholder: 'my-comp',
                  style: {
                    width: '100%',
                    padding: '6px 8px',
                    background: '#3e3e42',
                    border: '1px solid #555',
                    borderRadius: '3px',
                    color: '#d4d4d4',
                    fontSize: '11px'
                  },
                  id: 'dragDropCompName',
                  onInput: (e) => this.compositionName = e.target.value
                }
              ]
            },
            {
              type: 'box',
              children: [
                {
                  type: 'paragraph',
                  content: 'Layout',
                  style: {
                    margin: 0,
                    fontSize: '10px',
                    color: '#858585',
                    fontWeight: 600,
                    marginBottom: '6px'
                  }
                },
                {
                  type: 'box',
                  style: {
                    display: 'flex',
                    gap: '4px'
                  },
                  children: [
                    {
                      type: 'button',
                      label: '⬇️',
                      style: {
                        flex: 1,
                        padding: '6px 4px',
                        background: this.compositionLayout === 'vertical' ? '#0e639c' : '#3e3e42',
                        color: 'white',
                        border: 'none',
                        borderRadius: '2px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      },
                      onClick: () => this.compositionLayout = 'vertical'
                    },
                    {
                      type: 'button',
                      label: '➡️',
                      style: {
                        flex: 1,
                        padding: '6px 4px',
                        background: this.compositionLayout === 'horizontal' ? '#0e639c' : '#3e3e42',
                        color: 'white',
                        border: 'none',
                        borderRadius: '2px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      },
                      onClick: () => this.compositionLayout = 'horizontal'
                    }
                  ]
                }
              ]
            },
            {
              type: 'box',
              children: [
                {
                  type: 'paragraph',
                  content: 'Items on Canvas',
                  style: {
                    margin: 0,
                    fontSize: '10px',
                    color: '#858585',
                    fontWeight: 600,
                    marginBottom: '6px'
                  }
                },
                {
                  type: 'paragraph',
                  content: `${this.canvas.length} pattern${this.canvas.length !== 1 ? 's' : ''}`,
                  style: {
                    margin: 0,
                    fontSize: '12px',
                    color: '#28a745',
                    fontWeight: 600
                  }
                }
              ]
            },
            {
              type: 'button',
              label: this.canvas.length > 0 ? '🗑️ Clear Canvas' : 'Clear',
              style: {
                width: '100%',
                padding: '8px 12px',
                background: '#555',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '11px',
                marginTop: 'auto'
              },
              onClick: () => this.clearCanvas()
            }
          ]
        }
      ]
    };
  }

  removeFromCanvas(index) {
    this.canvas.splice(index, 1);
    if (this.selectedCanvasItem === index) {
      this.selectedCanvasItem = null;
    }
  }

  clearCanvas() {
    this.canvas = [];
    this.selectedCanvasItem = null;
  }

  createComposition() {
    if (this.canvas.length < 2) {
      alert('Add at least 2 patterns to canvas');
      return;
    }

    const name = this.compositionName || `composition-${Date.now()}`;
    const composition = {
      id: name,
      name,
      patterns: this.canvas.map(p => p.id),
      config: {
        layout: this.compositionLayout,
        gap: '16px',
        padding: '16px'
      }
    };

    if (this.onCompositionCreate) {
      this.onCompositionCreate(composition);
    }

    alert(`✓ Composition "${name}" created with ${this.canvas.length} patterns`);
    this.clearCanvas();
    this.close();
  }

  open() {
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
  }

  render(container) {
    const ui = this.buildUI();
    if (container && typeof renderComponentTree === 'function') {
      renderComponentTree(ui, container);
    }
  }
}

function createPatternDragDropBuilder() {
  return new PatternDragDropBuilder();
}
