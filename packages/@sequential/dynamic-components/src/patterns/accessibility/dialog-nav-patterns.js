export const dialogNavPatterns = {
  'a11y-modal': {
    id: 'a11y-modal',
    name: 'Accessible Modal',
    icon: '🪟',
    category: 'accessibility',
    codeReduction: '88%',
    wcagLevel: 'AA',
    description: 'Modal dialog with focus management and keyboard support',
    issues: ['keyboard', 'focus', 'structure'],
    wcagCriteria: ['2.1.1 Keyboard', '2.4.3 Focus Order'],
    tips: [
      'Use role="dialog" with aria-modal="true"',
      'Set aria-labelledby to modal title',
      'Trap focus inside modal (Tab cycles within it)',
      'Close on Escape key',
      'Return focus to trigger button when closed'
    ]
  },
  'a11y-navigation': {
    id: 'a11y-navigation',
    name: 'Accessible Navigation',
    icon: '🧭',
    category: 'accessibility',
    codeReduction: '85%',
    wcagLevel: 'A',
    description: 'Navigation menu with keyboard support and landmark',
    issues: ['keyboard', 'structure', 'navigation'],
    wcagCriteria: ['1.3.1 Info and Relationships', '2.4.1 Bypass Blocks'],
    tips: [
      'Use <nav> landmark for main navigation',
      'Use <ul>/<li> for semantic list structure',
      'Links should be keyboard accessible and have :focus styles',
      'Use aria-label for link context if needed'
    ]
  }
};
