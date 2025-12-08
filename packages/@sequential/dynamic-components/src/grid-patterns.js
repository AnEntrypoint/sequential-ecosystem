class GridPatternLibrary {
  constructor() {
    this.patterns = new Map();
    this.registerAllPatterns();
  }

  registerAllPatterns() {
    this.registerMasonryGrid();
    this.registerResponsiveGrid();
    this.registerAutoLayoutGrid();
    this.registerCardsGrid();
    this.registerGalleryGrid();
  }

  registerMasonryGrid() {
    this.patterns.set('masonry-grid', {
      id: 'masonry-grid',
      name: 'Masonry Grid',
      icon: '🧱',
      category: 'grids',
      codeReduction: '83%',
      description: 'Pinterest-style masonry layout with varying item heights',
      definition: {
        type: 'flex',
        direction: 'column',
        gap: '16px',
        style: { padding: '20px' },
        children: [
          {
            type: 'flex',
            direction: 'row',
            gap: '16px',
            style: { alignItems: 'flex-start' },
            children: [
              {
                type: 'flex',
                direction: 'column',
                gap: '16px',
                style: { flex: 1 },
                children: [
                  {
                    type: 'box',
                    style: {
                      background: '#e3f2fd',
                      borderRadius: '8px',
                      padding: '16px',
                      minHeight: '200px'
                    },
                    children: [
                      { type: 'heading', content: 'Item 1', level: 4, style: { margin: '0 0 8px 0', fontSize: '14px' } },
                      { type: 'paragraph', content: 'Taller masonry item with more content...', style: { margin: 0, fontSize: '13px', color: '#666', lineHeight: '1.6' } }
                    ]
                  },
                  {
                    type: 'box',
                    style: {
                      background: '#f3e5f5',
                      borderRadius: '8px',
                      padding: '16px',
                      minHeight: '150px'
                    },
                    children: [
                      { type: 'heading', content: 'Item 3', level: 4, style: { margin: '0 0 8px 0', fontSize: '14px' } },
                      { type: 'paragraph', content: 'Medium item', style: { margin: 0, fontSize: '13px', color: '#666' } }
                    ]
                  }
                ]
              },
              {
                type: 'flex',
                direction: 'column',
                gap: '16px',
                style: { flex: 1 },
                children: [
                  {
                    type: 'box',
                    style: {
                      background: '#e8f5e9',
                      borderRadius: '8px',
                      padding: '16px',
                      minHeight: '150px'
                    },
                    children: [
                      { type: 'heading', content: 'Item 2', level: 4, style: { margin: '0 0 8px 0', fontSize: '14px' } },
                      { type: 'paragraph', content: 'Shorter item', style: { margin: 0, fontSize: '13px', color: '#666' } }
                    ]
                  },
                  {
                    type: 'box',
                    style: {
                      background: '#fff3e0',
                      borderRadius: '8px',
                      padding: '16px',
                      minHeight: '220px'
                    },
                    children: [
                      { type: 'heading', content: 'Item 4', level: 4, style: { margin: '0 0 8px 0', fontSize: '14px' } },
                      { type: 'paragraph', content: 'Tallest item in this column with more content blocks...', style: { margin: 0, fontSize: '13px', color: '#666', lineHeight: '1.6' } }
                    ]
                  }
                ]
              },
              {
                type: 'flex',
                direction: 'column',
                gap: '16px',
                style: { flex: 1 },
                children: [
                  {
                    type: 'box',
                    style: {
                      background: '#fce4ec',
                      borderRadius: '8px',
                      padding: '16px',
                      minHeight: '180px'
                    },
                    children: [
                      { type: 'heading', content: 'Item 5', level: 4, style: { margin: '0 0 8px 0', fontSize: '14px' } },
                      { type: 'paragraph', content: 'Medium-tall item', style: { margin: 0, fontSize: '13px', color: '#666', lineHeight: '1.6' } }
                    ]
                  },
                  {
                    type: 'box',
                    style: {
                      background: '#e0f2f1',
                      borderRadius: '8px',
                      padding: '16px',
                      minHeight: '120px'
                    },
                    children: [
                      { type: 'heading', content: 'Item 6', level: 4, style: { margin: '0 0 8px 0', fontSize: '14px' } },
                      { type: 'paragraph', content: 'Small', style: { margin: 0, fontSize: '13px', color: '#666' } }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      tags: ['grid', 'masonry', 'layout', 'pinterest'],
      author: 'system'
    });
  }

  registerResponsiveGrid() {
    this.patterns.set('responsive-grid', {
      id: 'responsive-grid',
      name: 'Responsive Grid',
      icon: '📱',
      category: 'grids',
      codeReduction: '85%',
      description: 'Responsive grid that adapts from 1 to 4 columns based on screen size',
      definition: {
        type: 'flex',
        direction: 'row',
        gap: '16px',
        style: { padding: '20px', flexWrap: 'wrap' },
        children: [
          {
            type: 'flex',
            direction: 'column',
            gap: '12px',
            style: {
              flex: '1 1 calc(25% - 12px)',
              minWidth: '200px',
              padding: '16px',
              background: '#f5f5f5',
              borderRadius: '8px'
            },
            children: [
              { type: 'box', style: { width: '100%', height: '120px', background: '#ddd', borderRadius: '6px', marginBottom: '8px' } },
              { type: 'heading', content: 'Card 1', level: 4, style: { margin: '0 0 8px 0', fontSize: '14px' } },
              { type: 'paragraph', content: 'This card is 1/4 width on desktop, 1/2 on tablet, full on mobile', style: { margin: 0, fontSize: '13px', color: '#666' } }
            ]
          },
          {
            type: 'flex',
            direction: 'column',
            gap: '12px',
            style: {
              flex: '1 1 calc(25% - 12px)',
              minWidth: '200px',
              padding: '16px',
              background: '#f5f5f5',
              borderRadius: '8px'
            },
            children: [
              { type: 'box', style: { width: '100%', height: '120px', background: '#ddd', borderRadius: '6px', marginBottom: '8px' } },
              { type: 'heading', content: 'Card 2', level: 4, style: { margin: '0 0 8px 0', fontSize: '14px' } },
              { type: 'paragraph', content: 'Responsive layout adapts to viewport', style: { margin: 0, fontSize: '13px', color: '#666' } }
            ]
          },
          {
            type: 'flex',
            direction: 'column',
            gap: '12px',
            style: {
              flex: '1 1 calc(25% - 12px)',
              minWidth: '200px',
              padding: '16px',
              background: '#f5f5f5',
              borderRadius: '8px'
            },
            children: [
              { type: 'box', style: { width: '100%', height: '120px', background: '#ddd', borderRadius: '6px', marginBottom: '8px' } },
              { type: 'heading', content: 'Card 3', level: 4, style: { margin: '0 0 8px 0', fontSize: '14px' } },
              { type: 'paragraph', content: 'Uses CSS flexbox for flexibility', style: { margin: 0, fontSize: '13px', color: '#666' } }
            ]
          },
          {
            type: 'flex',
            direction: 'column',
            gap: '12px',
            style: {
              flex: '1 1 calc(25% - 12px)',
              minWidth: '200px',
              padding: '16px',
              background: '#f5f5f5',
              borderRadius: '8px'
            },
            children: [
              { type: 'box', style: { width: '100%', height: '120px', background: '#ddd', borderRadius: '6px', marginBottom: '8px' } },
              { type: 'heading', content: 'Card 4', level: 4, style: { margin: '0 0 8px 0', fontSize: '14px' } },
              { type: 'paragraph', content: 'Perfect for product grids', style: { margin: 0, fontSize: '13px', color: '#666' } }
            ]
          }
        ]
      },
      tags: ['grid', 'responsive', 'mobile', 'flexible'],
      author: 'system'
    });
  }

  registerAutoLayoutGrid() {
    this.patterns.set('auto-layout-grid', {
      id: 'auto-layout-grid',
      name: 'Auto-Layout Grid',
      icon: '⚙️',
      category: 'grids',
      codeReduction: '82%',
      description: 'Auto-fit grid that fills available space with equal-sized items',
      definition: {
        type: 'flex',
        direction: 'row',
        gap: '16px',
        style: { padding: '20px', flexWrap: 'wrap', justifyContent: 'space-between' },
        children: [
          {
            type: 'flex',
            direction: 'column',
            gap: '12px',
            style: {
              flex: '0 1 calc(20% - 13px)',
              minWidth: '120px',
              padding: '12px',
              background: '#f9f9f9',
              borderRadius: '6px',
              textAlign: 'center',
              border: '1px solid #e0e0e0'
            },
            children: [
              { type: 'box', style: { fontSize: '32px', marginBottom: '8px' }, children: [{ type: 'paragraph', content: '📊', style: { margin: 0 } }] },
              { type: 'paragraph', content: 'Analytics', style: { margin: 0, fontSize: '13px', fontWeight: '600' } }
            ]
          },
          {
            type: 'flex',
            direction: 'column',
            gap: '12px',
            style: {
              flex: '0 1 calc(20% - 13px)',
              minWidth: '120px',
              padding: '12px',
              background: '#f9f9f9',
              borderRadius: '6px',
              textAlign: 'center',
              border: '1px solid #e0e0e0'
            },
            children: [
              { type: 'box', style: { fontSize: '32px', marginBottom: '8px' }, children: [{ type: 'paragraph', content: '⚙️', style: { margin: 0 } }] },
              { type: 'paragraph', content: 'Settings', style: { margin: 0, fontSize: '13px', fontWeight: '600' } }
            ]
          },
          {
            type: 'flex',
            direction: 'column',
            gap: '12px',
            style: {
              flex: '0 1 calc(20% - 13px)',
              minWidth: '120px',
              padding: '12px',
              background: '#f9f9f9',
              borderRadius: '6px',
              textAlign: 'center',
              border: '1px solid #e0e0e0'
            },
            children: [
              { type: 'box', style: { fontSize: '32px', marginBottom: '8px' }, children: [{ type: 'paragraph', content: '👥', style: { margin: 0 } }] },
              { type: 'paragraph', content: 'Users', style: { margin: 0, fontSize: '13px', fontWeight: '600' } }
            ]
          },
          {
            type: 'flex',
            direction: 'column',
            gap: '12px',
            style: {
              flex: '0 1 calc(20% - 13px)',
              minWidth: '120px',
              padding: '12px',
              background: '#f9f9f9',
              borderRadius: '6px',
              textAlign: 'center',
              border: '1px solid #e0e0e0'
            },
            children: [
              { type: 'box', style: { fontSize: '32px', marginBottom: '8px' }, children: [{ type: 'paragraph', content: '📄', style: { margin: 0 } }] },
              { type: 'paragraph', content: 'Reports', style: { margin: 0, fontSize: '13px', fontWeight: '600' } }
            ]
          },
          {
            type: 'flex',
            direction: 'column',
            gap: '12px',
            style: {
              flex: '0 1 calc(20% - 13px)',
              minWidth: '120px',
              padding: '12px',
              background: '#f9f9f9',
              borderRadius: '6px',
              textAlign: 'center',
              border: '1px solid #e0e0e0'
            },
            children: [
              { type: 'box', style: { fontSize: '32px', marginBottom: '8px' }, children: [{ type: 'paragraph', content: '🔔', style: { margin: 0 } }] },
              { type: 'paragraph', content: 'Alerts', style: { margin: 0, fontSize: '13px', fontWeight: '600' } }
            ]
          }
        ]
      },
      tags: ['grid', 'auto-fit', 'equal-width', 'flexible'],
      author: 'system'
    });
  }

  registerCardsGrid() {
    this.patterns.set('cards-grid', {
      id: 'cards-grid',
      name: 'Cards Grid',
      icon: '🎴',
      category: 'grids',
      codeReduction: '80%',
      description: 'Grid of card components with shadows and hover effects',
      definition: {
        type: 'flex',
        direction: 'row',
        gap: '20px',
        style: { padding: '20px', flexWrap: 'wrap' },
        children: [
          {
            type: 'flex',
            direction: 'column',
            gap: '12px',
            style: {
              flex: '1 1 calc(33.333% - 14px)',
              minWidth: '250px',
              padding: '16px',
              background: '#fff',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            },
            children: [
              { type: 'box', style: { width: '100%', height: '140px', background: '#e3f2fd', borderRadius: '6px', marginBottom: '8px' } },
              { type: 'heading', content: 'Product Name', level: 4, style: { margin: '0 0 8px 0', fontSize: '15px', fontWeight: '600' } },
              { type: 'paragraph', content: 'Brief description of the product or service offering', style: { margin: 0, fontSize: '13px', color: '#666', lineHeight: '1.5' } },
              { type: 'button', label: 'Learn More', variant: 'primary', style: { marginTop: '12px', padding: '8px 16px', background: '#0078d4', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' } }
            ]
          },
          {
            type: 'flex',
            direction: 'column',
            gap: '12px',
            style: {
              flex: '1 1 calc(33.333% - 14px)',
              minWidth: '250px',
              padding: '16px',
              background: '#fff',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            },
            children: [
              { type: 'box', style: { width: '100%', height: '140px', background: '#f3e5f5', borderRadius: '6px', marginBottom: '8px' } },
              { type: 'heading', content: 'Product Name', level: 4, style: { margin: '0 0 8px 0', fontSize: '15px', fontWeight: '600' } },
              { type: 'paragraph', content: 'Brief description of the product or service offering', style: { margin: 0, fontSize: '13px', color: '#666', lineHeight: '1.5' } },
              { type: 'button', label: 'Learn More', variant: 'primary', style: { marginTop: '12px', padding: '8px 16px', background: '#0078d4', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' } }
            ]
          },
          {
            type: 'flex',
            direction: 'column',
            gap: '12px',
            style: {
              flex: '1 1 calc(33.333% - 14px)',
              minWidth: '250px',
              padding: '16px',
              background: '#fff',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            },
            children: [
              { type: 'box', style: { width: '100%', height: '140px', background: '#e8f5e9', borderRadius: '6px', marginBottom: '8px' } },
              { type: 'heading', content: 'Product Name', level: 4, style: { margin: '0 0 8px 0', fontSize: '15px', fontWeight: '600' } },
              { type: 'paragraph', content: 'Brief description of the product or service offering', style: { margin: 0, fontSize: '13px', color: '#666', lineHeight: '1.5' } },
              { type: 'button', label: 'Learn More', variant: 'primary', style: { marginTop: '12px', padding: '8px 16px', background: '#0078d4', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' } }
            ]
          }
        ]
      },
      tags: ['grid', 'cards', 'product', 'portfolio'],
      author: 'system'
    });
  }

  registerGalleryGrid() {
    this.patterns.set('gallery-grid', {
      id: 'gallery-grid',
      name: 'Gallery Grid',
      icon: '🖼️',
      category: 'grids',
      codeReduction: '79%',
      description: 'Photo gallery grid with hover overlay and lightbox trigger',
      definition: {
        type: 'flex',
        direction: 'row',
        gap: '12px',
        style: { padding: '20px', flexWrap: 'wrap' },
        children: [
          {
            type: 'box',
            style: {
              flex: '1 1 calc(25% - 9px)',
              minWidth: '150px',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '6px',
              aspect: '1 / 1',
              background: '#ddd',
              cursor: 'pointer'
            },
            children: [
              { type: 'box', style: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.3)', opacity: 0 } }
            ]
          },
          {
            type: 'box',
            style: {
              flex: '1 1 calc(25% - 9px)',
              minWidth: '150px',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '6px',
              aspect: '1 / 1',
              background: '#ddd',
              cursor: 'pointer'
            },
            children: [
              { type: 'box', style: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.3)', opacity: 0 } }
            ]
          },
          {
            type: 'box',
            style: {
              flex: '1 1 calc(25% - 9px)',
              minWidth: '150px',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '6px',
              aspect: '1 / 1',
              background: '#ddd',
              cursor: 'pointer'
            },
            children: [
              { type: 'box', style: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.3)', opacity: 0 } }
            ]
          },
          {
            type: 'box',
            style: {
              flex: '1 1 calc(25% - 9px)',
              minWidth: '150px',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '6px',
              aspect: '1 / 1',
              background: '#ddd',
              cursor: 'pointer'
            },
            children: [
              { type: 'box', style: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.3)', opacity: 0 } }
            ]
          },
          {
            type: 'box',
            style: {
              flex: '1 1 calc(25% - 9px)',
              minWidth: '150px',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '6px',
              aspect: '1 / 1',
              background: '#ddd',
              cursor: 'pointer'
            },
            children: [
              { type: 'box', style: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.3)', opacity: 0 } }
            ]
          },
          {
            type: 'box',
            style: {
              flex: '1 1 calc(25% - 9px)',
              minWidth: '150px',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '6px',
              aspect: '1 / 1',
              background: '#ddd',
              cursor: 'pointer'
            },
            children: [
              { type: 'box', style: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.3)', opacity: 0 } }
            ]
          },
          {
            type: 'box',
            style: {
              flex: '1 1 calc(25% - 9px)',
              minWidth: '150px',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '6px',
              aspect: '1 / 1',
              background: '#ddd',
              cursor: 'pointer'
            },
            children: [
              { type: 'box', style: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.3)', opacity: 0 } }
            ]
          },
          {
            type: 'box',
            style: {
              flex: '1 1 calc(25% - 9px)',
              minWidth: '150px',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '6px',
              aspect: '1 / 1',
              background: '#ddd',
              cursor: 'pointer'
            },
            children: [
              { type: 'box', style: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.3)', opacity: 0 } }
            ]
          }
        ]
      },
      tags: ['grid', 'gallery', 'photos', 'portfolio'],
      author: 'system'
    });
  }

  getAllPatterns() {
    return Array.from(this.patterns.values());
  }

  getPattern(id) {
    return this.patterns.get(id);
  }

  getPatternsByCategory(category) {
    return this.getAllPatterns().filter(p => p.category === category);
  }

  searchPatterns(query) {
    const q = query.toLowerCase();
    return this.getAllPatterns().filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  }
}

function createGridPatternLibrary() {
  return new GridPatternLibrary();
}

export { GridPatternLibrary, createGridPatternLibrary };
