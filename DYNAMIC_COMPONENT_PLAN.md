# Buildless React Dynamic Component System

## Vision
Apps store component definitions as JSX strings in the storage adapter. At runtime, these strings are parsed and executed as React components. No build step required. Full real-time updates via unified storage system.

## Architecture

### Core Concept
```
App Editor (UI Builder)
  ↓ (saves component JSX as string)
Storage Adapter (persisted in database/file)
  ↓ (StateManager broadcasts changes)
RealtimeSync (notifies connected clients)
  ↓
Dynamic Component Loader
  ↓ (parses JSX string at runtime)
React Component Instance
  ↓
Browser renders
```

### Key Components

#### 1. DynamicComponent Package (`@sequential/dynamic-components`)
**Responsibility**: Parse and render JSX strings as React components

**Exports**:
```javascript
export function createComponentContext(baseComponents)
export function useDynamicComponent(componentDef)
export function renderDynamicComponent(jsx, context)
export class DynamicComponentRegistry
export function validateComponentDef(def)
```

**Input**: Component definition object
```javascript
{
  id: 'button-component-1',
  name: 'CustomButton',
  jsx: `
    export default function CustomButton({ label, onClick }) {
      return (
        <button onClick={onClick} className="px-4 py-2">
          {label}
        </button>
      );
    }
  `,
  dependencies: ['react'],
  metadata: {
    version: '1.0',
    author: 'user',
    category: 'ui'
  }
}
```

**Output**: Rendered React component

#### 2. Component Registry (NEW)
Manages available components at runtime

```javascript
class DynamicComponentRegistry {
  constructor(baseComponents = {})

  // Register base components
  registerBase(name, component)

  // Register dynamic components
  registerDynamic(id, jsx, metadata)

  // Get component for rendering
  getComponent(id)

  // Validate JSX syntax
  validate(jsx)

  // Update existing component
  update(id, jsx)

  // List all registered
  list()
}
```

#### 3. Runtime JSX Parser (NEW)
Uses `@babel/standalone` for zero-build-step JSX parsing

**Responsibility**: Convert JSX string to executable function

**Process**:
1. User stores JSX string in storage: `"function MyComp() { return <div>Hello</div> }"`
2. DynamicComponentLoader receives string
3. Parser runs `Babel.transform(jsx, { plugins: ['jsx'] })`
4. Returns JavaScript function
5. Wraps with context providers (theme, storage, etc.)
6. React renders result

**Limitations handled**:
- No imports allowed (security + complexity)
- Access to external components via context only
- Variables scoped to component function

#### 4. Storage Integration (NEW)
Components stored in StateManager

**Storage schema**:
```
Type: 'component'
ID: '{appId}:{componentName}'
Data: {
  id: 'app-1:CustomButton',
  appId: 'app-1',
  name: 'CustomButton',
  jsx: '...',
  metadata: {...},
  version: 1,
  updatedAt: '2025-12-04T...'
}
```

**Auto-broadcast mechanism**:
- Component edited in visual editor
- Editor calls `stateManager.set('component', `${appId}:${name}`, data)`
- StateManager automatically emits 'updated' event
- RealtimeSync broadcasts via `data:component` channel
- Connected clients receive update
- Component re-renders with new JSX

#### 5. Component Editor Integration (FUTURE)
Visual builder interface for designing components

**Flow**:
1. Designer adds elements (button, input, layout)
2. System generates JSX code
3. User can also manually edit JSX
4. Live preview updates
5. Save → Stored in storage
6. Real-time sync to other users

## Implementation Phases

### Phase 1: Core Runtime (2 hours)
**Goals**: Parse and render JSX strings

**Files to create**:
- `packages/@sequential/dynamic-components/src/index.js` - Main export
- `packages/@sequential/dynamic-components/src/parser.js` - JSX parsing
- `packages/@sequential/dynamic-components/src/registry.js` - Component registry
- `packages/@sequential/dynamic-components/src/context.js` - Base component context
- `packages/@sequential/dynamic-components/package.json` - Dependencies (babel, react)
- `packages/@sequential/dynamic-components/test/test-parser.js` - Unit tests

**Key implementation**:
```javascript
import * as Babel from '@babel/standalone';

export function parseJSX(jsxString) {
  const transformed = Babel.transform(jsxString, {
    presets: ['react'],
    compact: false
  });
  return transformed.code;
}

export function createComponentContext(baseComponents = {}) {
  return {
    React,
    ...baseComponents
  };
}

export function useDynamicComponent(componentDef, context) {
  const [component, setComponent] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const code = parseJSX(componentDef.jsx);
      const fn = new Function(...Object.keys(context), `return (${code})`);
      const comp = fn(...Object.values(context));
      setComponent(comp);
    } catch (err) {
      setError(err.message);
    }
  }, [componentDef.jsx]);

  return { component, error };
}
```

### Phase 2: Storage Integration (2 hours)
**Goals**: Load/save components from storage

**Files to update**:
- `packages/desktop-server/src/routes/components.js` (NEW) - API endpoints
- `packages/@sequential/dynamic-components/src/storage.js` (NEW) - Storage adapter

**Endpoints**:
```
GET  /api/components             - List all
GET  /api/components/app/:appId  - List for app
GET  /api/components/:id         - Get specific
POST /api/components             - Create
PATCH /api/components/:id        - Update JSX
DELETE /api/components/:id       - Delete
```

**Flow**:
```javascript
// Save component
const componentData = {
  appId: 'app-1',
  name: 'CustomButton',
  jsx: '...',
  metadata: { ... }
};
await stateManager.set('component', `app-1:CustomButton`, componentData);

// StateManager automatically:
// 1. Persists to storage
// 2. Emits 'updated' event
// 3. RealtimeSync broadcasts
// 4. Clients receive change
// 5. App re-renders with new component
```

### Phase 3: App Integration (2 hours)
**Goals**: Apps can use dynamic components

**Files to update**:
- App SDK - Component loading
- App editor - Save components
- App runtime - Render dynamic components

**Usage in apps**:
```javascript
// In app HTML
<script src="/sdk/dynamic-components.js"></script>

// In app code
const appRuntime = new AppRuntime({
  componentLoader: DynamicComponentLoader
});

// App editor generates and saves component
appRuntime.saveComponent({
  name: 'MyButton',
  jsx: '...'
});

// App renders using dynamic component
<DynamicComponent id="MyButton" {...props} />
```

### Phase 4: Visual Editor (4 hours)
**Goals**: Drag-drop UI builder for components

**Not in this phase** - Can be built separately once Phase 1-3 working

## Technology Stack

### Dependencies
- `@babel/standalone` - JSX parsing (no build needed)
- `react` - Core framework
- `zustand` or `useContext` - Component state
- `class-variance-authority` (optional) - Component styling

### File structure
```
packages/@sequential/dynamic-components/
├── src/
│   ├── index.js           - Main export
│   ├── parser.js          - JSX → JS transformation
│   ├── registry.js        - Component registry
│   ├── context.js         - Base components/utilities
│   ├── hooks.js           - React hooks (useDynamic, etc)
│   ├── storage.js         - Storage integration
│   └── validate.js        - JSX validation
├── test/
│   ├── test-parser.js
│   ├── test-registry.js
│   └── test-storage.js
├── package.json
└── README.md
```

## Security Considerations

**What IS allowed**:
- JSX syntax
- React hooks (useState, useEffect, etc)
- Base components (Button, Input, etc)
- Component props and state
- Template literals and simple JavaScript logic

**What IS NOT allowed**:
- `import` statements (no external packages)
- `eval()` (security risk)
- `fetch()` / `XMLHttpRequest` (use AppSDK instead)
- File system access
- Direct DOM manipulation (`document`, `window` - limited to read)
- `require()` statements

**Implemented via**:
- JSX-only transformation (no `import` handling)
- Sandboxed context (only base components available)
- Strict variable scoping
- Input validation + JSX syntax verification

## Real-Time Updates

**How components update in real-time**:

1. **Component edited in one browser tab**:
   ```javascript
   editor.updateComponent({
     name: 'MyButton',
     jsx: '<button>Updated Label</button>'
   });
   ```

2. **Saved to storage**:
   ```javascript
   await stateManager.set('component', 'app-1:MyButton', data);
   ```

3. **StateManager emits event**:
   ```javascript
   // Automatic via our Phase 1 enhancement
   stateManager.emit('updated', {
     type: 'component',
     id: 'app-1:MyButton',
     data: newData,
     oldData: oldData
   });
   ```

4. **Broadcast middleware broadcasts**:
   ```javascript
   // Automatic via our Phase 1 enhancement
   RealtimeBroadcaster.broadcast('data:component', 'updated', {
     id: 'app-1:MyButton',
     data: newData,
     changes: {...}
   });
   ```

5. **Connected clients receive broadcast**:
   ```javascript
   ws.onmessage = (msg) => {
     if (msg.type === 'updated' && msg.type === 'component') {
       componentRegistry.update(msg.id, msg.data.jsx);
       appComponent.forceUpdate(); // Re-render
     }
   };
   ```

6. **App automatically re-renders**:
   Component is now using new JSX from updated definition

## Success Criteria

- [x] Phase 1: JSX parser works (parse string → React component)
- [x] Phase 1: Component registry functional
- [ ] Phase 2: Components stored in StateManager
- [ ] Phase 2: API endpoints working
- [ ] Phase 3: App SDK integration
- [ ] Phase 3: Real-time updates working end-to-end
- [ ] Phase 4: Visual editor functional (future)
- [ ] Security validation passing

## Buildless Architecture Benefits

1. **No compilation step**: JSX parsed at runtime
2. **Hot component updates**: Change component JSX → see change immediately
3. **Collaborative editing**: Multiple users editing components in real-time
4. **Storage-backed**: Components versioned and persisted
5. **Full integration with unified storage**: Real-time sync automatic
6. **Infinite extensibility**: Users can add any React code as component JSX

## Implementation Order

1. Create `@sequential/dynamic-components` package with parser
2. Test JSX parsing with various component definitions
3. Create storage routes for components
4. Add component endpoints to desktop-server
5. Update AppSDK to load dynamic components
6. Update apps to use dynamic components
7. Hook into realtime sync for live updates
8. Create visual editor (separate effort)

## Next Steps

**Immediate**: Create Phase 1 implementation
- Start with parser.js - test JSX parsing
- Build registry.js - manage components
- Build hooks.js - React integration
- All before Phase 2 (storage integration)

**Success checkpoint**: Can parse a JSX string and render it as a React component in isolation
