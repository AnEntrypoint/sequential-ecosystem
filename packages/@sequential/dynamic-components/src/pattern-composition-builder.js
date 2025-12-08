class PatternCompositionBuilder {
  constructor(patternLibraries = {}) {
    this.compositions = new Map();
    this.patternLibraries = patternLibraries;
    this.selectedPatterns = [];
    this.layoutMode = 'grid';
    this.layoutConfig = {
      columns: 2,
      gap: '16px',
      direction: 'row',
      alignItems: 'stretch',
      justifyContent: 'flex-start'
    };
    this.gridConfig = {
      columns: 'repeat(2, 1fr)',
      gap: '16px',
      autoFlow: 'row',
      templateAreas: null
    };
    this.compositionId = null;
    this.listeners = [];
  }

  addPattern(patternId, patternDef, position = null) {
    const pattern = {
      id: patternId,
      definition: JSON.parse(JSON.stringify(patternDef)),
      position: position || this.selectedPatterns.length,
      customizations: {}
    };

    this.selectedPatterns.push(pattern);
    this.notifyListeners('patternAdded', { pattern });

    return this;
  }

  removePattern(patternId) {
    const idx = this.selectedPatterns.findIndex(p => p.id === patternId);
    if (idx >= 0) {
      const removed = this.selectedPatterns.splice(idx, 1)[0];
      this.notifyListeners('patternRemoved', { pattern: removed });
    }

    return this;
  }

  reorderPatterns(fromIndex, toIndex) {
    if (fromIndex < 0 || fromIndex >= this.selectedPatterns.length ||
        toIndex < 0 || toIndex >= this.selectedPatterns.length) {
      return false;
    }

    const [pattern] = this.selectedPatterns.splice(fromIndex, 1);
    this.selectedPatterns.splice(toIndex, 0, pattern);

    this.notifyListeners('patternsReordered', { fromIndex, toIndex });

    return true;
  }

  setLayoutMode(mode) {
    if (!['grid', 'flex', 'stack', 'carousel'].includes(mode)) {
      throw new Error(`Unknown layout mode: ${mode}`);
    }

    this.layoutMode = mode;
    this.notifyListeners('layoutModeChanged', { mode });

    return this;
  }

  updateLayoutConfig(config) {
    this.layoutConfig = { ...this.layoutConfig, ...config };
    this.notifyListeners('layoutConfigChanged', { config: this.layoutConfig });

    return this;
  }

  updateGridConfig(config) {
    this.gridConfig = { ...this.gridConfig, ...config };
    this.notifyListeners('gridConfigChanged', { config: this.gridConfig });

    return this;
  }

  customizePattern(patternId, customizations) {
    const pattern = this.selectedPatterns.find(p => p.id === patternId);
    if (!pattern) return false;

    pattern.customizations = { ...pattern.customizations, ...customizations };
    this.notifyListeners('patternCustomized', { patternId, customizations });

    return true;
  }

  applyPatternVariant(patternId, variantName) {
    const pattern = this.selectedPatterns.find(p => p.id === patternId);
    if (!pattern) return false;

    pattern.variant = variantName;
    this.notifyListeners('variantApplied', { patternId, variantName });

    return true;
  }

  buildComposition() {
    if (this.selectedPatterns.length === 0) {
      return {
        type: 'box',
        style: {
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#f9fafb',
          borderRadius: '6px',
          color: '#6b7280'
        },
        children: [{
          type: 'paragraph',
          content: 'No patterns selected. Add patterns to build composition.',
          style: { margin: 0 }
        }]
      };
    }

    const container = this.buildLayoutContainer();
    const children = this.selectedPatterns.map(p => this.buildPatternElement(p));

    return {
      ...container,
      children
    };
  }

  buildLayoutContainer() {
    switch (this.layoutMode) {
      case 'grid':
        return this.buildGridLayout();
      case 'flex':
        return this.buildFlexLayout();
      case 'stack':
        return this.buildStackLayout();
      case 'carousel':
        return this.buildCarouselLayout();
      default:
        return this.buildGridLayout();
    }
  }

  buildGridLayout() {
    return {
      type: 'grid',
      style: {
        display: 'grid',
        gridTemplateColumns: this.gridConfig.columns,
        gap: this.gridConfig.gap,
        autoFlow: this.gridConfig.autoFlow,
        width: '100%'
      }
    };
  }

  buildFlexLayout() {
    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: this.layoutConfig.direction,
        gap: this.layoutConfig.gap,
        alignItems: this.layoutConfig.alignItems,
        justifyContent: this.layoutConfig.justifyContent,
        width: '100%',
        flexWrap: 'wrap'
      }
    };
  }

  buildStackLayout() {
    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: this.layoutConfig.gap,
        width: '100%'
      }
    };
  }

  buildCarouselLayout() {
    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'row',
        gap: this.layoutConfig.gap,
        overflowX: 'auto',
        width: '100%',
        scrollBehavior: 'smooth'
      }
    };
  }

  buildPatternElement(pattern) {
    const def = JSON.parse(JSON.stringify(pattern.definition));

    if (pattern.customizations && Object.keys(pattern.customizations).length > 0) {
      this.applyCustomizations(def, pattern.customizations);
    }

    return def;
  }

  applyCustomizations(element, customizations) {
    if (customizations.style) {
      element.style = { ...element.style, ...customizations.style };
    }

    if (customizations.props) {
      element.props = { ...element.props, ...customizations.props };
    }

    if (customizations.content) {
      element.content = customizations.content;
    }

    return element;
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
              backgroundColor: this.layoutMode === layout ? '#667eea' : '#e5e7eb',
              color: this.layoutMode === layout ? '#fff' : '#374151',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: this.layoutMode === layout ? 600 : 400
            },
            onClick: () => this.setLayoutMode(layout)
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
          content: `Patterns (${this.selectedPatterns.length})`,
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
          children: this.selectedPatterns.length === 0
            ? [{
              type: 'paragraph',
              content: 'No patterns added',
              style: { margin: 0, fontSize: '11px', color: '#6b7280' }
            }]
            : this.selectedPatterns.map((pattern, idx) => ({
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
                      onClick: () => this.reorderPatterns(idx, idx - 1)
                    } : null,
                    idx < this.selectedPatterns.length - 1 ? {
                      type: 'button',
                      content: '↓',
                      style: {
                        padding: '2px 6px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px'
                      },
                      onClick: () => this.reorderPatterns(idx, idx + 1)
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
                      onClick: () => this.removePattern(pattern.id)
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
        this.layoutMode === 'grid'
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
            { type: 'input', value: this.gridConfig.columns, style: { padding: '4px 8px', fontSize: '11px', flex: 1 } }
          ]
        },
        {
          type: 'box',
          style: { display: 'flex', gap: '8px', alignItems: 'center' },
          children: [
            { type: 'paragraph', content: 'Gap:', style: { margin: 0, fontSize: '11px', flex: '0 0 70px' } },
            { type: 'input', value: this.gridConfig.gap, style: { padding: '4px 8px', fontSize: '11px', flex: 1 } }
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
              value: this.layoutConfig.direction,
              style: { padding: '4px 8px', fontSize: '11px', flex: 1 }
            }
          ]
        },
        {
          type: 'box',
          style: { display: 'flex', gap: '8px', alignItems: 'center' },
          children: [
            { type: 'paragraph', content: 'Gap:', style: { margin: 0, fontSize: '11px', flex: '0 0 70px' } },
            { type: 'input', value: this.layoutConfig.gap, style: { padding: '4px 8px', fontSize: '11px', flex: 1 } }
          ]
        }
      ]
    };
  }

  saveComposition(name) {
    const id = `composition-${Date.now()}`;

    this.compositions.set(id, {
      id,
      name,
      patterns: JSON.parse(JSON.stringify(this.selectedPatterns)),
      layoutMode: this.layoutMode,
      layoutConfig: JSON.parse(JSON.stringify(this.layoutConfig)),
      gridConfig: JSON.parse(JSON.stringify(this.gridConfig)),
      created: Date.now()
    });

    this.compositionId = id;
    this.notifyListeners('compositionSaved', { id, name });

    return id;
  }

  loadComposition(id) {
    const composition = this.compositions.get(id);
    if (!composition) return false;

    this.selectedPatterns = JSON.parse(JSON.stringify(composition.patterns));
    this.layoutMode = composition.layoutMode;
    this.layoutConfig = JSON.parse(JSON.stringify(composition.layoutConfig));
    this.gridConfig = JSON.parse(JSON.stringify(composition.gridConfig));
    this.compositionId = id;

    this.notifyListeners('compositionLoaded', { id, composition });

    return true;
  }

  deleteComposition(id) {
    if (this.compositions.delete(id)) {
      if (this.compositionId === id) {
        this.compositionId = null;
      }

      this.notifyListeners('compositionDeleted', { id });

      return true;
    }

    return false;
  }

  listCompositions() {
    return Array.from(this.compositions.values()).map(c => ({
      id: c.id,
      name: c.name,
      patternCount: c.patterns.length,
      created: c.created
    }));
  }

  exportComposition() {
    if (!this.selectedPatterns || this.selectedPatterns.length === 0) {
      return null;
    }

    return {
      layoutMode: this.layoutMode,
      layoutConfig: this.layoutConfig,
      gridConfig: this.gridConfig,
      patterns: this.selectedPatterns,
      exported: new Date().toISOString()
    };
  }

  importComposition(data) {
    if (!data.patterns || !Array.isArray(data.patterns)) {
      return false;
    }

    this.selectedPatterns = JSON.parse(JSON.stringify(data.patterns));
    this.layoutMode = data.layoutMode || 'grid';
    this.layoutConfig = data.layoutConfig || this.layoutConfig;
    this.gridConfig = data.gridConfig || this.gridConfig;

    this.notifyListeners('compositionImported', { data });

    return true;
  }

  on(event, callback) {
    this.listeners.push({ event, callback });
    return this;
  }

  off(event, callback) {
    this.listeners = this.listeners.filter(
      l => !(l.event === event && l.callback === callback)
    );
    return this;
  }

  notifyListeners(event, data) {
    this.listeners
      .filter(l => l.event === event)
      .forEach(l => {
        try {
          l.callback(data);
        } catch (e) {
          console.error(`Composition listener error for ${event}:`, e);
        }
      });
  }

  clear() {
    this.selectedPatterns = [];
    this.compositions.clear();
    this.compositionId = null;
    return this;
  }

  getState() {
    return {
      selectedPatterns: this.selectedPatterns,
      layoutMode: this.layoutMode,
      layoutConfig: this.layoutConfig,
      gridConfig: this.gridConfig,
      compositions: Array.from(this.compositions.values()),
      currentCompositionId: this.compositionId
    };
  }
}

function createPatternCompositionBuilder(patternLibraries = {}) {
  return new PatternCompositionBuilder(patternLibraries);
}

export { PatternCompositionBuilder, createPatternCompositionBuilder };
