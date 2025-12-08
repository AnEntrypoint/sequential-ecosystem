# Dynamic React Renderer Implementation Guide

The Sequential Ecosystem now provides a unified dynamic rendering system powered by `DynamicComponentRegistry` and `AppRenderingBridge`. This enables building modern, composable UIs across all apps without maintaining separate vanilla DOM rendering code.

## Architecture Overview

### Core Components

1. **DynamicComponentRegistry**: Babel-based JSX transformation engine
   - Registers components as JSX strings
   - Handles caching for performance
   - Provides validation and metadata

2. **AppRenderer**: React DOM integration bridge
   - Renders registered components to DOM
   - Manages React root lifecycle
   - Handles errors gracefully

3. **ComponentBuilder**: Utility for creating layouts and components
   - Built-in layout primitives (flex, grid, stack, section)
   - Built-in form/data components
   - Template-based component generation

4. **AppComponentLibrary**: Shared component registry for all apps
   - Pre-built debug components (timeline, metrics, error display, etc.)
   - Self-contained component definitions
   - Category-based organization

5. **AppRenderingBridge**: High-level integration layer
   - Single initialization point for apps
   - Built-in state management
   - Observer pattern for reactive updates
   - Error handling and loading states

## Quick Start

### Basic Setup

```javascript
// Option 1: Initialize with default root element (#app)
import { initializeAppRendering } from '@sequential/dynamic-components';

const bridge = await initializeAppRendering('app-task-debugger');

// Render a component
bridge.render('metrics-card', {
  label: 'Success Rate',
  value: '98.5%',
  unit: 'of 200 runs'
});
```

### Creating Components

```javascript
// Register a custom component
bridge.registerComponent('my-dashboard', `
  <div style={{padding: '16px', background: '#f5f5f5'}}>
    <h2>{props.title}</h2>
    <p>{props.description}</p>
  </div>
`, {
  category: 'dashboard',
  description: 'Custom dashboard component',
  tags: ['dashboard', 'custom']
});

// Render it
bridge.render('my-dashboard', {
  title: 'My Dashboard',
  description: 'Welcome to the dashboard'
});
```

### State Management

```javascript
// Set state
bridge.setState('executionCount', 42);

// Get state
const count = bridge.getState('executionCount');

// Subscribe to state changes
const unsubscribe = bridge.subscribe('executionCount', (newValue, oldValue) => {
  console.log(`Count changed from ${oldValue} to ${newValue}`);
  // Re-render when state changes
  bridge.render('metrics-card', {
    label: 'Execution Count',
    value: newValue
  });
});

// Unsubscribe when needed
unsubscribe();
```

## Built-in Components

### Debug & Visualization

#### debug-timeline
Animated execution timeline with event markers.

```javascript
bridge.render('debug-timeline', {
  events: [
    { name: 'fetchData', type: 'start' },
    { name: 'processData', type: 'start' },
    { name: 'processData', type: 'complete' },
    { name: 'fetchData', type: 'complete' }
  ]
});
```

#### metrics-card
Single metric display with label, value, and unit.

```javascript
bridge.render('metrics-card', {
  label: 'Response Time',
  value: '245',
  unit: 'ms'
});
```

### Feedback Components

#### error-display
Displays error messages with optional stack traces.

```javascript
bridge.render('error-display', {
  message: 'Failed to process task',
  stack: 'at processTask (index.js:42)\n at runTask (index.js:156)'
});
```

#### success-display
Displays success messages.

```javascript
bridge.render('success-display', {
  message: 'Task completed successfully'
});
```

#### loading-spinner
Animated loading indicator with optional message.

```javascript
bridge.render('loading-spinner', {
  message: 'Processing...'
});
```

### Layout Components

#### button-group
Flexible button group with multiple variants.

```javascript
bridge.render('button-group', {
  buttons: [
    { label: 'Save', variant: 'primary' },
    { label: 'Cancel', variant: 'default' },
    { label: 'Delete', variant: 'danger' }
  ]
});
```

#### property-list
Key-value property list display.

```javascript
bridge.render('property-list', {
  items: [
    { key: 'Status', value: 'Completed' },
    { key: 'Duration', value: '2.45s' },
    { key: 'Memory', value: '45.3 MB' }
  ]
});
```

#### section-header
Section header with optional icon and badge.

```javascript
bridge.render('section-header', {
  icon: '🔍',
  title: 'Execution Details',
  badge: '5 items'
});
```

#### two-column-layout
Responsive two-column layout.

```javascript
bridge.render('two-column-layout', {
  left: '<div>Left content</div>',
  right: '<div>Right content</div>',
  ratio: '300px 1fr',
  gap: '20px'
});
```

### Data Components

#### code-block
Code display with syntax highlighting.

```javascript
bridge.render('code-block', {
  code: `const result = await __callHostTool__('db', 'query', input);
return { success: true, result };`
});
```

#### badge
Colored badge with label.

```javascript
bridge.render('badge', {
  label: 'Production',
  color: '#667eea',
  textColor: '#ffffff'
});
```

## Integration Patterns

### Pattern 1: Metrics Dashboard

```javascript
class MetricsDashboard {
  constructor(bridge) {
    this.bridge = bridge;
  }

  initialize() {
    this.bridge.renderLoading('Initializing metrics...');
  }

  renderMetrics(data) {
    const metricsHTML = `
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
        <div>${this.bridge.renderComponent('metrics-card', {
          label: 'Success Rate',
          value: data.successRate,
          unit: '%'
        })}</div>
        <div>${this.bridge.renderComponent('metrics-card', {
          label: 'Avg Duration',
          value: data.avgDuration,
          unit: 'ms'
        })}</div>
      </div>
    `;
    this.bridge.render('dashboard-container', { content: metricsHTML });
  }

  async loadData() {
    try {
      this.bridge.renderLoading('Loading metrics...');
      // Fetch data
      const data = await fetchMetrics();
      this.renderMetrics(data);
    } catch (err) {
      this.bridge.renderError('Metrics Error', err.message);
    }
  }
}
```

### Pattern 2: Real-time Updates

```javascript
const bridge = await initializeAppRendering('app-run-observer');

// Subscribe to execution events
socket.on('execution:update', (event) => {
  bridge.setState('currentExecution', event);

  // Re-render timeline with updated events
  const events = bridge.getState('executionEvents') || [];
  events.push(event);
  bridge.setState('executionEvents', events);

  bridge.render('debug-timeline', { events });
});
```

### Pattern 3: Progressive Enhancement

```javascript
// Start with loading state
bridge.renderLoading('Initializing...');

// Initialize components progressively
await bridge.getComponentLibrary().getRegistry()
  .register('custom-component', customComponentCode);

// Show initial UI
bridge.render('section-header', {
  title: 'App Ready',
  badge: 'Loaded'
});
```

## Migration Guide: From Vanilla DOM to Dynamic Renderer

### Before (Vanilla DOM)

```javascript
// Old way: String concatenation and innerHTML
const metricsHTML = `
  <div class="metrics-card">
    <div class="metric-label">Success Rate</div>
    <div class="metric-value">${data.successRate}%</div>
  </div>
`;
document.getElementById('metrics').innerHTML = metricsHTML;
```

### After (Dynamic Renderer)

```javascript
// New way: Component-based
bridge.render('metrics-card', {
  label: 'Success Rate',
  value: data.successRate,
  unit: '%'
});
```

### Benefits

- **No more HTML strings**: Components are JSX code
- **Type-safe props**: Validation at render time
- **Reactive updates**: State changes trigger re-renders
- **Reusable**: Same components across all apps
- **Maintainable**: Centralized component definitions
- **Testable**: Components are pure functions

## Advanced Usage

### Custom Validators

```javascript
bridge.registerComponent('validated-input', `
  <input
    type="text"
    placeholder="Enter email"
    style={{padding: '8px 12px', border: '1px solid #ccc'}}
  />
`, {
  category: 'forms',
  validator: (props) => {
    if (props.value && !props.value.includes('@')) {
      throw new Error('Invalid email format');
    }
    return true;
  }
});
```

### Context Passing

```javascript
// Set context for all renders
bridge.setContext({
  theme: 'dark',
  locale: 'en-US'
});

// Context is available in component props
bridge.render('my-component', {
  title: 'Hello',
  // Context merges with props
});
```

### Component Library Exploration

```javascript
// List all available components
const allComponents = bridge.getRegistry().list();
console.log('Available components:', allComponents);

// Search for components
const metrics = bridge.getComponentLibrary().search('metrics');
console.log('Metrics components:', metrics);

// List by category
const debugComponents = bridge.getComponentLibrary().listByCategory('debug');
console.log('Debug components:', debugComponents);
```

## Performance Considerations

1. **Component Caching**: Components are cached by name + props JSON
2. **Lazy Registration**: Register components only when needed
3. **Batch Updates**: Update multiple state values before re-render
4. **Observable Patterns**: Use subscriptions for partial updates

## Error Handling

```javascript
try {
  bridge.render('my-component', props);
} catch (err) {
  bridge.renderError('Component Error', err.message);
  console.error('Render error:', err);
}
```

## Testing

```javascript
// Test component registration
const registry = bridge.getRegistry();
const component = registry.components.get('my-component');
expect(component).toBeDefined();

// Test rendering
const result = bridge.renderComponent('my-component', {
  label: 'Test'
});
expect(result).not.toBeNull();

// Test state management
bridge.setState('test', 'value');
expect(bridge.getState('test')).toBe('value');
```

## Roadmap

- [ ] Server-side rendering support
- [ ] Component hot-reload
- [ ] Visual component editor integration
- [ ] Storybook integration
- [ ] Animation/transition support
- [ ] Dark mode theming system
- [ ] Accessibility audit tools

## Examples

See `/packages/@sequential/dynamic-components/examples/` for complete working examples:
- Basic counter app
- Metrics dashboard
- Real-time task executor
- File browser with dynamic tree
- Chat interface

---

**Questions or Issues?**
- Check existing components in `app-components.js`
- Review integration patterns above
- Reference the test suite for usage examples
