import { FormPatternLibrary } from './patterns/forms/index.js';
import { ListPatternLibrary } from './list-patterns.js';
import { ChartPatternLibrary } from './patterns/charts/index.js';
import { TablePatternLibrary } from './table-patterns.js';
import { ModalPatternLibrary } from './modal-patterns.js';
import { GridPatternLibrary } from './grid-patterns.js';

class PatternDiscovery {
  constructor(includeExtended = true) {
    this.libraries = new Map();
    this.allPatterns = [];
    this.index = new Map();
    this.includeExtended = includeExtended;
    this.initializeLibraries();
    this.buildSearchIndex();
  }

  initializeLibraries() {
    const formLib = new FormPatternLibrary();
    const listLib = new ListPatternLibrary();
    const chartLib = new ChartPatternLibrary();
    const tableLib = new TablePatternLibrary();
    const modalLib = new ModalPatternLibrary();
    const gridLib = new GridPatternLibrary();

    this.libraries.set('form', formLib);
    this.libraries.set('list', listLib);
    this.libraries.set('chart', chartLib);
    this.libraries.set('table', tableLib);
    this.libraries.set('modal', modalLib);
    this.libraries.set('grid', gridLib);

    this.allPatterns = [
      ...formLib.getAllPatterns(),
      ...listLib.getAllPatterns(),
      ...chartLib.getAllPatterns(),
      ...tableLib.getAllPatterns(),
      ...modalLib.getAllPatterns(),
      ...gridLib.getAllPatterns()
    ];

    if (this.includeExtended) {
      this.loadExtendedPatterns();
    }
  }

  loadExtendedPatterns() {
    try {
      const ExtendedPatternIntegration = require('./extended-pattern-integration.js').ExtendedPatternIntegration;
      const extLib = new ExtendedPatternIntegration();
      this.libraries.set('extended', extLib);
      this.allPatterns.push(...extLib.getAllPatterns());
    } catch (e) {
    }
  }

  buildSearchIndex() {
    this.allPatterns.forEach((pattern, idx) => {
      const tokens = this.tokenize(
        `${pattern.name} ${pattern.description} ${pattern.tags.join(' ')}`
      );
      tokens.forEach(token => {
        if (!this.index.has(token)) {
          this.index.set(token, []);
        }
        this.index.get(token).push(idx);
      });
    });
  }

  tokenize(text) {
    return text
      .toLowerCase()
      .split(/[\s\-_]+/)
      .filter(t => t.length > 2);
  }

  search(query) {
    if (!query || query.trim().length === 0) {
      return this.allPatterns;
    }

    const tokens = this.tokenize(query);
    const matches = new Map();

    tokens.forEach(token => {
      const indices = this.index.get(token) || [];
      indices.forEach(idx => {
        matches.set(idx, (matches.get(idx) || 0) + 1);
      });
    });

    return Array.from(matches.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([idx]) => this.allPatterns[idx]);
  }

  filterByCategory(category) {
    return this.allPatterns.filter(p => p.category === category);
  }

  filterByCodeReduction(minReduction) {
    return this.allPatterns.filter(p => {
      const reduction = parseInt(p.codeReduction);
      return reduction >= minReduction;
    });
  }

  filterByTags(tags) {
    return this.allPatterns.filter(p =>
      tags.some(tag => p.tags.includes(tag))
    );
  }

  getCategories() {
    const categories = new Set();
    this.allPatterns.forEach(p => categories.add(p.category));
    return Array.from(categories);
  }

  getAllTags() {
    const tags = new Set();
    this.allPatterns.forEach(p => {
      p.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }

  getPatternStats() {
    return {
      totalPatterns: this.allPatterns.length,
      categories: this.getCategories().length,
      averageCodeReduction: this.calculateAverageReduction(),
      mostCommonTags: this.getMostCommonTags(5),
      patternsPerCategory: this.getPatternsPerCategory()
    };
  }

  calculateAverageReduction() {
    const reductions = this.allPatterns.map(p => parseInt(p.codeReduction));
    return Math.round(reductions.reduce((a, b) => a + b, 0) / reductions.length);
  }

  getMostCommonTags(limit) {
    const tagCounts = {};
    this.allPatterns.forEach(p => {
      p.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }));
  }

  getPatternsPerCategory() {
    const counts = {};
    this.allPatterns.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }

  getPattern(id) {
    return this.allPatterns.find(p => p.id === id);
  }

  getRelatedPatterns(patternId, limit = 5) {
    const pattern = this.getPattern(patternId);
    if (!pattern) return [];

    const relatedTags = pattern.tags;
    const related = this.allPatterns
      .filter(p => p.id !== patternId && p.tags.some(t => relatedTags.includes(t)))
      .sort((a, b) => {
        const aMatch = a.tags.filter(t => relatedTags.includes(t)).length;
        const bMatch = b.tags.filter(t => relatedTags.includes(t)).length;
        return bMatch - aMatch;
      })
      .slice(0, limit);

    return related;
  }

  buildDiscoveryUI() {
    const stats = this.getPatternStats();
    return {
      type: 'flex',
      direction: 'column',
      gap: '20px',
      style: { padding: '24px', background: '#fff' },
      children: [
        {
          type: 'heading',
          content: 'Pattern Discovery Hub',
          level: 2,
          style: { margin: '0 0 16px 0' }
        },
        {
          type: 'flex',
          direction: 'row',
          gap: '16px',
          style: { flexWrap: 'wrap' },
          children: [
            {
              type: 'flex',
              direction: 'column',
              gap: '8px',
              style: {
                flex: '1',
                minWidth: '150px',
                padding: '16px',
                background: '#f5f5f5',
                borderRadius: '8px',
                textAlign: 'center'
              },
              children: [
                {
                  type: 'paragraph',
                  content: stats.totalPatterns.toString(),
                  style: { margin: 0, fontSize: '28px', fontWeight: '700', color: '#0078d4' }
                },
                {
                  type: 'paragraph',
                  content: 'Total Patterns',
                  style: { margin: '4px 0 0 0', fontSize: '13px', color: '#666' }
                }
              ]
            },
            {
              type: 'flex',
              direction: 'column',
              gap: '8px',
              style: {
                flex: '1',
                minWidth: '150px',
                padding: '16px',
                background: '#f5f5f5',
                borderRadius: '8px',
                textAlign: 'center'
              },
              children: [
                {
                  type: 'paragraph',
                  content: stats.categories.toString(),
                  style: { margin: 0, fontSize: '28px', fontWeight: '700', color: '#107c10' }
                },
                {
                  type: 'paragraph',
                  content: 'Categories',
                  style: { margin: '4px 0 0 0', fontSize: '13px', color: '#666' }
                }
              ]
            },
            {
              type: 'flex',
              direction: 'column',
              gap: '8px',
              style: {
                flex: '1',
                minWidth: '150px',
                padding: '16px',
                background: '#f5f5f5',
                borderRadius: '8px',
                textAlign: 'center'
              },
              children: [
                {
                  type: 'paragraph',
                  content: `${stats.averageCodeReduction}%`,
                  style: { margin: 0, fontSize: '28px', fontWeight: '700', color: '#d13438' }
                },
                {
                  type: 'paragraph',
                  content: 'Avg Code Reduction',
                  style: { margin: '4px 0 0 0', fontSize: '13px', color: '#666' }
                }
              ]
            }
          ]
        },
        {
          type: 'flex',
          direction: 'column',
          gap: '12px',
          style: { marginTop: '16px' },
          children: [
            {
              type: 'paragraph',
              content: 'Patterns by Category:',
              style: { margin: 0, fontSize: '14px', fontWeight: '600' }
            },
            {
              type: 'flex',
              direction: 'row',
              gap: '8px',
              style: { flexWrap: 'wrap' },
              children: Object.entries(stats.patternsPerCategory).map(([cat, count]) => ({
                type: 'box',
                style: {
                  padding: '8px 12px',
                  background: '#e8f5e9',
                  color: '#2e7d32',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '600'
                },
                children: [
                  {
                    type: 'paragraph',
                    content: `${cat}: ${count}`,
                    style: { margin: 0 }
                  }
                ]
              }))
            }
          ]
        },
        {
          type: 'flex',
          direction: 'column',
          gap: '12px',
          style: { marginTop: '16px' },
          children: [
            {
              type: 'paragraph',
              content: 'Most Used Tags:',
              style: { margin: 0, fontSize: '14px', fontWeight: '600' }
            },
            {
              type: 'flex',
              direction: 'row',
              gap: '8px',
              style: { flexWrap: 'wrap' },
              children: stats.mostCommonTags.map(({ tag, count }) => ({
                type: 'box',
                style: {
                  padding: '8px 12px',
                  background: '#e3f2fd',
                  color: '#0078d4',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '500'
                },
                children: [
                  {
                    type: 'paragraph',
                    content: `${tag} (${count})`,
                    style: { margin: 0 }
                  }
                ]
              }))
            }
          ]
        }
      ]
    };
  }

  buildSearchUI() {
    return {
      type: 'flex',
      direction: 'column',
      gap: '16px',
      style: { padding: '20px' },
      children: [
        {
          type: 'flex',
          direction: 'row',
          gap: '12px',
          style: { alignItems: 'center' },
          children: [
            {
              type: 'paragraph',
              content: '🔍',
              style: { margin: 0, fontSize: '20px' }
            },
            {
              type: 'input',
              placeholder: 'Search patterns by name, category, or tags...',
              style: {
                flex: 1,
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }
            }
          ]
        },
        {
          type: 'flex',
          direction: 'row',
          gap: '8px',
          style: { flexWrap: 'wrap' },
          children: this.getAllTags().slice(0, 8).map(tag => ({
            type: 'button',
            label: tag,
            variant: 'secondary',
            style: {
              padding: '6px 12px',
              background: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '12px'
            }
          }))
        }
      ]
    };
  }
}

function createPatternDiscovery() {
  return new PatternDiscovery();
}

export { PatternDiscovery, createPatternDiscovery };
