class PatternAISuggestions {
  constructor() {
    this.patterns = new Map();
    this.suggestions = [];
    this.analysisCache = new Map();
    this.listeners = [];
    this.rules = this.initializeRules();
  }

  initializeRules() {
    return {
      performance: [
        {
          name: 'Use memoization',
          detect: (pattern) => pattern.definition && pattern.definition.children?.length > 5,
          suggestion: 'This pattern has many children. Consider using composition to reduce re-renders.'
        },
        {
          name: 'Optimize event handlers',
          detect: (pattern) => this.countEventHandlers(pattern) > 3,
          suggestion: 'Too many event handlers. Consider using delegation or event bubbling.'
        },
        {
          name: 'Extract reusable components',
          detect: (pattern) => this.hasDuplicateStructures(pattern),
          suggestion: 'Duplicate structures detected. Extract to reusable pattern.'
        }
      ],
      accessibility: [
        {
          name: 'Add ARIA labels',
          detect: (pattern) => this.missingAriaLabels(pattern),
          suggestion: 'Add aria-label or aria-describedby for better accessibility.'
        },
        {
          name: 'Ensure color contrast',
          detect: (pattern) => this.hasLowContrast(pattern),
          suggestion: 'Color contrast may be too low. Ensure text is readable.'
        },
        {
          name: 'Add keyboard navigation',
          detect: (pattern) => this.missingKeyboardSupport(pattern),
          suggestion: 'Add keyboard event handlers for better accessibility.'
        }
      ],
      design: [
        {
          name: 'Use consistent spacing',
          detect: (pattern) => this.hasInconsistentSpacing(pattern),
          suggestion: 'Spacing values are inconsistent. Use a standard spacing scale.'
        },
        {
          name: 'Apply responsive design',
          detect: (pattern) => !this.hasResponsiveStyles(pattern),
          suggestion: 'Pattern not responsive. Add breakpoint-specific styles.'
        },
        {
          name: 'Improve visual hierarchy',
          detect: (pattern) => !this.hasVisualHierarchy(pattern),
          suggestion: 'Improve visual hierarchy with font sizes and weights.'
        }
      ]
    };
  }

  analyzePattern(patternId, definition) {
    const cacheKey = JSON.stringify(definition);

    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey);
    }

    const analysis = {
      patternId,
      timestamp: Date.now(),
      issues: [],
      suggestions: [],
      score: 100,
      breakdown: {
        performance: 100,
        accessibility: 100,
        design: 100
      }
    };

    Object.entries(this.rules).forEach(([category, categoryRules]) => {
      categoryRules.forEach(rule => {
        if (rule.detect(definition)) {
          analysis.issues.push({
            category,
            rule: rule.name,
            suggestion: rule.suggestion,
            severity: this.calculateSeverity(rule.name)
          });

          analysis.breakdown[category] -= 15;
        }
      });
    });

    analysis.score = Math.max(0, Math.min(100,
      (analysis.breakdown.performance + analysis.breakdown.accessibility + analysis.breakdown.design) / 3
    ));

    this.analysisCache.set(cacheKey, analysis);

    return analysis;
  }

  calculateSeverity(ruleName) {
    const severityMap = {
      'Use memoization': 'info',
      'Optimize event handlers': 'warning',
      'Add ARIA labels': 'error',
      'Ensure color contrast': 'error',
      'Use consistent spacing': 'info',
      'Apply responsive design': 'warning'
    };

    return severityMap[ruleName] || 'info';
  }

  suggestRelatedPatterns(patternId, allPatterns = []) {
    const pattern = this.patterns.get(patternId);
    if (!pattern) return [];

    const suggestions = [];

    allPatterns.forEach(otherPattern => {
      if (otherPattern.id === patternId) return;

      const similarity = this.calculateSimilarity(pattern, otherPattern);
      const complementarity = this.calculateComplementarity(pattern, otherPattern);

      if (similarity > 0.6) {
        suggestions.push({
          type: 'similar',
          patternId: otherPattern.id,
          pattern: otherPattern,
          score: similarity,
          reason: `Similar to "${pattern.name}"`
        });
      }

      if (complementarity > 0.7) {
        suggestions.push({
          type: 'complement',
          patternId: otherPattern.id,
          pattern: otherPattern,
          score: complementarity,
          reason: `Complements "${pattern.name}"`
        });
      }
    });

    return suggestions.sort((a, b) => b.score - a.score).slice(0, 5);
  }

  calculateSimilarity(pattern1, pattern2) {
    let similarity = 0;

    if (pattern1.category === pattern2.category) similarity += 0.3;
    if (pattern1.tags?.some(t => pattern2.tags?.includes(t))) similarity += 0.3;
    if (this.shapeDistance(pattern1.definition, pattern2.definition) < 0.3) similarity += 0.4;

    return Math.min(1, similarity);
  }

  calculateComplementarity(pattern1, pattern2) {
    const layout1 = this.extractLayoutType(pattern1.definition);
    const layout2 = this.extractLayoutType(pattern2.definition);

    if (!layout1 || !layout2) return 0;

    const layoutComplements = {
      grid: ['flex', 'box'],
      flex: ['grid', 'stack'],
      stack: ['flex', 'grid'],
      box: ['grid', 'flex']
    };

    const complements = layoutComplements[layout1] || [];

    return complements.includes(layout2) ? 0.8 : 0.2;
  }

  extractLayoutType(definition) {
    if (!definition) return null;

    if (definition.type === 'grid') return 'grid';
    if (definition.type === 'flex') return 'flex';
    if (definition.style?.display === 'flex' && definition.style?.flexDirection === 'column') return 'stack';

    return 'box';
  }

  shapeDistance(def1, def2) {
    if (!def1 || !def2) return 1;

    const childCount1 = def1.children?.length || 0;
    const childCount2 = def2.children?.length || 0;

    const depthDiff = Math.abs(this.getDepth(def1) - this.getDepth(def2));
    const childDiff = Math.abs(childCount1 - childCount2) / Math.max(childCount1, childCount2, 1);

    return (depthDiff + childDiff) / 2;
  }

  getDepth(definition, current = 0) {
    if (!definition) return current;
    if (!definition.children || definition.children.length === 0) return current;

    const childDepths = definition.children.map(child => this.getDepth(child, current + 1));

    return Math.max(...childDepths);
  }

  suggestOptimizations(patternId, definition) {
    const optimizations = [];

    if (definition.style) {
      if (definition.style.width === '100%' && definition.style.height === '100%') {
        optimizations.push({
          type: 'css',
          suggestion: 'Use flex layout instead of fixed width/height',
          impact: 'medium',
          code: 'style: { display: "flex", flex: 1 }'
        });
      }

      if (definition.style.padding && definition.style.margin) {
        optimizations.push({
          type: 'design',
          suggestion: 'Consider using only margin or padding, not both',
          impact: 'low',
          code: 'Consolidate spacing properties'
        });
      }
    }

    if (definition.children?.length > 10) {
      optimizations.push({
        type: 'performance',
        suggestion: 'Split into smaller components for better performance',
        impact: 'high',
        code: 'Use pattern composition'
      });
    }

    return optimizations;
  }

  countEventHandlers(definition) {
    if (!definition) return 0;

    let count = 0;

    const eventProps = ['onClick', 'onChange', 'onSubmit', 'onFocus', 'onBlur'];
    eventProps.forEach(prop => {
      if (definition[prop]) count++;
    });

    if (definition.children) {
      definition.children.forEach(child => {
        count += this.countEventHandlers(child);
      });
    }

    return count;
  }

  hasDuplicateStructures(definition, seen = new Map()) {
    if (!definition) return false;

    const key = JSON.stringify(definition);

    if (seen.has(key)) {
      return true;
    }

    seen.set(key, true);

    if (definition.children) {
      for (const child of definition.children) {
        if (this.hasDuplicateStructures(child, seen)) {
          return true;
        }
      }
    }

    return false;
  }

  missingAriaLabels(definition) {
    if (!definition) return false;

    const needsLabel = ['button', 'link', 'input'].includes(definition.type);

    if (needsLabel && !definition.attributes?.['aria-label']) {
      return true;
    }

    if (definition.children) {
      return definition.children.some(child => this.missingAriaLabels(child));
    }

    return false;
  }

  hasLowContrast(definition) {
    if (!definition || !definition.style) return false;

    const bgColor = definition.style.backgroundColor || '#ffffff';
    const textColor = definition.style.color || '#000000';

    const luminance1 = this.getRelativeLuminance(bgColor);
    const luminance2 = this.getRelativeLuminance(textColor);

    const contrast = (Math.max(luminance1, luminance2) + 0.05) / (Math.min(luminance1, luminance2) + 0.05);

    return contrast < 4.5;
  }

  getRelativeLuminance(hexColor) {
    const rgb = parseInt(hexColor.replace('#', ''), 16);
    const r = (rgb >> 16) & 255;
    const g = (rgb >> 8) & 255;
    const b = rgb & 255;

    const [rs, gs, bs] = [r, g, b].map(x => {
      x = x / 255;
      return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  missingKeyboardSupport(definition) {
    if (!definition) return false;

    const interactive = ['button', 'input', 'link', 'select'].includes(definition.type);

    if (interactive && !definition.attributes?.tabindex) {
      return true;
    }

    if (definition.children) {
      return definition.children.some(child => this.missingKeyboardSupport(child));
    }

    return false;
  }

  hasInconsistentSpacing(definition, spacingValues = new Set()) {
    if (!definition || !definition.style) return false;

    const spacingProps = ['padding', 'margin', 'gap'];

    spacingProps.forEach(prop => {
      if (definition.style[prop]) {
        spacingValues.add(definition.style[prop]);
      }
    });

    if (definition.children) {
      definition.children.forEach(child => {
        this.hasInconsistentSpacing(child, spacingValues);
      });
    }

    return spacingValues.size > 3;
  }

  hasResponsiveStyles(definition) {
    if (!definition) return false;

    if (definition.style && definition.responsiveStyle) {
      return true;
    }

    if (definition.children) {
      return definition.children.some(child => this.hasResponsiveStyles(child));
    }

    return false;
  }

  hasVisualHierarchy(definition) {
    if (!definition) return false;

    const hasHeadings = definition.type?.includes('heading') || definition.type === 'h1';
    const hasSizing = definition.style?.fontSize && definition.style?.fontWeight;

    if (hasHeadings || hasSizing) {
      return true;
    }

    if (definition.children) {
      return definition.children.some(child => this.hasVisualHierarchy(child));
    }

    return false;
  }

  buildSuggestionUI(patternId) {
    const analysis = this.analysisCache.get(patternId);
    if (!analysis) return null;

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px',
        backgroundColor: '#f9f9f9',
        borderRadius: '6px'
      },
      children: [
        {
          type: 'heading',
          content: `Pattern Score: ${analysis.score}/100`,
          level: 4,
          style: { margin: 0, fontSize: '14px', fontWeight: 600 }
        },
        {
          type: 'box',
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px'
          },
          children: [
            { type: 'text', content: `Performance: ${analysis.breakdown.performance}`, style: { fontSize: '12px' } },
            { type: 'text', content: `Accessibility: ${analysis.breakdown.accessibility}`, style: { fontSize: '12px' } },
            { type: 'text', content: `Design: ${analysis.breakdown.design}`, style: { fontSize: '12px' } }
          ]
        },
        {
          type: 'heading',
          content: 'Suggestions',
          level: 5,
          style: { margin: '12px 0 0 0', fontSize: '12px', fontWeight: 600 }
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          },
          children: analysis.issues.slice(0, 5).map(issue => ({
            type: 'box',
            style: {
              padding: '8px',
              backgroundColor: issue.severity === 'error' ? '#fee' : '#fff',
              border: `1px solid ${issue.severity === 'error' ? '#fcc' : '#ddd'}`,
              borderRadius: '4px',
              fontSize: '12px'
            },
            children: [
              {
                type: 'text',
                content: issue.suggestion,
                style: { fontWeight: 500 }
              }
            ]
          }))
        }
      ]
    };
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
          console.error(`AI suggestions listener error for ${event}:`, e);
        }
      });
  }

  clear() {
    this.patterns.clear();
    this.suggestions = [];
    this.analysisCache.clear();
    this.listeners = [];
    return this;
  }
}

function createPatternAISuggestions() {
  return new PatternAISuggestions();
}

export { PatternAISuggestions, createPatternAISuggestions };
