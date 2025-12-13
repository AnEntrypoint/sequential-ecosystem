/**
 * tree-analyzer.js
 *
 * Component tree analysis and traversal utilities
 */

export class TreeAnalyzer {
  constructor(renderThreshold = 1000) {
    this.renderThreshold = renderThreshold;
  }

  analyzeComponentTree(componentDef) {
    const analysis = {
      totalNodes: 0,
      maxDepth: 0,
      largeSubtrees: [],
      recommendations: []
    };

    this.traverse(componentDef, (node, depth) => {
      analysis.totalNodes++;
      analysis.maxDepth = Math.max(analysis.maxDepth, depth);

      if (this.countDescendants(node) > this.renderThreshold) {
        analysis.largeSubtrees.push({
          type: node.type,
          descendants: this.countDescendants(node)
        });
      }
    });

    this.generateRecommendations(analysis);
    return analysis;
  }

  traverse(node, callback, depth = 0) {
    callback(node, depth);
    if (node.children) {
      const children = Array.isArray(node.children) ? node.children : [node.children];
      children.forEach(child => {
        if (child && typeof child === 'object') {
          this.traverse(child, callback, depth + 1);
        }
      });
    }
  }

  countDescendants(node) {
    let count = 1;
    if (node.children) {
      const children = Array.isArray(node.children) ? node.children : [node.children];
      children.forEach(child => {
        if (child && typeof child === 'object') {
          count += this.countDescendants(child);
        }
      });
    }
    return count;
  }

  generateRecommendations(analysis) {
    if (analysis.totalNodes > 5000) {
      analysis.recommendations.push('Consider breaking large component tree into smaller components');
    }

    if (analysis.maxDepth > 20) {
      analysis.recommendations.push('Component tree nesting is very deep - consider flattening structure');
    }

    if (analysis.largeSubtrees.length > 0) {
      analysis.recommendations.push(`Found ${analysis.largeSubtrees.length} large subtrees - consider virtualization`);
    }
  }
}
