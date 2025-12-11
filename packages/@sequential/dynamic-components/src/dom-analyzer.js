// DOM analysis and structure extraction
export class DOMMAnalyzer {
  constructor(mappings = {}) {
    this.mappings = mappings;
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

    const traverse = (node) => {
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
    };

    traverse(el);
    return styles;
  }

  buildStructure(el) {
    if (!el.tagName) return null;

    return {
      tag: el.tagName.toLowerCase(),
      type: this.mappings[el.tagName.toLowerCase()] || el.tagName.toLowerCase(),
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

    const traverse = (node, depth = 0) => {
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
    };

    traverse(el);
    return issues;
  }
}
