// JavaScript code generation from components for migration
export class MigrationCodeGenerator {
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
