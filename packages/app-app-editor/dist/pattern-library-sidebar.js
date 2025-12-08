class PatternLibrarySidebar {
  constructor() {
    this.discovery = null;
    this.selectedCategory = 'all';
    this.searchQuery = '';
    this.favorites = new Set();
    this.expanded = true;
    this.onPatternSelect = null;
  }

  init(discovery, onPatternSelect) {
    this.discovery = discovery;
    this.onPatternSelect = onPatternSelect;
  }

  loadFavorites() {
    const saved = localStorage.getItem('patternFavorites');
    if (saved) {
      this.favorites = new Set(JSON.parse(saved));
    }
  }

  saveFavorites() {
    localStorage.setItem('patternFavorites', JSON.stringify(Array.from(this.favorites)));
  }

  toggleFavorite(patternId) {
    if (this.favorites.has(patternId)) {
      this.favorites.delete(patternId);
    } else {
      this.favorites.add(patternId);
    }
    this.saveFavorites();
  }

  getPatterns() {
    let patterns = this.discovery?.getAllPatterns?.() || [];

    if (this.selectedCategory !== 'all') {
      patterns = patterns.filter(p => p.category === this.selectedCategory);
    }

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      patterns = patterns.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.tags?.some(t => t.toLowerCase().includes(query))
      );
    }

    return patterns;
  }

  buildUI() {
    const patterns = this.getPatterns();
    const categories = this.getCategories();

    return {
      type: 'box',
      style: {
        width: this.expanded ? '280px' : '50px',
        height: '100%',
        background: '#252526',
        border: '1px solid #3e3e42',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s',
        overflow: 'hidden'
      },
      children: [
        this.buildHeader(),
        this.expanded ? [
          this.buildSearchBar(),
          this.buildCategoryFilter(categories),
          this.buildPatternsList(patterns)
        ] : []
      ]
    };
  }

  buildHeader() {
    return {
      type: 'flex',
      style: {
        padding: '12px',
        borderBottom: '1px solid #3e3e42',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#1e1e1e'
      },
      children: [
        this.expanded ? {
          type: 'paragraph',
          content: '📚 Patterns',
          style: {
            margin: 0,
            fontSize: '12px',
            fontWeight: 600,
            color: '#e0e0e0'
          }
        } : {
          type: 'paragraph',
          content: '📚',
          style: {
            margin: 0,
            fontSize: '14px'
          }
        },
        {
          type: 'button',
          label: this.expanded ? '«' : '»',
          style: {
            background: 'transparent',
            border: 'none',
            color: '#999',
            cursor: 'pointer',
            fontSize: '12px',
            padding: 0
          },
          onClick: () => this.expanded = !this.expanded
        }
      ]
    };
  }

  buildSearchBar() {
    return {
      type: 'box',
      style: {
        padding: '8px 12px',
        borderBottom: '1px solid #3e3e42'
      },
      children: [
        {
          type: 'input',
          placeholder: 'Search patterns...',
          style: {
            width: '100%',
            padding: '6px 8px',
            background: '#3e3e42',
            border: '1px solid #555',
            borderRadius: '3px',
            color: '#d4d4d4',
            fontSize: '11px'
          },
          id: 'patternSearchInput',
          onInput: (e) => {
            this.searchQuery = e.target.value;
          }
        }
      ]
    };
  }

  buildCategoryFilter(categories) {
    return {
      type: 'box',
      style: {
        padding: '8px 12px',
        borderBottom: '1px solid #3e3e42',
        overflowX: 'auto',
        whiteSpace: 'nowrap'
      },
      children: [
        {
          type: 'button',
          label: this.selectedCategory === 'all' ? '✓ All' : 'All',
          style: {
            padding: '4px 8px',
            background: this.selectedCategory === 'all' ? '#0e639c' : '#3e3e42',
            color: 'white',
            border: 'none',
            borderRadius: '2px',
            cursor: 'pointer',
            fontSize: '10px',
            marginRight: '4px'
          },
          onClick: () => this.selectedCategory = 'all'
        },
        ...categories.map(cat => ({
          type: 'button',
          label: this.selectedCategory === cat ? '✓ ' + cat : cat,
          style: {
            padding: '4px 8px',
            background: this.selectedCategory === cat ? '#0e639c' : '#3e3e42',
            color: 'white',
            border: 'none',
            borderRadius: '2px',
            cursor: 'pointer',
            fontSize: '10px',
            marginRight: '4px',
            whiteSpace: 'nowrap'
          },
          onClick: () => this.selectedCategory = cat
        }))
      ]
    };
  }

  buildPatternsList(patterns) {
    return {
      type: 'box',
      style: {
        flex: 1,
        overflow: 'y',
        padding: '8px'
      },
      children: patterns.length > 0 ? patterns.map(p => ({
        type: 'box',
        style: {
          padding: '8px',
          background: '#3e3e42',
          borderRadius: '3px',
          marginBottom: '6px',
          cursor: 'pointer',
          fontSize: '11px',
          color: '#d4d4d4',
          position: 'relative'
        },
        children: [
          {
            type: 'flex',
            style: {
              justifyContent: 'space-between',
              alignItems: 'start',
              gap: '4px'
            },
            children: [
              {
                type: 'box',
                style: { flex: 1 },
                children: [
                  {
                    type: 'paragraph',
                    content: `${p.icon || '◆'} ${p.name}`,
                    style: {
                      margin: 0,
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#e0e0e0'
                    }
                  },
                  {
                    type: 'paragraph',
                    content: p.codeReduction,
                    style: {
                      margin: '2px 0 0 0',
                      fontSize: '9px',
                      color: '#858585'
                    }
                  }
                ]
              },
              {
                type: 'button',
                label: this.favorites.has(p.id) ? '★' : '☆',
                style: {
                  background: 'transparent',
                  border: 'none',
                  color: this.favorites.has(p.id) ? '#f59e0b' : '#666',
                  cursor: 'pointer',
                  fontSize: '12px',
                  padding: 0,
                  minWidth: '20px'
                },
                onClick: () => this.toggleFavorite(p.id)
              }
            ]
          },
          {
            type: 'box',
            style: {
              marginTop: '6px',
              display: 'flex',
              gap: '4px'
            },
            children: [
              {
                type: 'button',
                label: '+ Insert',
                style: {
                  flex: 1,
                  padding: '4px 6px',
                  background: '#0e639c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontWeight: 600
                },
                onClick: () => {
                  if (this.onPatternSelect) {
                    this.onPatternSelect(p);
                  }
                }
              }
            ]
          }
        ]
      })) : [
        {
          type: 'paragraph',
          content: 'No patterns found',
          style: {
            margin: 0,
            fontSize: '11px',
            color: '#858585',
            textAlign: 'center',
            padding: '20px 0'
          }
        }
      ]
    };
  }

  getCategories() {
    const patterns = this.discovery?.getAllPatterns?.() || [];
    const categories = new Set();
    patterns.forEach(p => {
      if (p.category) categories.add(p.category);
    });
    return Array.from(categories).sort();
  }

  render(container) {
    this.loadFavorites();
    const ui = this.buildUI();
    if (container && typeof renderComponentTree === 'function') {
      renderComponentTree(ui, container);
    }
  }
}

function createPatternLibrarySidebar() {
  return new PatternLibrarySidebar();
}
