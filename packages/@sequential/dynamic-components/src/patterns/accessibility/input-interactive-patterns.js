export const inputInteractivePatterns = {
  'a11y-button': {
    id: 'a11y-button',
    name: 'Accessible Button',
    icon: '🔘',
    category: 'accessibility',
    codeReduction: '85%',
    wcagLevel: 'A',
    description: 'Button with proper semantic markup and keyboard support',
    issues: ['keyboard', 'interaction', 'labeling'],
    wcagCriteria: ['2.1.1 Keyboard', '4.1.2 Name, Role, Value'],
    tips: [
      'Button should have minimum 44px height and width (touch targets)',
      'Always provide meaningful button text, not "Click here"',
      'Use aria-label for icon-only buttons',
      'Ensure keyboard accessibility with Tab key'
    ]
  },
  'a11y-form': {
    id: 'a11y-form',
    name: 'Accessible Form',
    icon: '📝',
    category: 'accessibility',
    codeReduction: '90%',
    wcagLevel: 'A',
    description: 'Form with proper labels, error handling, and keyboard navigation',
    issues: ['forms', 'labeling', 'keyboard', 'error-handling'],
    wcagCriteria: ['1.3.1 Info and Relationships', '3.3.2 Labels or Instructions'],
    tips: [
      'Always associate labels with form inputs using htmlFor',
      'Use aria-describedby for helper text',
      'Provide clear error messages linked to fields',
      'Use input type attribute (email, date, number, etc.)'
    ]
  },
  'a11y-link': {
    id: 'a11y-link',
    name: 'Accessible Link',
    icon: '🔗',
    category: 'accessibility',
    codeReduction: '95%',
    wcagLevel: 'A',
    description: 'Link with descriptive text and focus states',
    issues: ['links', 'focus', 'labeling'],
    wcagCriteria: ['2.1.1 Keyboard', '2.4.4 Link Purpose'],
    tips: [
      'Link text should be descriptive, not "Click here"',
      'Ensure focus indicators are visible',
      'Links should be keyboard accessible',
      'Use title attribute for additional context if needed'
    ]
  }
};
