// WCAG accessibility rules definitions
export class WCAGRules {
  constructor(checkMethods) {
    this.checkMethods = checkMethods;
    this.rules = this.initializeRules();
  }

  initializeRules() {
    return {
      perceivable: [
        {
          id: '1.1.1', level: 'A', title: 'Non-text Content',
          description: 'All non-text content has text alternatives',
          check: (def) => this.checkMethods.checkAltText(def),
          fix: 'Add aria-label or aria-describedby to images and icons'
        },
        {
          id: '1.4.3', level: 'AA', title: 'Contrast (Minimum)',
          description: 'Text has at least 4.5:1 contrast ratio',
          check: (def) => this.checkMethods.checkContrast(def),
          fix: 'Increase text/background contrast to meet WCAG AA standards'
        },
        {
          id: '1.4.11', level: 'AA', title: 'Non-text Contrast',
          description: 'UI components have 3:1 contrast ratio',
          check: (def) => this.checkMethods.checkUIContrast(def),
          fix: 'Ensure UI elements have sufficient contrast'
        }
      ],
      operable: [
        {
          id: '2.1.1', level: 'A', title: 'Keyboard',
          description: 'All functionality available from keyboard',
          check: (def) => this.checkMethods.checkKeyboardAccess(def),
          fix: 'Add tabindex, keyboard event handlers, or use native controls'
        },
        {
          id: '2.1.2', level: 'A', title: 'No Keyboard Trap',
          description: 'Keyboard focus is not trapped',
          check: (def) => this.checkMethods.checkNoKeyboardTrap(def),
          fix: 'Ensure focus can move to all interactive elements'
        },
        {
          id: '2.4.3', level: 'A', title: 'Focus Order',
          description: 'Focus order is logical and meaningful',
          check: (def) => this.checkMethods.checkFocusOrder(def),
          fix: 'Ensure logical tab order for interactive elements'
        },
        {
          id: '2.4.7', level: 'AA', title: 'Focus Visible',
          description: 'Keyboard focus indicator is visible',
          check: (def) => this.checkMethods.checkFocusIndicator(def),
          fix: 'Add outline or visible focus style to interactive elements'
        }
      ],
      understandable: [
        {
          id: '3.1.1', level: 'A', title: 'Language of Page',
          description: 'Page language is specified',
          check: (def) => this.checkMethods.checkLanguage(def),
          fix: 'Add lang attribute to root element'
        },
        {
          id: '3.2.4', level: 'A', title: 'Consistent Identification',
          description: 'Components with same function are identified consistently',
          check: (def) => this.checkMethods.checkConsistency(def),
          fix: 'Use consistent labels and naming for similar components'
        },
        {
          id: '3.3.2', level: 'A', title: 'Labels or Instructions',
          description: 'Form fields have associated labels',
          check: (def) => this.checkMethods.checkLabels(def),
          fix: 'Associate labels with form inputs using label elements or aria-label'
        }
      ],
      robust: [
        {
          id: '4.1.2', level: 'A', title: 'Name, Role, Value',
          description: 'All components have accessible name and role',
          check: (def) => this.checkMethods.checkNameRoleValue(def),
          fix: 'Add appropriate ARIA roles and labels to custom components'
        },
        {
          id: '4.1.3', level: 'A', title: 'Status Messages',
          description: 'Status messages are announced to assistive technology',
          check: (def) => this.checkMethods.checkStatusMessages(def),
          fix: 'Use aria-live regions for dynamic content updates'
        }
      ]
    };
  }

  getRules() {
    return this.rules;
  }
}
