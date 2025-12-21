# @sequentialos/dynamic-react-renderer

Dynamic React component rendering system with registry pattern for the Sequential ecosystem.

## Features

- **Dynamic Component Registration**: Register React components at runtime without hardcoded imports
- **Type-Safe Rendering**: Render components by name with full prop support
- **Error Boundaries**: Built-in error handling with fallback UI
- **Nested Component Support**: Recursively render dynamic components within props
- **Singleton Registry**: Global component registry accessible throughout the application
- **ES Module Compatible**: Full ES module support for modern Node.js environments

## Installation

This package is part of the Sequential monorepo and is available locally:

```javascript
import DynamicRenderer, { ComponentRegistry } from '@sequentialos/dynamic-react-renderer';
```

## Usage

### 1. Register Components

```javascript
import { ComponentRegistry } from '@sequentialos/dynamic-react-renderer';
import TaskList from './components/TaskList';
import TaskItem from './components/TaskItem';
import Dashboard from './components/Dashboard';

// Register individual components
ComponentRegistry.register('TaskList', TaskList);
ComponentRegistry.register('TaskItem', TaskItem);
ComponentRegistry.register('Dashboard', Dashboard);

// Check registration
console.log(ComponentRegistry.has('TaskList')); // true
console.log(ComponentRegistry.list()); // ['TaskList', 'TaskItem', 'Dashboard']
```

### 2. Render Components Dynamically

```javascript
import DynamicRenderer from '@sequentialos/dynamic-react-renderer';

function App() {
  const handleTaskSelect = (task) => {
    console.log('Selected:', task);
  };

  return (
    <div>
      <DynamicRenderer
        type="TaskList"
        props={{
          tasks: [
            { id: 1, name: 'Build feature' },
            { id: 2, name: 'Write tests' }
          ],
          onSelect: handleTaskSelect
        }}
      />
    </div>
  );
}
```

### 3. Nested Components

```javascript
// Using descriptor objects for nested dynamic components
<DynamicRenderer
  type="Dashboard"
  props={{
    header: {
      __dynamicComponent: true,
      type: 'Header',
      props: { title: 'My Dashboard' }
    },
    content: {
      __dynamicComponent: true,
      type: 'TaskList',
      props: { tasks: [...] }
    }
  }}
/>
```

### 4. Custom Error Handling

```javascript
<DynamicRenderer
  type="TaskList"
  props={{ tasks: [...] }}
  fallback={<div>Error loading component</div>}
  notFoundFallback={<div>Component not registered</div>}
/>
```

## API Reference

### ComponentRegistry

Singleton instance for managing component registration.

#### Methods

- **`register(name: string, component: React.Component)`**
  - Register a component with a unique name
  - Throws if name is invalid or component is missing

- **`get(name: string): React.Component | undefined`**
  - Retrieve a registered component by name
  - Returns undefined if not found

- **`has(name: string): boolean`**
  - Check if a component is registered
  - Returns true if component exists

- **`list(): string[]`**
  - Get array of all registered component names
  - Returns empty array if no components registered

- **`unregister(name: string): boolean`**
  - Remove a component from the registry
  - Returns true if removed, false if not found

- **`clear(): void`**
  - Remove all registered components

- **`size: number`**
  - Get count of registered components

### DynamicRenderer

React component for dynamic rendering.

#### Props

- **`type: string`** (required)
  - Name of the registered component to render

- **`props: object`** (optional)
  - Props to pass to the rendered component
  - Default: `{}`

- **`fallback: React.ReactNode`** (optional)
  - Custom UI to display on rendering errors
  - Default: Built-in error message

- **`notFoundFallback: React.ReactNode`** (optional)
  - Custom UI when component is not found
  - Default: Built-in not-found message with available components list

## Error Handling

The renderer includes automatic error boundaries that catch:

1. **Invalid Type**: Non-string or empty type prop
2. **Component Not Found**: Unregistered component name
3. **Rendering Errors**: Errors during component render

All errors display user-friendly messages with debugging information in development.

## Best Practices

1. **Register Early**: Register all components during app initialization
2. **Consistent Naming**: Use PascalCase for component names (e.g., 'TaskList', not 'task-list')
3. **Type Safety**: Use TypeScript interfaces for props when possible
4. **Error Boundaries**: Provide custom fallbacks for production environments
5. **Component Isolation**: Register only leaf components, not entire pages

## License

MIT
