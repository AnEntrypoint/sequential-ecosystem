class PatternLivePreview {
  constructor() {
    this.patterns = new Map();
    this.activePreview = null;
    this.updateInterval = 100;
    this.isRunning = false;
    this.watchers = new Map();
    this.previewCache = new Map();
  }

  init(discovery) {
    this.discovery = discovery;
  }

  registerPattern(patternId, patternDef) {
    this.patterns.set(patternId, {
      id: patternId,
      definition: patternDef,
      updates: 0,
      lastUpdated: Date.now(),
      watchers: []
    });
  }

  updatePattern(patternId, updates) {
    const pattern = this.patterns.get(patternId);
    if (!pattern) return false;

    pattern.definition = { ...pattern.definition, ...updates };
    pattern.updates++;
    pattern.lastUpdated = Date.now();

    this.invalidateCache(patternId);
    this.notifyWatchers(patternId);

    return true;
  }

  watchPattern(patternId, callback) {
    if (!this.watchers.has(patternId)) {
      this.watchers.set(patternId, []);
    }
    this.watchers.get(patternId).push(callback);

    return () => {
      const watchers = this.watchers.get(patternId);
      const idx = watchers.indexOf(callback);
      if (idx > -1) watchers.splice(idx, 1);
    };
  }

  notifyWatchers(patternId) {
    const pattern = this.patterns.get(patternId);
    if (!pattern) return;

    const watchers = this.watchers.get(patternId) || [];
    watchers.forEach(callback => {
      try {
        callback(pattern.definition);
      } catch (e) {
        console.error('Watcher error:', e);
      }
    });
  }

  invalidateCache(patternId) {
    this.previewCache.delete(patternId);
  }

  getPreview(patternId) {
    if (this.previewCache.has(patternId)) {
      return this.previewCache.get(patternId);
    }

    const pattern = this.patterns.get(patternId);
    if (!pattern) return null;

    const preview = this.buildPreview(pattern);
    this.previewCache.set(patternId, preview);
    return preview;
  }

  buildPreview(pattern) {
    return {
      type: 'box',
      style: {
        padding: '16px',
        background: '#2d2d30',
        borderRadius: '6px',
        border: '1px solid #3e3e42',
        position: 'relative'
      },
      children: [
        {
          type: 'heading',
          content: pattern.id,
          level: 3,
          style: {
            margin: '0 0 12px 0',
            fontSize: '13px',
            color: '#e0e0e0'
          }
        },
        this.renderComponentPreview(pattern.definition),
        {
          type: 'flex',
          style: {
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid #3e3e42',
            gap: '8px',
            fontSize: '10px',
            color: '#858585'
          },
          children: [
            {
              type: 'paragraph',
              content: `Updates: ${pattern.updates}`,
              style: { margin: 0 }
            },
            {
              type: 'paragraph',
              content: `Last: ${new Date(pattern.lastUpdated).toLocaleTimeString()}`,
              style: { margin: 0 }
            }
          ]
        }
      ]
    };
  }

  renderComponentPreview(componentDef) {
    if (!componentDef || typeof componentDef !== 'object') {
      return {
        type: 'paragraph',
        content: String(componentDef),
        style: {
          margin: 0,
          fontSize: '12px',
          color: '#d4d4d4'
        }
      };
    }

    const style = {
      padding: '8px 12px',
      background: '#3e3e42',
      borderRadius: '4px',
      color: '#d4d4d4',
      fontSize: '12px',
      minHeight: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    };

    if (componentDef.style) {
      Object.assign(style, componentDef.style);
    }

    return {
      type: componentDef.type || 'box',
      style,
      content: componentDef.content || componentDef.label || componentDef.placeholder,
      children: componentDef.children
        ? (Array.isArray(componentDef.children)
            ? componentDef.children.slice(0, 2).map(c => this.renderComponentPreview(c))
            : [this.renderComponentPreview(componentDef.children)])
        : undefined
    };
  }

  buildLiveEditorPanel() {
    const active = this.activePreview ? this.patterns.get(this.activePreview) : null;

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
          content: '👁️ Live Preview',
          level: 3,
          style: {
            margin: 0,
            fontSize: '12px',
            color: '#e0e0e0',
            textTransform: 'uppercase'
          }
        },
        active
          ? this.buildPreview(active)
          : {
            type: 'paragraph',
            content: 'Select a pattern to preview',
            style: {
              margin: 0,
              fontSize: '12px',
              color: '#858585',
              textAlign: 'center',
              padding: '20px'
            }
          }
      ]
    };
  }

  buildVariantPreview(basePatternId, variantConfig) {
    const base = this.patterns.get(basePatternId);
    if (!base) return null;

    const variantDef = {
      ...base.definition,
      style: {
        ...base.definition.style,
        ...variantConfig.style
      }
    };

    return {
      type: 'box',
      style: {
        padding: '12px',
        background: '#2d2d30',
        borderRadius: '4px',
        border: '1px solid #3e3e42'
      },
      children: [
        this.renderComponentPreview(variantDef),
        {
          type: 'paragraph',
          content: JSON.stringify(variantConfig, null, 2),
          style: {
            margin: '8px 0 0 0',
            fontSize: '10px',
            color: '#858585',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }
        }
      ]
    };
  }

  getDiffReport(patternId) {
    const pattern = this.patterns.get(patternId);
    if (!pattern) return null;

    return {
      patternId,
      totalUpdates: pattern.updates,
      lastUpdated: pattern.lastUpdated,
      definition: pattern.definition,
      watchers: pattern.watchers.length
    };
  }

  getAllPatternStats() {
    const stats = [];
    this.patterns.forEach((pattern, id) => {
      stats.push({
        id,
        updates: pattern.updates,
        watchers: (this.watchers.get(id) || []).length,
        cached: this.previewCache.has(id),
        lastUpdated: pattern.lastUpdated
      });
    });
    return stats.sort((a, b) => b.updates - a.updates);
  }

  startRealTimeUpdates(callback) {
    if (this.isRunning) return;
    this.isRunning = true;

    const interval = setInterval(() => {
      const stats = this.getAllPatternStats();
      if (callback) callback(stats);
    }, this.updateInterval);

    return () => {
      clearInterval(interval);
      this.isRunning = false;
    };
  }

  getCompositionPreview(compositionId, composition) {
    return {
      type: 'box',
      style: {
        padding: '16px',
        background: '#2d2d30',
        borderRadius: '6px',
        border: '2px solid #667eea'
      },
      children: [
        {
          type: 'heading',
          content: `🎨 ${composition.name}`,
          level: 3,
          style: {
            margin: '0 0 12px 0',
            color: '#667eea',
            fontSize: '13px'
          }
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            flexDirection: composition.config.layout === 'horizontal' ? 'row' : 'column',
            gap: composition.config.gap,
            padding: composition.config.padding
          },
          children: composition.patterns.map(p => {
            const pattern = this.patterns.get(p);
            return pattern ? this.buildPreview(pattern) : {
              type: 'box',
              style: {
                padding: '8px',
                background: '#3e3e42',
                borderRadius: '3px',
                color: '#858585',
                fontSize: '11px'
              },
              children: [{ type: 'paragraph', content: `Pattern not found: ${p}`, style: { margin: 0 } }]
            };
          })
        },
        {
          type: 'paragraph',
          content: `Layout: ${composition.config.layout} | Patterns: ${composition.patterns.length}`,
          style: {
            margin: '12px 0 0 0',
            fontSize: '10px',
            color: '#858585',
            paddingTop: '12px',
            borderTop: '1px solid #3e3e42'
          }
        }
      ]
    };
  }
}

function createPatternLivePreview() {
  return new PatternLivePreview();
}
