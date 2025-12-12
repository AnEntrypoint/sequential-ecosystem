/**
 * composition-operations.js - Composition CRUD and manipulation
 *
 * Create, read, update, delete, and manipulate pattern compositions
 */

export class CompositionOperations {
  constructor(compositions, discovery) {
    this.compositions = compositions;
    this.discovery = discovery;
  }

  createComposition(id, name, patterns, config = {}) {
    const composition = {
      id,
      name,
      icon: config.icon || '🎨',
      category: config.category || 'composition',
      description: config.description || `Composition of ${patterns.length} patterns`,
      patterns,
      config: {
        layout: config.layout || 'vertical',
        gap: config.gap || '16px',
        padding: config.padding || '16px',
        ...config
      },
      codeReduction: this.calculateCompositionReduction(patterns),
      tags: config.tags || ['composition'],
      author: 'system',
      created: new Date().toISOString()
    };
    this.compositions.set(id, composition);
    return composition;
  }

  calculateCompositionReduction(patterns) {
    if (patterns.length === 0) return '0%';
    const reductions = patterns.map(p => {
      if (typeof p === 'string') {
        const found = this.discovery.getPattern?.(p);
        return found ? parseInt(found.codeReduction) : 0;
      }
      return parseInt(p.codeReduction) || 0;
    });
    const avg = Math.round(reductions.reduce((a, b) => a + b, 0) / reductions.length);
    return `${avg}%`;
  }

  buildCompositionComponent(compositionId) {
    const composition = this.compositions.get(compositionId);
    if (!composition) return null;

    const patternComponents = composition.patterns.map(p => {
      const pattern = typeof p === 'string' ? this.discovery.getPattern?.(p) : p;
      return pattern ? pattern.definition : { type: 'paragraph', content: 'Pattern not found' };
    });

    const direction = composition.config.layout === 'horizontal' ? 'row' : 'column';

    return {
      type: 'flex',
      direction,
      gap: composition.config.gap,
      style: {
        padding: composition.config.padding,
        ...composition.config.style
      },
      children: patternComponents
    };
  }

  nestPattern(parentId, childPattern, position = -1) {
    const parent = this.compositions.get(parentId);
    if (!parent) return false;

    if (position < 0) {
      parent.patterns.push(childPattern);
    } else {
      parent.patterns.splice(position, 0, childPattern);
    }

    return true;
  }

  removePatternFromComposition(compositionId, patternIndex) {
    const composition = this.compositions.get(compositionId);
    if (!composition) return false;
    composition.patterns.splice(patternIndex, 1);
    return true;
  }

  reorderPatterns(compositionId, fromIndex, toIndex) {
    const composition = this.compositions.get(compositionId);
    if (!composition) return false;
    const [item] = composition.patterns.splice(fromIndex, 1);
    composition.patterns.splice(toIndex, 0, item);
    return true;
  }

  updateCompositionConfig(compositionId, config) {
    const composition = this.compositions.get(compositionId);
    if (!composition) return false;
    composition.config = { ...composition.config, ...config };
    return true;
  }

  getComposition(id) {
    return this.compositions.get(id);
  }

  getAllCompositions() {
    return Array.from(this.compositions.values());
  }

  deleteComposition(id) {
    return this.compositions.delete(id);
  }

  exportComposition(id) {
    const composition = this.compositions.get(id);
    if (!composition) return null;
    return {
      composition,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
  }

  importComposition(data) {
    if (!data.composition) return false;
    const { id, name, patterns, config } = data.composition;
    this.createComposition(id, name, patterns, config);
    return true;
  }
}
