export const contentPatterns = {
  'a11y-image': {
    id: 'a11y-image',
    name: 'Accessible Image',
    icon: '🖼️',
    category: 'accessibility',
    codeReduction: '98%',
    wcagLevel: 'A',
    description: 'Image with meaningful alt text',
    issues: ['images', 'text-alternatives'],
    wcagCriteria: ['1.1.1 Non-text Content'],
    tips: [
      'Always provide alt text for content images',
      'Alt text should be descriptive, not "image of..."',
      'Decorative images should have empty alt="" attribute',
      'For complex images, use longdesc or aria-describedby'
    ]
  },
  'a11y-alert': {
    id: 'a11y-alert',
    name: 'Accessible Alert',
    icon: '⚠️',
    category: 'accessibility',
    codeReduction: '93%',
    wcagLevel: 'A',
    description: 'Alert box with proper ARIA roles',
    issues: ['alerts', 'dynamic-content', 'announcements'],
    wcagCriteria: ['4.1.2 Name, Role, Value'],
    tips: [
      'Use role="alert" for important messages',
      'Screen readers will announce alert content automatically',
      'Use role="status" for less urgent messages',
      'Keep alert messages concise and actionable'
    ]
  },
  'a11y-progress': {
    id: 'a11y-progress',
    name: 'Accessible Progress Bar',
    icon: '📈',
    category: 'accessibility',
    codeReduction: '89%',
    wcagLevel: 'A',
    description: 'Progress indicator with ARIA attributes',
    issues: ['progress', 'dynamic-content', 'status'],
    wcagCriteria: ['4.1.2 Name, Role, Value'],
    tips: [
      'Use role="progressbar" for progress indicators',
      'Include aria-valuenow, aria-valuemin, aria-valuemax',
      'Provide aria-label for context',
      'Update aria-valuenow as progress changes'
    ]
  }
};
