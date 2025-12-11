// Accessibility utilities for contrast calculation and report generation
export class A11yUtils {
  calculateContrast(bgColor, fgColor) {
    const bgLum = this.getLuminance(bgColor);
    const fgLum = this.getLuminance(fgColor);

    const lighter = Math.max(bgLum, fgLum);
    const darker = Math.min(bgLum, fgLum);

    return parseFloat(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
  }

  getLuminance(color = '#ffffff') {
    if (!color || color === 'transparent') return 0;

    const hex = color.replace('#', '');
    const rgb = parseInt(hex, 16);

    const r = (rgb >> 16) & 255;
    const g = (rgb >> 8) & 255;
    const b = rgb & 255;

    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }

  getSeverityCount(issues) {
    return {
      error: issues.filter(i => i.severity === 'error').length,
      warning: issues.filter(i => i.severity === 'warning').length,
      info: issues.filter(i => i.severity === 'info').length
    };
  }

  getWCAGComplianceLevel(issues) {
    const levels = issues.map(i => i.level);

    if (levels.includes('error')) return 'Non-compliant';
    if (levels.some(l => l === 'A')) return 'Level A';
    if (levels.some(l => l === 'AA')) return 'Level AA';
    if (levels.some(l => l === 'AAA')) return 'Level AAA';

    return 'Compliant';
  }

  buildAuditReport(issues) {
    const counts = this.getSeverityCount(issues);
    const wcagLevel = this.getWCAGComplianceLevel(issues);

    return {
      timestamp: Date.now(),
      wcagLevel,
      totalIssues: issues.length,
      bySeverity: counts,
      issues: issues.sort((a, b) => {
        const severityOrder = { error: 0, warning: 1, info: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      })
    };
  }
}
