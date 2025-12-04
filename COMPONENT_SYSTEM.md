# Dynamic Component System

## Overview

The Dynamic Component System enables **buildless React development** with components stored as JSX strings in the storage adapter. Components are compiled at runtime using Babel @babel/standalone, allowing full React support without build steps.

## Architecture

### Three Core Systems

**1. Component Storage** (`@sequential/persistent-state`)
- All components persisted via unified StateManager
- Automatic real-time broadcasts on changes
- Type: `component` in storage

**2. Component Rendering** (`@sequential/dynamic-components`)
- JSX parser with Babel transformation
- System context providers (Theme, Session, System)
- Boundary components (Error, Loading, Viewport)
- React hooks for accessing sequential-os services

**3. Visual Builder** (`component-builder.html`)
- Drag-and-drop component composition
- Property editing panels
- Real-time canvas preview
- Save components to storage

## Using Components in Apps

### 1. Load Components from Storage

```javascript
const componentRenderer = new DynamicComponentRenderer();
await componentRenderer.loadComponents();

// Get list of available components
const components = componentRenderer.listComponents();
```

### 2. Render a Component

```javascript
// To an HTML element
componentRenderer.renderToElement('target-element-id', 'card', {
  title: 'My Card',
  content: 'Card content here'
});
```

### 3. Use System Hooks in Components

When components are rendered with `SystemProvider`, they access:

```javascript
// Inside a component that inherits from system
const system = useSystem();           // All system services
const storage = useStorage();         // StateManager API
const realtime = useRealtime();       // Real-time broadcasts
const sdk = useAppSDK();              // Tool execution, data ops
const auth = useAuth();               // Authentication context
const request = useRequestContext();  // Request metadata
const errors = useErrorHandler();     // Error logging
```

## Available Example Components

### Card
Displays content in a styled container.
```javascript
<Component name="Card" title="Title" content="Content" />
```

### Button
Clickable button with variants.
```javascript
<Component name="Button" label="Click Me" variant="primary" />
```

### Badge
Small label badge.
```javascript
<Component name="Badge" label="New" color="#667eea" />
```

### Metric
Display key metrics.
```javascript
<Component name="Metric Card" label="Users" value="1,234" />
```

### Text Input
Text field for user input.
```javascript
<Component name="Text Input" placeholder="Enter text..." />
```

### Alert
Alert messages.
```javascript
<Component name="Alert" type="success" message="Operation successful" />
```

### Header
Page header.
```javascript
<Component name="Header" title="Welcome" subtitle="Subtitle" />
```

## API Endpoints

### List Components
```
GET /api/components
```
Returns all components from storage.

### Get Component
```
GET /api/components/:id
```
Returns specific component definition.

### Create Component
```
POST /api/components
{
  "name": "My Component",
  "jsxCode": "React.createElement(...)",
  "description": "Component description"
}
```
Saves component to storage and broadcasts change.

### Update Component
```
PUT /api/components/:id
{
  "name": "Updated Name",
  "jsxCode": "...",
  "description": "..."
}
```
Updates and broadcasts.

### Delete Component
```
DELETE /api/components/:id
```
Removes component and broadcasts deletion.

## Building Components with Visual Builder

### Access the Builder
Navigate to `/app-builder.html` in the desktop.

### Workflow
1. **Drag components** from left panel to canvas
2. **Select components** on canvas to edit properties
3. **Update properties** in right panel
4. **Save component** with name and description
5. **Preview** to see structure

### Export Component Format
Components are stored as:
```json
{
  "id": "component-id",
  "name": "Component Name",
  "description": "What it does",
  "jsxCode": "React.createElement(...)",
  "created": "2025-12-04T...",
  "updated": "2025-12-04T...",
  "isExample": false
}
```

## Integration with Apps

### 1. App-Editor Integration
The app editor can:
- Load components from storage
- Display them in visual builder
- Use drag-drop to compose UIs
- Export as React components

### 2. App-SDK Integration
Apps access components via:
```javascript
const sdk = new AppSDK({ appId: 'my-app' });
await sdk.initStorage();

// Load component list
const response = await fetch('/api/components');
const components = await response.json();

// Render component to app
const renderer = new DynamicComponentRenderer();
await renderer.loadComponents();
renderer.renderToElement('app-container', 'card', { /* props */ });
```

### 3. Real-Time Sync
When components change in storage:
1. StateManager emits event
2. RealtimeBroadcaster sends to WebSocket
3. All connected apps receive update
4. Components auto-refresh

## Component Context

### SystemProvider
Wraps component tree with all system services:
```javascript
<SystemProvider
  stateManager={stateManager}
  realtimeBroadcaster={broadcaster}
  appSDK={sdk}
  auth={authContext}
  requestContext={{ path, method, headers }}
  errorHandler={errorHandler}
>
  {children}
</SystemProvider>
```

### Boundary Components
- **ErrorBoundary**: Catches React errors with fallback UI
- **LoadingBoundary**: Shows loading state
- **OutletBoundary**: Combines both
- **ViewportBoundary**: Container with sizing
- **MetadataBoundary**: Attaches component metadata

## Storage Location

All components live in the storage adapter under type `component`:
```
~/.sequential/.state/component/
  card.json
  button.json
  badge.json
  [user-created components].json
```

Components are:
- Persisted to disk/database
- Cached in memory with LRU
- Broadcast on changes
- Accessible via `/api/components`

## Examples

### Example 1: Dashboard Component
```javascript
const dashboardJSX = `
React.createElement(
  'div',
  {},
  React.createElement('h1', {}, 'Dashboard'),
  React.createElement('div', { style: { display: 'grid', gap: '16px', gridTemplateColumns: '1fr 1fr' } },
    React.createElement('div', { style: { padding: '16px', backgroundColor: '#f0f0f0' } }, 'Metric 1'),
    React.createElement('div', { style: { padding: '16px', backgroundColor: '#f0f0f0' } }, 'Metric 2')
  )
)
`;

// Save to storage
await fetch('/api/components', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Dashboard',
    jsxCode: dashboardJSX,
    description: 'Dashboard with metrics'
  })
});
```

### Example 2: Using in App
```javascript
// In app HTML
<div id="app"></div>

<script src="/component-renderer.js"></script>
<script>
  const renderer = new DynamicComponentRenderer();

  renderer.subscribe((event, data) => {
    if (event === 'componentsLoaded') {
      renderer.renderToElement('app', 'dashboard');
    }
  });

  renderer.loadComponents();
</script>
```

## Performance

- **Caching**: LRU cache with 5000 items, 10min TTL
- **Lazy Loading**: Components loaded on demand
- **Broadcasting**: Real-time updates via WebSocket
- **Babel Transform**: ~50ms per component render

## Security

- **No eval()**: Uses Babel safely
- **Path Validation**: All storage paths validated
- **Auth Context**: Components access authenticated user
- **Error Isolation**: Errors caught in ErrorBoundary

## Limitations & Future

**Current:**
- Components are JSX strings (no file imports)
- No component composition via filesystem
- Manual prop definition

**Future:**
- Component libraries with npm packages
- Visual component editor with drag-drop
- Hot-reload for development
- Component versioning
- Community component registry

## Files

- `packages/@sequential/dynamic-components/` - Component system
- `packages/desktop-server/src/routes/components.js` - API endpoints
- `packages/desktop-server/src/utils/bootstrap-components.js` - Example components
- `packages/desktop-shell/dist/component-renderer.js` - Client renderer
- `packages/desktop-shell/dist/component-builder.js` - Builder system
- `packages/desktop-shell/dist/app-builder.html` - Visual builder UI
