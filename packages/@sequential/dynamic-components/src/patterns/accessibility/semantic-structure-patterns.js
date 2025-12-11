export const semanticStructurePatterns = {
  'a11y-semantic-heading': {
    id: 'a11y-semantic-heading',
    name: 'Semantic Heading',
    icon: '📋',
    category: 'accessibility',
    codeReduction: '95%',
    wcagLevel: 'A',
    description: 'Semantically correct heading hierarchy for screen readers',
    issues: ['structure', 'navigation', 'semantics'],
    wcagCriteria: ['1.3.1 Info and Relationships', '2.4.1 Bypass Blocks'],
    tips: [
      'Use h1 for main page title, h2-h6 for subheadings',
      'Never skip heading levels (e.g., h1 → h3)',
      'Use semantic heading tags, not divs with bold text',
      'Ensure heading content is descriptive'
    ]
  },
  'a11y-list': {
    id: 'a11y-list',
    name: 'Accessible List',
    icon: '📋',
    category: 'accessibility',
    codeReduction: '90%',
    wcagLevel: 'A',
    description: 'Semantic list with proper markup',
    issues: ['structure', 'semantics'],
    wcagCriteria: ['1.3.1 Info and Relationships'],
    tips: [
      'Use <ul> for unordered lists, <ol> for ordered lists',
      'Always use <li> for list items',
      'Don\'t use divs or paragraphs instead of proper list markup'
    ]
  },
  'a11y-table': {
    id: 'a11y-table',
    name: 'Accessible Table',
    icon: '📊',
    category: 'accessibility',
    codeReduction: '80%',
    wcagLevel: 'A',
    description: 'Data table with proper header markup and caption',
    issues: ['tables', 'structure', 'labeling'],
    wcagCriteria: ['1.3.1 Info and Relationships'],
    tips: [
      'Use <th> for headers with scope="col" or scope="row"',
      'Include <caption> or describe-by paragraph',
      'Use headers attribute to link cells to headers'
    ]
  },
  'a11y-card': {
    id: 'a11y-card',
    name: 'Accessible Card',
    icon: '📇',
    category: 'accessibility',
    codeReduction: '92%',
    wcagLevel: 'AA',
    description: 'Card component with semantic structure',
    issues: ['structure', 'semantics', 'interaction'],
    wcagCriteria: ['1.3.1 Info and Relationships'],
    tips: [
      'Use <article> for self-contained content',
      'Include descriptive heading',
      'Ensure interactive elements are keyboard accessible'
    ]
  }
};
