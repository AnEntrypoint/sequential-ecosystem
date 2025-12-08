export class DOMtoComponentMigrator {
  constructor() {
    this.mappings = new Map();
    this.initializeDefaultMappings();
  }

  initializeDefaultMappings() {
    this.mappings.set('div', 'flex');
    this.mappings.set('button', 'button');
    this.mappings.set('input', 'input');
    this.mappings.set('textarea', 'textarea');
    this.mappings.set('select', 'select');
    this.mappings.set('h1', 'heading');
    this.mappings.set('h2', 'heading');
    this.mappings.set('h3', 'heading');
    this.mappings.set('p', 'paragraph');
    this.mappings.set('span', 'paragraph');
    this.mappings.set('img', 'image');
    this.mappings.set('ul', 'list');
    this.mappings.set('ol', 'list');
    this.mappings.set('li', 'list-item');
    this.mappings.set('table', 'data-table');
    this.mappings.set('form', 'flex');
  }

  analyzeHTML(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const root = doc.body.firstChild;

    return {
      elementCount: this.countElements(root),
      styles: this.extractStyles(root),
      structure: this.buildStructure(root),
      issues: this.analyzeIssues(root)
    };
  }

  countElements(el) {
    let count = 1;
    if (el.children) {
      for (const child of el.children) {
        count += this.countElements(child);
      }
    }
    return count;
  }

  extractStyles(el) {
    const styles = new Map();

    function traverse(node) {
      if (node.style) {
        const key = node.tagName;
        if (!styles.has(key)) {
          styles.set(key, []);
        }
        styles.get(key).push({
          selector: node.className || node.id || key,
          styles: node.style.cssText
        });
      }
      if (node.children) {
        for (const child of node.children) {
          traverse(child);
        }
      }
    }

    traverse(el);
    return styles;
  }

  buildStructure(el) {
    if (!el.tagName) return null;

    return {
      tag: el.tagName.toLowerCase(),
      type: this.mappings.get(el.tagName.toLowerCase()) || el.tagName.toLowerCase(),
      className: el.className,
      id: el.id,
      content: el.textContent?.trim() || '',
      props: this.extractProps(el),
      style: this.extractInlineStyle(el),
      children: Array.from(el.children || []).map(child => this.buildStructure(child))
    };
  }

  extractProps(el) {
    const props = {};
    for (const attr of el.attributes || []) {
      if (!['class', 'id', 'style'].includes(attr.name)) {
        props[attr.name] = attr.value;
      }
    }
    return props;
  }

  extractInlineStyle(el) {
    const style = {};
    if (el.style && el.style.cssText) {
      el.style.cssText.split(';').forEach(rule => {
        const [key, value] = rule.split(':');
        if (key && value) {
          const camelKey = key.trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
          style[camelKey] = value.trim();
        }
      });
    }
    return style;
  }

  analyzeIssues(el) {
    const issues = [];

    function traverse(node, depth = 0) {
      if (depth > 10) {
        issues.push({ type: 'depth', message: 'Deep nesting detected (>10 levels)' });
      }

      if (node.style && node.style.position === 'absolute') {
        issues.push({
          type: 'layout',
          message: 'Absolute positioning detected - consider using flex/grid'
        });
      }

      if (node.children && node.children.length > 50) {
        issues.push({
          type: 'complexity',
          message: `Too many children (${node.children.length}) - consider pagination`
        });
      }

      if (node.children) {
        for (const child of node.children) {
          traverse(child, depth + 1);
        }
      }
    }

    traverse(el);
    return issues;
  }

  convertToComponent(structure) {
    if (!structure) return null;

    const component = {
      type: structure.type,
      props: { ...structure.props },
      style: { ...structure.style },
      children: structure.children
        .filter(child => child)
        .map(child => this.convertToComponent(child))
    };

    if (structure.content && !component.children.length) {
      component.content = structure.content;
    }

    return component;
  }

  generateCode(component) {
    const lines = [];
    lines.push('const component = ' + this.componentToJavaScript(component) + ';');
    lines.push('bridge.render("flex", component);');
    return lines.join('\n');
  }

  componentToJavaScript(comp, indent = 0) {
    const spaces = '  '.repeat(indent);
    const nextSpaces = '  '.repeat(indent + 1);

    let str = '{\n';
    str += `${nextSpaces}type: '${comp.type}',\n`;

    if (Object.keys(comp.props).length) {
      str += `${nextSpaces}props: ${JSON.stringify(comp.props)},\n`;
    }

    if (Object.keys(comp.style).length) {
      str += `${nextSpaces}style: ${JSON.stringify(comp.style)},\n`;
    }

    if (comp.content) {
      str += `${nextSpaces}content: '${comp.content.replace(/'/g, "\\'")}',\n`;
    }

    if (comp.children && comp.children.length) {
      str += `${nextSpaces}children: [\n`;
      comp.children.forEach((child, idx) => {
        str += `${this.componentToJavaScript(child, indent + 2)}${idx < comp.children.length - 1 ? ',' : ''}\n`;
      });
      str += `${nextSpaces}]\n`;
    }

    str += `${spaces}}`;
    return str;
  }

  generateMigrationReport(analysis) {
    return {
      summary: {
        totalElements: analysis.elementCount,
        estimatedReduction: `${Math.round(analysis.elementCount * 0.4)}+ lines`,
        migrationComplexity: this.assessComplexity(analysis.issues)
      },
      issues: analysis.issues,
      stylePatterns: Array.from(analysis.styles.entries()).map(([tag, styles]) => ({
        tag,
        patterns: [...new Set(styles.map(s => s.styles))]
      })),
      recommendations: this.getRecommendations(analysis)
    };
  }

  assessComplexity(issues) {
    if (issues.length === 0) return 'LOW';
    if (issues.length <= 2) return 'MEDIUM';
    return 'HIGH';
  }

  getRecommendations(analysis) {
    const recs = [];

    if (analysis.issues.some(i => i.type === 'layout')) {
      recs.push('Replace position: absolute with flex/grid layouts for responsive design');
    }

    if (analysis.issues.some(i => i.type === 'depth')) {
      recs.push('Flatten component hierarchy to improve maintainability');
    }

    if (analysis.issues.some(i => i.type === 'complexity')) {
      recs.push('Use pagination or virtualization for large lists');
    }

    if (analysis.elementCount > 100) {
      recs.push('Consider splitting into multiple components for better reusability');
    }

    return recs;
  }
}

export class ComponentDocGenerator {
  constructor(registry) {
    this.registry = registry;
  }

  generateComponentDocs(componentName) {
    const meta = this.registry.metadata.get(componentName);

    return {
      name: componentName,
      description: meta?.description || '',
      category: meta?.category || 'uncategorized',
      usage: this.generateUsageExample(componentName),
      props: this.extractProps(componentName),
      relatedComponents: this.findRelated(componentName)
    };
  }

  generateUsageExample(componentName) {
    const examples = {
      'button': `const button = {
  type: 'button',
  label: 'Click me',
  onClick: () => handleClick(),
  variant: 'primary'
};`,
      'input': `const input = {
  type: 'input',
  placeholder: 'Enter text',
  value: '',
  onChange: (value) => setState(value)
};`,
      'card': `const card = {
  type: 'card',
  title: 'Card Title',
  variant: 'default',
  children: [...]
};`,
      'flex': `const layout = {
  type: 'flex',
  direction: 'row',
  gap: '16px',
  children: [...]
};`,
      'grid': `const grid = {
  type: 'grid',
  cols: 'repeat(3, 1fr)',
  gap: '16px',
  children: [...]
};`
    };

    return examples[componentName] || `const ${componentName} = {
  type: '${componentName}',
  // Add props here
};`;
  }

  extractProps(componentName) {
    const commonProps = ['className', 'style', 'onClick', 'onChange'];

    const typeSpecificProps = {
      'button': ['label', 'variant', 'disabled', 'onClick'],
      'input': ['placeholder', 'type', 'value', 'onChange', 'disabled'],
      'card': ['title', 'variant', 'children'],
      'heading': ['content', 'level'],
      'select': ['options', 'value', 'onChange']
    };

    return [...commonProps, ...(typeSpecificProps[componentName] || [])];
  }

  findRelated(componentName) {
    const relationships = {
      'button': ['link', 'toggle-switch'],
      'input': ['textarea', 'select', 'multi-select'],
      'card': ['panel-group', 'container'],
      'flex': ['grid', 'stack', 'container'],
      'heading': ['paragraph', 'section-header']
    };

    return relationships[componentName] || [];
  }
}

export const createDOMtoComponentMigrator = () => new DOMtoComponentMigrator();
export const createComponentDocGenerator = (registry) => new ComponentDocGenerator(registry);
