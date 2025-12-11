// Validator utility functions for contrast calculation and compliance scoring
export class ValidatorUtils {
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

  getComplianceScore(results) {
    if (results.summary.total === 0) return 100;

    const passedPercentage = (results.summary.passed / results.summary.total) * 100;

    return Math.round(passedPercentage);
  }

  isLevelApplicable(ruleLevel, selectedLevel) {
    const levels = { A: 1, AA: 2, AAA: 3 };
    return levels[ruleLevel] <= levels[selectedLevel];
  }

  calculateSeverity(level) {
    return level === 'A' ? 'error' : 'warning';
  }
}
