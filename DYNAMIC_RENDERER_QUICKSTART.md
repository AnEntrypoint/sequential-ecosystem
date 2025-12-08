# Dynamic React Renderer Quick Start

Jump into using the dynamic React renderer in 5 minutes.

## What Is It?

A component-based UI system for Sequential apps that reduces code by 50%+, provides consistent theming, and enables reactive state management without manual DOM updates.

## Install

Already included in `@sequential/dynamic-components`. Just import:

```javascript
import {
  initializeAppRendering,
  createThemeEngine,
  createLibrary
} from '@sequential/dynamic-components';
```

## Hello World

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
</head>
<body>
  <div id="app"></div>
  <script type="module">
    import { initializeAppRendering } from '@sequential/dynamic-components';

    const bridge = await initializeAppRendering('my-app', '#app');

    // Render components
    bridge.render('heading', { content: 'Hello World', level: 1 });
    bridge.render('button', { label: 'Click Me' });
  </script>
</body>
</html>
```

## 5 Basic Patterns

### 1. Render Components

```javascript
// Text
bridge.render('heading', { content: 'Title', level: 1 });
bridge.render('paragraph', { content: 'Body text' });

// Forms
bridge.render('input', { placeholder: 'Enter name...', type: 'text' });
bridge.render('button', { label: 'Submit', variant: 'primary' });

// Containers
bridge.render('card', { title: 'Card Title', content: 'Card content' });
bridge.render('flex', { direction: 'column', gap: '16px' });
bridge.render('grid', { cols: '1fr 1fr', gap: '12px' });
```

### 2. State Management

```javascript
// Set state
bridge.setState('count', 0);

// Get state
const count = bridge.getState('count');

// Subscribe to changes
bridge.subscribe('count', (newCount) => {
  bridge.render('paragraph', { content: `Count: ${newCount}` });
});
```

### 3. Theme System

```javascript
import { createThemeEngine } from '@sequential/dynamic-components';

const theme = createThemeEngine();

// Switch themes
theme.setTheme('dark');  // or 'light', 'default'

// Use theme values
bridge.render('button', {
  label: 'Click',
  style: {
    background: theme.getColor('primary'),
    padding: theme.getSpacing('lg'),
    borderRadius: theme.getBorderRadius('md')
  }
});

// Subscribe to theme changes
theme.subscribe((themeName) => {
  console.log('Theme changed to:', themeName);
});
```

### 4. Component Composition

```javascript
import { createComposer } from '@sequential/dynamic-components';

const composer = createComposer(registry);

// Define composition with slots
composer.createComposition('login-form', {
  emailField: 'input',
  passwordField: 'input',
  submitButton: 'button'
});

// Render with specific components
const form = composer.renderComposition('login-form', {
  emailField: bridge.render('input', { type: 'email', placeholder: 'Email' }),
  passwordField: bridge.render('input', { type: 'password', placeholder: 'Password' }),
  submitButton: bridge.render('button', { label: 'Login', variant: 'primary' })
});
```

### 5. Constraints & Validation

```javascript
import { createConstraints } from '@sequential/dynamic-components';

const constraints = createConstraints();

// Define constraints
constraints.defineConstraint('button', {
  requiredProps: ['label'],
  propRules: {
    variant: { values: ['primary', 'secondary', 'danger', 'outline'] },
    disabled: { type: 'boolean' }
  }
});

// Validate before rendering
const validation = constraints.validate('button', {
  label: 'Submit',
  variant: 'primary'
}, []);

if (validation.valid) {
  bridge.render('button', { label: 'Submit', variant: 'primary' });
}
```

## Available Components

### Text
- `heading` - Headings (level 1-6)
- `paragraph` - Body text

### Forms
- `input` - Text, email, password, number inputs
- `button` - Buttons with variants

### Layout
- `flex` - Flexbox container
- `grid` - CSS grid container
- `card` - Card container
- `section` - Section container

### Data Display
- `property-list` - Key-value pair display
- `code-block` - Code viewer
- `metrics-card` - Metric display
- `debug-timeline` - Timeline visualization

### Advanced
- `error-display` - Error messages
- `success-display` - Success messages
- `loading-spinner` - Loading indicator
- `badge` - Badge component

## Complete Example: Todo App

```javascript
class TodoApp {
  async init() {
    this.bridge = await initializeAppRendering('todo-app', '#app');
    this.theme = createThemeEngine();
    this.theme.setTheme('dark');

    this.todos = [];
    this.renderUI();
  }

  renderUI() {
    // Header
    this.bridge.render('heading', {
      content: '📋 My Todos',
      level: 1,
      style: { color: this.theme.getColor('primary') }
    });

    // Add todo form
    this.bridge.render('flex', {
      direction: 'row',
      gap: this.theme.getSpacing('sm')
    });

    this.bridge.render('input', {
      id: 'todoInput',
      placeholder: 'Add a new todo...',
      style: { flex: 1 }
    });

    this.bridge.render('button', {
      label: 'Add',
      variant: 'primary',
      onClick: () => this.addTodo()
    });

    // Todo list
    if (this.todos.length === 0) {
      this.bridge.render('paragraph', {
        content: 'No todos yet. Add one above!',
        style: { color: this.theme.getColor('textMuted') }
      });
    } else {
      this.bridge.render('property-list', {
        title: 'Todos',
        items: this.todos.map((todo, idx) => ({
          key: `${idx + 1}. ${todo.text}`,
          value: todo.done ? '✅' : '⭕',
          onClick: () => this.toggleTodo(idx)
        }))
      });
    }
  }

  addTodo() {
    const input = document.getElementById('todoInput');
    if (input?.value?.trim()) {
      this.todos.push({ text: input.value, done: false });
      input.value = '';
      this.renderUI();
    }
  }

  toggleTodo(idx) {
    this.todos[idx].done = !this.todos[idx].done;
    this.renderUI();
  }
}

const app = new TodoApp();
await app.init();
```

## Common Patterns

### Error Handling
```javascript
try {
  const data = await fetch('/api/data');
  bridge.render('code-block', { code: JSON.stringify(data) });
} catch (err) {
  bridge.renderError('Load Failed', err.message);
}
```

### Loading States
```javascript
bridge.renderLoading('Loading data...');
// Later...
const data = await loadData();
bridge.render('property-list', { items: data });
```

### Responsive Layout
```javascript
bridge.render('grid', {
  cols: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: this.theme.getSpacing('lg')
});
```

### Theme Variants
```javascript
const buttonColor = this.theme.getColor(
  status === 'success' ? 'success' : 'danger'
);
bridge.render('button', {
  label: 'Submit',
  style: { background: buttonColor }
});
```

## Learn More

- **Complete Guide**: Read `DYNAMIC_RENDERER_GUIDE.md`
- **Examples**: See `COMPOSITION_THEMING_EXAMPLES.md`
- **Implementation**: Study `APP_TASK_DEBUGGER_MIGRATION.md`
- **Roadmap**: Check `DYNAMIC_RENDERER_INTEGRATION_ROADMAP.md`

## Next Steps

1. **Understand**: Read the Quick Start (this document)
2. **Learn**: Review COMPOSITION_THEMING_EXAMPLES.md
3. **Implement**: Follow APP_FLOW_DEBUGGER_INTEGRATION.md for your app
4. **Extend**: Create custom components as needed
5. **Scale**: Use the integration roadmap for rolling out

## Support

- Check `DYNAMIC_RENDERER_GUIDE.md` for detailed API
- Review working example in `app-task-debugger/dist/dynamic-index.html`
- Refer to component definitions in `packages/@sequential/dynamic-components/src/`

---

**Ready to build with dynamic components?** Start with the Hello World example above and build from there!
