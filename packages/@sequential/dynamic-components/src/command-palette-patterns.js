class CommandPalettePatterns {
  constructor(patternDiscovery) {
    this.discovery = patternDiscovery;
    this.isOpen = false;
    this.searchQuery = '';
    this.selectedIndex = 0;
    this.filteredPatterns = [];
    this.onSelect = null;
    this.container = null;
  }

  init(onSelect) {
    this.onSelect = onSelect;
    this.setupKeyListener();
  }

  setupKeyListener() {
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p' && !e.shiftKey) {
        e.preventDefault();
        this.toggle();
      }

      if (this.isOpen) {
        if (e.key === 'Escape') {
          e.preventDefault();
          this.close();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          this.selectNext();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          this.selectPrev();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          this.insertSelected();
        }
      }
    });
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    this.searchQuery = '';
    this.selectedIndex = 0;
    this.filteredPatterns = this.discovery.getAllPatterns();
    this.render();
  }

  close() {
    this.isOpen = false;
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  setSearchQuery(query) {
    this.searchQuery = query;
    this.selectedIndex = 0;
    this.filteredPatterns = this.discovery.search(query);
    this.render();
  }

  selectNext() {
    if (this.selectedIndex < this.filteredPatterns.length - 1) {
      this.selectedIndex++;
      this.render();
    }
  }

  selectPrev() {
    if (this.selectedIndex > 0) {
      this.selectedIndex--;
      this.render();
    }
  }

  insertSelected() {
    const pattern = this.filteredPatterns[this.selectedIndex];
    if (pattern && this.onSelect) {
      this.onSelect(pattern);
      this.close();
    }
  }

  render() {
    if (!this.isOpen || !this.container) return;

    this.container.innerHTML = '';
    const modal = this.buildPaletteUI();
    this.renderComponent(modal, this.container);
  }

  buildPaletteUI() {
    const itemHeight = 50;
    const maxHeight = Math.min(this.filteredPatterns.length * itemHeight + 100, 500);

    return {
      type: 'box',
      style: {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        maxHeight: `${maxHeight}px`,
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        zIndex: 50000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      },
      children: [
        {
          type: 'flex',
          style: {
            padding: '12px 16px',
            borderBottom: '1px solid #e0e0e0',
            gap: '8px',
            alignItems: 'center'
          },
          children: [
            { type: 'paragraph', content: '🔍', style: { margin: 0, fontSize: '16px' } },
            {
              type: 'input',
              placeholder: 'Search patterns... (type to filter, ↑↓ to navigate, Enter to select)',
              value: this.searchQuery,
              style: {
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'inherit'
              },
              onChange: (e) => this.setSearchQuery(e.target?.value || '')
            }
          ]
        },
        {
          type: 'box',
          style: {
            flex: 1,
            overflowY: 'auto',
            maxHeight: '400px',
            display: 'flex',
            flexDirection: 'column'
          },
          children: this.filteredPatterns.length > 0
            ? this.filteredPatterns.map((pattern, idx) => ({
              type: 'box',
              style: {
                padding: '12px 16px',
                borderBottom: '1px solid #f0f0f0',
                background: idx === this.selectedIndex ? '#f0f7ff' : 'white',
                cursor: 'pointer',
                transition: 'all 0.1s'
              },
              onClick: () => {
                this.selectedIndex = idx;
                this.insertSelected();
              },
              children: [
                {
                  type: 'flex',
                  gap: '12px',
                  alignItems: 'center',
                  children: [
                    { type: 'paragraph', content: pattern.icon || '◆', style: { margin: 0, fontSize: '18px', minWidth: '24px' } },
                    {
                      type: 'flex',
                      direction: 'column',
                      gap: '4px',
                      style: { flex: 1 },
                      children: [
                        { type: 'paragraph', content: pattern.name, style: { margin: 0, fontSize: '13px', fontWeight: '600', color: '#333' } },
                        { type: 'paragraph', content: `${pattern.category} • ${pattern.codeReduction} reduction`, style: { margin: 0, fontSize: '11px', color: '#999' } }
                      ]
                    }
                  ]
                }
              ]
            }))
            : [
              { type: 'paragraph', content: 'No patterns found', style: { textAlign: 'center', color: '#999', padding: '20px', margin: 0 } }
            ]
        },
        {
          type: 'flex',
          style: {
            padding: '8px 16px',
            background: '#f9f9f9',
            borderTop: '1px solid #e0e0e0',
            gap: '12px',
            fontSize: '11px',
            color: '#666'
          },
          children: [
            { type: 'paragraph', content: '↑↓ Navigate', style: { margin: 0 } },
            { type: 'paragraph', content: 'Enter Select', style: { margin: 0 } },
            { type: 'paragraph', content: 'Esc Close', style: { margin: 0 } }
          ]
        }
      ]
    };
  }

  renderComponent(def, parent) {
    if (!def) return;

    if (typeof def === 'string') {
      parent.textContent = def;
      return;
    }

    if (def.type === 'input') {
      const input = document.createElement('input');
      input.placeholder = def.placeholder || '';
      if (def.value) input.value = def.value;
      input.type = def.inputType || 'text';
      if (def.style) Object.assign(input.style, def.style);
      if (def.onChange) {
        input.oninput = (e) => {
          def.onChange(e);
        };
      }
      input.focus();
      parent.appendChild(input);
      return;
    }

    if (def.type === 'button' || def.type === 'paragraph') {
      const el = document.createElement(def.type === 'button' ? 'button' : 'p');
      el.textContent = def.label || def.content || '';
      if (def.style) Object.assign(el.style, def.style);
      if (def.onClick) el.onclick = def.onClick;
      parent.appendChild(el);
      return;
    }

    if (def.type === 'flex' || def.type === 'box') {
      const container = document.createElement('div');
      if (def.type === 'flex') {
        container.style.display = 'flex';
        if (def.direction === 'column') {
          container.style.flexDirection = 'column';
        }
      }
      if (def.gap) container.style.gap = def.gap;
      if (def.alignItems) container.style.alignItems = def.alignItems;
      if (def.style) Object.assign(container.style, def.style);

      if (def.children && Array.isArray(def.children)) {
        def.children.forEach(child => {
          if (child) this.renderComponent(child, container);
        });
      }
      parent.appendChild(container);
      return;
    }

    const el = document.createElement('div');
    if (def.style) Object.assign(el.style, def.style);
    if (def.children && Array.isArray(def.children)) {
      def.children.forEach(child => {
        if (child) this.renderComponent(child, el);
      });
    }
    parent.appendChild(el);
  }

  attachTo(containerElement) {
    this.container = containerElement;
  }
}

function createCommandPalettePatterns(patternDiscovery) {
  return new CommandPalettePatterns(patternDiscovery);
}

export { CommandPalettePatterns, createCommandPalettePatterns };
