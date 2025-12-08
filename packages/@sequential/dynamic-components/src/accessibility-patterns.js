class AccessibilityPatternLibrary {
  constructor() {
    this.patterns = new Map();
    this.initializePatterns();
  }

  initializePatterns() {
    this.addPattern(this.createSemanticHeadingPattern());
    this.addPattern(this.createAccessibleButtonPattern());
    this.addPattern(this.createAccessibleFormPattern());
    this.addPattern(this.createAccessibleTablePattern());
    this.addPattern(this.createAccessibleModalPattern());
    this.addPattern(this.createAccessibleNavPattern());
    this.addPattern(this.createAccessibleListPattern());
    this.addPattern(this.createAccessibleLinkPattern());
    this.addPattern(this.createAccessibleImagePattern());
    this.addPattern(this.createAccessibleCardPattern());
    this.addPattern(this.createAccessibleAlertPattern());
    this.addPattern(this.createAccessibleProgressPattern());
  }

  addPattern(pattern) {
    this.patterns.set(pattern.id, pattern);
  }

  getPattern(patternId) {
    return this.patterns.get(patternId);
  }

  getAllPatterns() {
    return Array.from(this.patterns.values());
  }

  getPatternsByWCAGLevel(level) {
    return this.getAllPatterns().filter(p => p.wcagLevel === level);
  }

  getPatternsByIssueType(issueType) {
    return this.getAllPatterns().filter(p => p.issues && p.issues.includes(issueType));
  }

  createSemanticHeadingPattern() {
    return {
      id: 'a11y-semantic-heading',
      name: 'Semantic Heading',
      icon: '📋',
      category: 'accessibility',
      codeReduction: '95%',
      wcagLevel: 'A',
      description: 'Semantically correct heading hierarchy for screen readers',
      issues: ['structure', 'navigation', 'semantics'],
      definition: {
        type: 'heading',
        level: 2,
        content: 'Page Heading',
        role: 'heading',
        style: {
          fontSize: '24px',
          fontWeight: 'bold',
          margin: '16px 0',
          color: '#333'
        }
      },
      wcagCriteria: ['1.3.1 Info and Relationships', '2.4.1 Bypass Blocks'],
      tips: [
        'Use h1 for main page title, h2-h6 for subheadings',
        'Never skip heading levels (e.g., h1 → h3)',
        'Use semantic heading tags, not divs with bold text',
        'Ensure heading content is descriptive'
      ]
    };
  }

  createAccessibleButtonPattern() {
    return {
      id: 'a11y-button',
      name: 'Accessible Button',
      icon: '🔘',
      category: 'accessibility',
      codeReduction: '85%',
      wcagLevel: 'A',
      description: 'Button with proper semantic markup and keyboard support',
      issues: ['keyboard', 'interaction', 'labeling'],
      definition: {
        type: 'button',
        label: 'Click Me',
        role: 'button',
        ariaLabel: 'Descriptive action text',
        style: {
          padding: '10px 20px',
          background: '#0e639c',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          minHeight: '44px',
          minWidth: '44px'
        }
      },
      wcagCriteria: ['2.1.1 Keyboard', '4.1.2 Name, Role, Value'],
      tips: [
        'Button should have minimum 44px height and width (touch targets)',
        'Always provide meaningful button text, not "Click here"',
        'Use aria-label for icon-only buttons',
        'Ensure keyboard accessibility with Tab key'
      ]
    };
  }

  createAccessibleFormPattern() {
    return {
      id: 'a11y-form',
      name: 'Accessible Form',
      icon: '📝',
      category: 'accessibility',
      codeReduction: '90%',
      wcagLevel: 'A',
      description: 'Form with proper labels, error handling, and keyboard navigation',
      issues: ['forms', 'labeling', 'keyboard', 'error-handling'],
      definition: {
        type: 'box',
        children: [
          {
            type: 'box',
            children: [
              {
                type: 'label',
                htmlFor: 'email-input',
                content: 'Email Address',
                style: {
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }
              },
              {
                type: 'input',
                id: 'email-input',
                type: 'email',
                placeholder: 'user@example.com',
                ariaDescribedBy: 'email-hint',
                style: {
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '14px'
                }
              },
              {
                type: 'paragraph',
                id: 'email-hint',
                content: 'We will never share your email',
                style: {
                  fontSize: '12px',
                  color: '#666',
                  marginTop: '4px'
                }
              }
            ]
          }
        ]
      },
      wcagCriteria: ['1.3.1 Info and Relationships', '3.3.2 Labels or Instructions'],
      tips: [
        'Always associate labels with form inputs using htmlFor',
        'Use aria-describedby for helper text',
        'Provide clear error messages linked to fields',
        'Use input type attribute (email, date, number, etc.)'
      ]
    };
  }

  createAccessibleTablePattern() {
    return {
      id: 'a11y-table',
      name: 'Accessible Table',
      icon: '📊',
      category: 'accessibility',
      codeReduction: '80%',
      wcagLevel: 'A',
      description: 'Data table with proper header markup and caption',
      issues: ['tables', 'structure', 'labeling'],
      definition: {
        type: 'box',
        children: [
          {
            type: 'paragraph',
            content: 'Sales Summary',
            style: {
              fontSize: '12px',
              color: '#666',
              marginBottom: '8px'
            }
          },
          {
            type: 'table',
            role: 'table',
            children: [
              {
                type: 'thead',
                children: [
                  {
                    type: 'tr',
                    children: [
                      { type: 'th', content: 'Product', scope: 'col' },
                      { type: 'th', content: 'Q1', scope: 'col' },
                      { type: 'th', content: 'Q2', scope: 'col' }
                    ]
                  }
                ]
              },
              {
                type: 'tbody',
                children: [
                  {
                    type: 'tr',
                    children: [
                      { type: 'td', content: 'Widget A', headers: 'product' },
                      { type: 'td', content: '1000', headers: 'q1' },
                      { type: 'td', content: '1200', headers: 'q2' }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      wcagCriteria: ['1.3.1 Info and Relationships'],
      tips: [
        'Use <th> for headers with scope="col" or scope="row"',
        'Include <caption> or describe-by paragraph',
        'Use headers attribute to link cells to headers'
      ]
    };
  }

  createAccessibleModalPattern() {
    return {
      id: 'a11y-modal',
      name: 'Accessible Modal',
      icon: '🪟',
      category: 'accessibility',
      codeReduction: '88%',
      wcagLevel: 'AA',
      description: 'Modal dialog with focus management and keyboard support',
      issues: ['keyboard', 'focus', 'structure'],
      definition: {
        type: 'box',
        role: 'dialog',
        ariaModal: true,
        ariaLabelledBy: 'modal-title',
        style: {
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        },
        children: [
          {
            type: 'box',
            style: {
              background: 'white',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '500px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
            },
            children: [
              {
                type: 'heading',
                id: 'modal-title',
                content: 'Confirm Action',
                level: 2,
                style: { margin: '0 0 16px 0' }
              },
              {
                type: 'paragraph',
                content: 'Are you sure you want to proceed?',
                style: { margin: '0 0 24px 0' }
              },
              {
                type: 'box',
                style: { display: 'flex', gap: '12px', justifyContent: 'flex-end' },
                children: [
                  {
                    type: 'button',
                    label: 'Cancel',
                    style: { padding: '10px 20px', background: '#eee', border: 'none' }
                  },
                  {
                    type: 'button',
                    label: 'Confirm',
                    style: { padding: '10px 20px', background: '#0e639c', color: 'white', border: 'none' }
                  }
                ]
              }
            ]
          }
        ]
      },
      wcagCriteria: ['2.1.1 Keyboard', '2.4.3 Focus Order'],
      tips: [
        'Use role="dialog" with aria-modal="true"',
        'Set aria-labelledby to modal title',
        'Trap focus inside modal (Tab cycles within it)',
        'Close on Escape key',
        'Return focus to trigger button when closed'
      ]
    };
  }

  createAccessibleNavPattern() {
    return {
      id: 'a11y-navigation',
      name: 'Accessible Navigation',
      icon: '🧭',
      category: 'accessibility',
      codeReduction: '85%',
      wcagLevel: 'A',
      description: 'Navigation menu with keyboard support and landmark',
      issues: ['keyboard', 'structure', 'navigation'],
      definition: {
        type: 'nav',
        style: { padding: '0' },
        children: [
          {
            type: 'ul',
            style: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', gap: '0' },
            children: [
              {
                type: 'li',
                children: [
                  {
                    type: 'a',
                    href: '/',
                    content: 'Home',
                    ariaLabel: 'Home page',
                    style: {
                      display: 'block',
                      padding: '10px 16px',
                      color: '#0e639c',
                      textDecoration: 'none',
                      minHeight: '44px',
                      display: 'flex',
                      alignItems: 'center'
                    }
                  }
                ]
              },
              {
                type: 'li',
                children: [
                  {
                    type: 'a',
                    href: '/about',
                    content: 'About',
                    ariaLabel: 'About us',
                    style: {
                      display: 'block',
                      padding: '10px 16px',
                      color: '#0e639c',
                      textDecoration: 'none',
                      minHeight: '44px',
                      display: 'flex',
                      alignItems: 'center'
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      wcagCriteria: ['1.3.1 Info and Relationships', '2.4.1 Bypass Blocks'],
      tips: [
        'Use <nav> landmark for main navigation',
        'Use <ul>/<li> for semantic list structure',
        'Links should be keyboard accessible and have :focus styles',
        'Use aria-label for link context if needed'
      ]
    };
  }

  createAccessibleListPattern() {
    return {
      id: 'a11y-list',
      name: 'Accessible List',
      icon: '📋',
      category: 'accessibility',
      codeReduction: '90%',
      wcagLevel: 'A',
      description: 'Semantic list with proper markup',
      issues: ['structure', 'semantics'],
      definition: {
        type: 'ul',
        style: { listStyle: 'disc', paddingLeft: '20px' },
        children: [
          { type: 'li', content: 'First item' },
          { type: 'li', content: 'Second item' },
          { type: 'li', content: 'Third item' }
        ]
      },
      wcagCriteria: ['1.3.1 Info and Relationships'],
      tips: [
        'Use <ul> for unordered lists, <ol> for ordered lists',
        'Always use <li> for list items',
        'Don\'t use divs or paragraphs instead of proper list markup'
      ]
    };
  }

  createAccessibleLinkPattern() {
    return {
      id: 'a11y-link',
      name: 'Accessible Link',
      icon: '🔗',
      category: 'accessibility',
      codeReduction: '95%',
      wcagLevel: 'A',
      description: 'Link with descriptive text and focus states',
      issues: ['links', 'focus', 'labeling'],
      definition: {
        type: 'a',
        href: '/example',
        content: 'Learn more about accessibility',
        style: {
          color: '#0e639c',
          textDecoration: 'underline',
          cursor: 'pointer',
          minHeight: '44px',
          display: 'inline-block',
          padding: '2px 4px'
        }
      },
      wcagCriteria: ['2.1.1 Keyboard', '2.4.4 Link Purpose'],
      tips: [
        'Link text should be descriptive, not "Click here"',
        'Ensure focus indicators are visible',
        'Links should be keyboard accessible',
        'Use title attribute for additional context if needed'
      ]
    };
  }

  createAccessibleImagePattern() {
    return {
      id: 'a11y-image',
      name: 'Accessible Image',
      icon: '🖼️',
      category: 'accessibility',
      codeReduction: '98%',
      wcagLevel: 'A',
      description: 'Image with meaningful alt text',
      issues: ['images', 'text-alternatives'],
      definition: {
        type: 'img',
        src: '/example.png',
        alt: 'Descriptive text explaining the image content',
        style: {
          maxWidth: '100%',
          height: 'auto'
        }
      },
      wcagCriteria: ['1.1.1 Non-text Content'],
      tips: [
        'Always provide alt text for content images',
        'Alt text should be descriptive, not "image of..."',
        'Decorative images should have empty alt="" attribute',
        'For complex images, use longdesc or aria-describedby'
      ]
    };
  }

  createAccessibleCardPattern() {
    return {
      id: 'a11y-card',
      name: 'Accessible Card',
      icon: '📇',
      category: 'accessibility',
      codeReduction: '92%',
      wcagLevel: 'AA',
      description: 'Card component with semantic structure',
      issues: ['structure', 'semantics', 'interaction'],
      definition: {
        type: 'article',
        style: {
          padding: '16px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          background: '#f9f9f9'
        },
        children: [
          {
            type: 'heading',
            level: 3,
            content: 'Card Title',
            style: { margin: '0 0 8px 0' }
          },
          {
            type: 'paragraph',
            content: 'Card content goes here',
            style: { margin: '0 0 12px 0' }
          },
          {
            type: 'a',
            href: '#',
            content: 'Learn more',
            style: { color: '#0e639c' }
          }
        ]
      },
      wcagCriteria: ['1.3.1 Info and Relationships'],
      tips: [
        'Use <article> for self-contained content',
        'Include descriptive heading',
        'Ensure interactive elements are keyboard accessible'
      ]
    };
  }

  createAccessibleAlertPattern() {
    return {
      id: 'a11y-alert',
      name: 'Accessible Alert',
      icon: '⚠️',
      category: 'accessibility',
      codeReduction: '93%',
      wcagLevel: 'A',
      description: 'Alert box with proper ARIA roles',
      issues: ['alerts', 'dynamic-content', 'announcements'],
      definition: {
        type: 'div',
        role: 'alert',
        style: {
          padding: '12px',
          borderRadius: '4px',
          background: '#fff3cd',
          border: '1px solid #ffc107',
          color: '#856404'
        },
        children: [
          {
            type: 'paragraph',
            content: '⚠️ This is important information',
            style: { margin: 0 }
          }
        ]
      },
      wcagCriteria: ['4.1.2 Name, Role, Value'],
      tips: [
        'Use role="alert" for important messages',
        'Screen readers will announce alert content automatically',
        'Use role="status" for less urgent messages',
        'Keep alert messages concise and actionable'
      ]
    };
  }

  createAccessibleProgressPattern() {
    return {
      id: 'a11y-progress',
      name: 'Accessible Progress Bar',
      icon: '📈',
      category: 'accessibility',
      codeReduction: '89%',
      wcagLevel: 'A',
      description: 'Progress indicator with ARIA attributes',
      issues: ['progress', 'dynamic-content', 'status'],
      definition: {
        type: 'div',
        role: 'progressbar',
        ariaValueNow: 65,
        ariaValueMin: 0,
        ariaValueMax: 100,
        ariaLabel: 'File upload progress',
        style: {
          width: '100%',
          height: '20px',
          background: '#f0f0f0',
          borderRadius: '4px',
          overflow: 'hidden'
        },
        children: [
          {
            type: 'div',
            style: {
              width: '65%',
              height: '100%',
              background: '#28a745',
              transition: 'width 0.3s'
            }
          }
        ]
      },
      wcagCriteria: ['4.1.2 Name, Role, Value'],
      tips: [
        'Use role="progressbar" for progress indicators',
        'Include aria-valuenow, aria-valuemin, aria-valuemax',
        'Provide aria-label for context',
        'Update aria-valuenow as progress changes'
      ]
    };
  }
}

function createAccessibilityPatternLibrary() {
  return new AccessibilityPatternLibrary();
}

export { AccessibilityPatternLibrary, createAccessibilityPatternLibrary };
