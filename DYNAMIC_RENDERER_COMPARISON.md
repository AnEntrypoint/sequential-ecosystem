# Dynamic Renderer: Static vs Dynamic UI Comparison

## Quick Reference Guide

### Before: Static Hardcoded UI

```jsx
// File: app.jsx (BEFORE)
import React from "react";

export default function App() {
  return (
    <div className="app-container">
      <div className="card">
        <h1>Heading</h1>
      </div>
    </div>
  );
}
```

**Limitations:**
- Components are hardcoded
- Cannot change UI without redeploying code
- No runtime flexibility
- Tight coupling between data and presentation

---

### After: Dynamic Component Rendering

```jsx
// File: app.jsx (AFTER)
import React from "react";
import { DynamicRenderer, ComponentRegistry } from '@sequentialos/dynamic-react-renderer';

// Define components
const Card = ({ title, children }) => (
  <div className="card">
    <h1>{title}</h1>
    {children}
  </div>
);

// Register once at app initialization
ComponentRegistry.register('Card', Card);

// Render dynamically
export default function App() {
  return (
    <div className="app-container">
      <DynamicRenderer
        type="Card"
        props={{
          title: "Dynamic Heading",
          children: <p>Content can now come from anywhere!</p>
        }}
      />
    </div>
  );
}
```

**Benefits:**
- Components loaded by name at runtime
- UI can be defined in config/API/database
- Complete separation of data and presentation
- Hot-swappable components without code changes

---

## Advanced: Config-Driven UI

### Config from API/Database

```jsx
// UI configuration from external source
const uiConfig = {
  type: 'Card',
  props: {
    title: 'Dashboard',
    children: {
      __dynamicComponent: true,
      type: 'TaskList',
      props: {
        tasks: fetchTasksFromAPI(),
        onSelect: handleTaskClick
      }
    }
  }
};

// Entire UI driven by config
export default function App() {
  return <DynamicRenderer {...uiConfig} />;
}
```

---

## Nested Dynamic Components

```jsx
// Complex nested structure - all dynamic
const dashboardConfig = {
  type: 'Dashboard',
  props: {
    header: {
      __dynamicComponent: true,
      type: 'Header',
      props: { title: 'My App', subtitle: 'Welcome back!' }
    },
    sidebar: {
      __dynamicComponent: true,
      type: 'Navigation',
      props: { items: navItems }
    },
    content: {
      __dynamicComponent: true,
      type: 'DataGrid',
      props: { data: gridData, columns: gridColumns }
    }
  }
};

<DynamicRenderer {...dashboardConfig} />
```

---

## Error Handling

### Component Not Found

```jsx
<DynamicRenderer
  type="NonExistentComponent"
  props={{}}
  notFoundFallback={
    <div>
      <p>This component is not available.</p>
      <button onClick={reload}>Reload</button>
    </div>
  }
/>
```

### Rendering Errors

```jsx
<DynamicRenderer
  type="MyComponent"
  props={data}
  fallback={
    <div>
      <p>Error rendering component</p>
      <button onClick={retry}>Retry</button>
    </div>
  }
/>
```

---

## Real-World Use Cases

### 1. Dashboard Builder

Users can configure their own dashboard layout:

```json
{
  "layout": "grid",
  "widgets": [
    { "type": "ChartWidget", "position": "top-left", "data": {...} },
    { "type": "StatsWidget", "position": "top-right", "data": {...} },
    { "type": "TableWidget", "position": "bottom", "data": {...} }
  ]
}
```

### 2. Form Builder

Define forms in configuration:

```json
{
  "type": "Form",
  "fields": [
    { "type": "TextInput", "name": "email", "label": "Email" },
    { "type": "DatePicker", "name": "date", "label": "Date" },
    { "type": "Dropdown", "name": "category", "options": [...] }
  ]
}
```

### 3. A/B Testing

Serve different UIs to different users:

```javascript
const uiVariant = getUserABTestVariant(userId);

const config = uiVariant === 'A'
  ? variantAConfig
  : variantBConfig;

<DynamicRenderer {...config} />
```

### 4. Multi-Tenant UI

Different UI for different tenants:

```javascript
const tenantConfig = await fetchTenantUI(tenantId);

<DynamicRenderer {...tenantConfig} />
```

---

## Component Registry API

### Registration

```javascript
import ComponentRegistry from '@sequentialos/dynamic-react-renderer/ComponentRegistry';

// Register single component
ComponentRegistry.register('MyComponent', MyComponent);

// Register multiple
const components = { Button, Input, Card, Table };
Object.entries(components).forEach(([name, component]) => {
  ComponentRegistry.register(name, component);
});
```

### Querying

```javascript
// Check if component exists
if (ComponentRegistry.has('MyComponent')) {
  // Use it
}

// Get component
const Component = ComponentRegistry.get('MyComponent');

// List all registered
const allComponents = ComponentRegistry.list();
console.log(allComponents); // ['Button', 'Input', 'Card', 'Table']

// Get count
console.log(ComponentRegistry.size); // 4
```

### Cleanup

```javascript
// Unregister single component
ComponentRegistry.unregister('MyComponent');

// Clear all
ComponentRegistry.clear();
```

---

## Migration Checklist

Converting static UI to dynamic:

- [ ] Import DynamicRenderer and ComponentRegistry
- [ ] Extract hardcoded components into separate functions
- [ ] Register all components with ComponentRegistry
- [ ] Replace JSX with DynamicRenderer calls
- [ ] Test component rendering
- [ ] (Optional) Move config to external source
- [ ] (Optional) Add error boundaries
- [ ] (Optional) Add loading states
- [ ] (Optional) Add runtime component switching

---

## Performance Considerations

### Registry Lookup

Component retrieval from registry is O(1) - using a Map internally:

```javascript
// Fast - no performance penalty vs hardcoded imports
const Component = ComponentRegistry.get('MyComponent');
```

### Memory

Registry is a singleton - only one instance exists:

```javascript
// Same instance everywhere
import registry1 from '@sequentialos/dynamic-react-renderer/ComponentRegistry';
import registry2 from '@sequentialos/dynamic-react-renderer/ComponentRegistry';

registry1 === registry2; // true
```

### Lazy Loading

Components can be lazy-loaded:

```javascript
// Register lazily
const LazyComponent = React.lazy(() => import('./MyComponent'));
ComponentRegistry.register('MyComponent', LazyComponent);

// Render with Suspense
<Suspense fallback={<Loading />}>
  <DynamicRenderer type="MyComponent" props={{...}} />
</Suspense>
```

---

## Testing

### Unit Testing

```javascript
import { render, screen } from '@testing-library/react';
import { DynamicRenderer, ComponentRegistry } from '@sequentialos/dynamic-react-renderer';

test('renders dynamic component', () => {
  const TestComponent = ({ text }) => <div>{text}</div>;
  ComponentRegistry.register('TestComponent', TestComponent);

  render(
    <DynamicRenderer
      type="TestComponent"
      props={{ text: 'Hello World' }}
    />
  );

  expect(screen.getByText('Hello World')).toBeInTheDocument();
});
```

### Integration Testing

```javascript
test('renders nested dynamic components', () => {
  const Parent = ({ child }) => <div>{child}</div>;
  const Child = ({ text }) => <span>{text}</span>;

  ComponentRegistry.register('Parent', Parent);
  ComponentRegistry.register('Child', Child);

  const config = {
    type: 'Parent',
    props: {
      child: {
        __dynamicComponent: true,
        type: 'Child',
        props: { text: 'Nested' }
      }
    }
  };

  render(<DynamicRenderer {...config} />);

  expect(screen.getByText('Nested')).toBeInTheDocument();
});
```

---

## Conclusion

DynamicRenderer enables a paradigm shift from hardcoded static UIs to flexible, configuration-driven interfaces. This unlocks powerful capabilities like:

- Runtime UI customization
- User-configurable dashboards
- Multi-tenant applications
- A/B testing
- Feature flags
- Plugin systems

All while maintaining clean, testable code with proper error handling.
