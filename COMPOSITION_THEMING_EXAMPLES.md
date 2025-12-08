# Component Composition & Theming Examples

This guide shows practical examples of combining `ComponentComposer`, `ComponentConstraints`, `ComponentVariants`, and `ThemeEngine` to build professional UI systems.

## Example 1: Themed Button with Variants

### Define Constraints

```javascript
import { createConstraints, createVariants, createThemeEngine } from '@sequential/dynamic-components';

const constraints = createConstraints();

constraints.defineConstraint('button', {
  requiredProps: ['label'],
  forbiddenProps: ['children'],
  propRules: {
    label: { type: 'string' },
    variant: { values: ['primary', 'secondary', 'danger', 'outline'] },
    disabled: { type: 'boolean' },
    size: { values: ['sm', 'md', 'lg'] }
  }
});
```

### Define Variants

```javascript
const variants = createVariants(registry);

variants.defineVariant('button', 'primary', {
  variant: 'primary',
  className: 'btn-primary'
}, {
  background: '#667eea',
  color: 'white',
  padding: '8px 16px'
});

variants.defineVariant('button', 'danger', {
  variant: 'danger'
}, {
  background: '#ef4444',
  color: 'white',
  padding: '8px 16px'
});

variants.defineVariant('button', 'outline', {
  variant: 'outline'
}, {
  border: '1px solid #667eea',
  background: 'transparent',
  color: '#667eea'
});
```

### Apply Theme

```javascript
const theme = createThemeEngine();

// Variant uses theme colors
const primaryBtn = variants.applyVariant('button', 'primary');
const themedBtn = {
  ...primaryBtn,
  style: {
    ...primaryBtn.style,
    background: theme.getColor('primary'),
    color: 'white'
  }
};
```

## Example 2: Form Composition with Slots

### Define Form Composition

```javascript
import { createComposer } from '@sequential/dynamic-components';

const composer = createComposer(registry);

composer.createComposition('login-form', {
  header: 'header',
  emailField: 'input',
  passwordField: 'input',
  submitButton: 'button',
  footer: 'footer'
}, {
  header: '<h2>Sign In</h2>',
  emailField: '<input type="email" placeholder="Email" />',
  passwordField: '<input type="password" placeholder="Password" />',
  submitButton: '<button>Login</button>',
  footer: '<p>New user? <a href="/signup">Sign up</a></p>'
});

// Define slots with constraints
composer.defineSlot('login-form', 'emailField', 'Email input field', {
  type: 'object',
  required: true
});

composer.defineSlot('login-form', 'passwordField', 'Password input field', {
  type: 'object',
  required: true
});

composer.defineSlot('login-form', 'submitButton', 'Submit button', {
  type: 'object',
  required: true
});

composer.defineSlot('login-form', 'header', 'Form header', {
  optional: true
});

composer.defineSlot('login-form', 'footer', 'Form footer', {
  optional: true
});
```

### Render Composition

```javascript
const form = composer.renderComposition('login-form', {
  header: bridge.render('heading', { content: 'Welcome Back', level: 2 }),
  emailField: bridge.render('input', { type: 'email', placeholder: 'your@email.com' }),
  passwordField: bridge.render('input', { type: 'password', placeholder: 'Password' }),
  submitButton: bridge.render('button', { label: 'Sign In', variant: 'primary' }),
  footer: bridge.render('paragraph', { content: 'New user? Sign up now' })
});
```

## Example 3: Dashboard with Themed Components

### Setup Theme

```javascript
const theme = createThemeEngine();

// Switch to dark theme
theme.setTheme('dark');

// Or customize theme
theme.overrideColor('primary', '#a78bfa');
theme.overrideColor('background', '#0f172a');

// Subscribe to theme changes
theme.subscribe((themeName, themeConfig) => {
  console.log('Theme changed to:', themeName);
  // Re-render components with new theme
});
```

### Build Dashboard with Themed Components

```javascript
const library = createLibrary(registry);

// Register themed dashboard component
library.registerComponent('dashboard-card', `
  <div style="${buildDashboardCardStyle(theme)}">
    <h3>Metrics</h3>
    <div class="metrics">
      <div>Success Rate: 98%</div>
      <div>Avg Duration: 245ms</div>
      <div>Total Runs: 1,245</div>
    </div>
  </div>
`, {
  category: 'dashboard',
  description: 'Themed dashboard card using theme colors'
});

function buildDashboardCardStyle(theme) {
  return `
    background-color: ${theme.getColor('backgroundLight')};
    color: ${theme.getColor('text')};
    padding: ${theme.getSpacing('lg')};
    border-radius: ${theme.getBorderRadius('lg')};
    border: 1px solid ${theme.getColor('border')};
    box-shadow: ${theme.getShadow('md')};
  `;
}
```

## Example 4: Component Library with Constraints

### Build Type-Safe Component Library

```javascript
const library = createLibrary(registry);
const constraints = createConstraints();

// Register components with constraints
library.registerComponent('heading', headingCode, { category: 'text' });
constraints.defineConstraint('heading', {
  forbiddenProps: ['onClick', 'className'],
  propRules: {
    level: { values: [1, 2, 3, 4, 5, 6] },
    content: { type: 'string' }
  }
});

library.registerComponent('button', buttonCode, { category: 'forms' });
constraints.defineConstraint('button', {
  requiredProps: ['label'],
  propRules: {
    variant: { values: ['primary', 'secondary', 'danger', 'outline'] },
    disabled: { type: 'boolean' },
    onClick: { type: 'function' }
  }
});

library.registerComponent('card', cardCode, { category: 'containers' });
constraints.defineConstraint('card', {
  maxChildren: 10,
  propRules: {
    title: { type: 'string' },
    variant: { values: ['default', 'elevated', 'flat'] }
  }
});
```

### Validate Before Rendering

```javascript
const validation = constraints.validate('button', {
  label: 'Click me',
  variant: 'primary',
  disabled: false
}, []);

if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
} else {
  bridge.render('button', {
    label: 'Click me',
    variant: 'primary',
    disabled: false
  });
}
```

## Example 5: Component Pattern Documentation

### Document Design Pattern

```javascript
import { ComponentPattern } from '@sequential/dynamic-components';

const formPattern = new ComponentPattern(
  'form-validation-pattern',
  'Form with client-side validation and error display'
);

formPattern.addStep(
  'Create form container with flex layout',
  `const form = editor.createComponent('flex', {
    direction: 'column',
    gap: '16px'
  }, null);`
);

formPattern.addStep(
  'Add input field with validation',
  `const input = editor.createComponent('input', {
    placeholder: 'Email address',
    type: 'email'
  }, form.id);`
);

formPattern.addStep(
  'Add error display component',
  `const error = editor.createComponent('error-display', {
    message: 'Please enter a valid email'
  }, form.id);`
);

formPattern.addStep(
  'Add submit button with validation handler',
  `const button = editor.createComponent('button', {
    label: 'Submit'
  }, form.id);`
);

formPattern.addExample('login-form', {
  placeholder: 'user@example.com',
  type: 'email',
  variant: 'primary'
});

// Export pattern
const patternJSON = formPattern.toJSON();
console.log(patternJSON);
```

## Example 6: Real-Time Theme Switching

### Create Theme Switcher

```javascript
const theme = createThemeEngine();
const bridge = await initializeAppRendering('app-dashboard');

// Create theme selector buttons
bridge.render('flex', {
  direction: 'row',
  gap: '12px'
}, 'controls');

bridge.render('button', {
  label: 'Light',
  variant: theme.currentTheme === 'light' ? 'primary' : 'outline',
  onClick: () => {
    theme.setTheme('light');
    bridge.setState('theme', 'light');
  }
}, 'controls');

bridge.render('button', {
  label: 'Dark',
  variant: theme.currentTheme === 'dark' ? 'primary' : 'outline',
  onClick: () => {
    theme.setTheme('dark');
    bridge.setState('theme', 'dark');
  }
}, 'controls');

bridge.render('button', {
  label: 'Default',
  variant: theme.currentTheme === 'default' ? 'primary' : 'outline',
  onClick: () => {
    theme.setTheme('default');
    bridge.setState('theme', 'default');
  }
}, 'controls');

// Subscribe to theme changes
theme.subscribe((themeName) => {
  // Apply theme CSS variables to document
  theme.applyCSSVariables();

  // Update all themed components
  const themeAdapter = createThemeAdapter(theme);
  bridge.setState('themeAdapter', themeAdapter);
});
```

## Example 7: Responsive Dashboard with Composition

### Build Responsive Layout

```javascript
const composer = createComposer(registry);
const theme = createThemeEngine();

composer.createComposition('responsive-dashboard', {
  header: 'header',
  metrics: 'grid',
  chart: 'card',
  details: 'card'
}, {});

composer.defineSlot('responsive-dashboard', 'header', 'Dashboard header', {
  required: true
});

composer.defineSlot('responsive-dashboard', 'metrics', 'Metrics grid', {
  required: true
});

composer.defineSlot('responsive-dashboard', 'chart', 'Chart card', {
  optional: true
});

// Render with responsive grid
const grid = bridge.render('grid', {
  cols: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: theme.getSpacing('lg')
});

const metricCards = [
  { label: 'Total Runs', value: 1245 },
  { label: 'Success Rate', value: '98%' },
  { label: 'Avg Duration', value: '245ms' },
  { label: 'Error Count', value: 28 }
];

metricCards.forEach(metric => {
  bridge.render('metrics-card', {
    label: metric.label,
    value: metric.value
  }, grid);
});
```

## Best Practices

1. **Define Constraints First**: Always define constraints before registering components
2. **Use Variants for Styling**: Variants keep styles organized and theme-aware
3. **Compose with Slots**: Use slots for flexible, reusable compositions
4. **Theme Everything**: Make all color/spacing decisions through theme engine
5. **Subscribe to Changes**: Use theme.subscribe() for reactive updates
6. **Validate Inputs**: Always validate before rendering with constraints.validate()
7. **Export Patterns**: Document and export patterns for team reuse

## Integration with Apps

### In app-task-debugger

```javascript
import { initializeAppRendering, createThemeEngine, createLibrary } from '@sequential/dynamic-components';

const bridge = await initializeAppRendering('app-task-debugger');
const theme = createThemeEngine();
const library = createLibrary(registry);

// Subscribe to metrics updates
bridge.subscribe('metrics', (metrics) => {
  bridge.render('metrics-card', {
    label: 'Success Rate',
    value: metrics.successRate,
    unit: '%',
    style: {
      color: theme.getColor(metrics.successRate > 90 ? 'success' : 'warning')
    }
  });
});

// Render debug timeline with theme
bridge.render('debug-timeline', {
  events: [],
  style: {
    background: theme.getColor('backgroundLight'),
    border: `1px solid ${theme.getColor('border')}`
  }
});
```

### In app-flow-debugger

```javascript
// Use themed components for state visualization
bridge.render('card', {
  title: 'Current State',
  variant: 'elevated',
  style: {
    borderLeft: `4px solid ${theme.getColor('primary')}`
  }
});

// Render state handler with constraints
const stateHandler = {
  name: 'fetchData',
  status: 'running',
  startTime: Date.now()
};

const validation = constraints.validate('state-handler', stateHandler, []);
if (validation.valid) {
  bridge.render('state-handler', stateHandler);
}
```

---

**Result**: Composition + Theming creates a cohesive, maintainable UI system across all apps with centralized styling, reusable patterns, and type-safe component usage.
