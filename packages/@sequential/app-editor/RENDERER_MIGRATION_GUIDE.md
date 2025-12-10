# Universal Renderer Migration Guide

## Overview

This guide shows how to migrate any Sequential Ecosystem app to use `UniversalRenderer` from `@sequential/dynamic-components` as the primary rendering mechanism.

## Why Migrate?

- **Unified Component System**: Single rendering engine across all apps
- **Performance**: Built-in caching, hook system, metrics tracking
- **Error Boundaries**: Safe rendering with error recovery
- **Pattern Support**: Seamless integration with pattern systems
- **Zero Dependencies**: No React, Vue, or other framework required

## Migration Steps

### Step 1: Import UniversalRenderer

Replace framework imports with dynamic-components:

```javascript
// BEFORE
import React from 'react';
// or
const bridge = await initializeAppRendering('app-id', '#app');

// AFTER
import { createUniversalRenderer } from 'http://localhost:3001/dist/dynamic-components.js';

const renderer = createUniversalRenderer({
  performanceTracking: true,
  errorBoundary: true
});
```

### Step 2: Convert Component Definitions

Your existing component definitions likely already match the expected format:

```javascript
// This format works with UniversalRenderer
const component = {
  type: 'box',
  style: { padding: '16px', backgroundColor: '#fff' },
  children: [
    { type: 'heading', content: 'Title', level: 1 },
    { type: 'paragraph', content: 'Description' }
  ]
};
```

### Step 3: Replace Render Call

```javascript
// BEFORE
bridge.render('flex', componentDef);
// or
ReactDOM.render(<App />, document.getElementById('app'));

// AFTER
const renderer = createUniversalRenderer();
renderer.render(componentDef, document.getElementById('app'));
```

### Step 4: Handle State Updates

If your app uses state, call render again when state changes:

```javascript
class MyApp {
  constructor() {
    this.state = { activeTab: 'home' };
    this.renderer = createUniversalRenderer();
  }

  switchTab(tab) {
    this.state.activeTab = tab;
    this.render(); // Re-render with new state
  }

  render() {
    const ui = this.buildUI(); // Build from state
    this.renderer.render(ui, document.getElementById('app'));
  }

  buildUI() {
    return {
      type: 'box',
      children: [
        this.buildHeader(),
        this.buildContent(),
        this.buildFooter()
      ]
    };
  }
}
```

### Step 5: Setup Event Handlers

UniversalRenderer supports standard event handlers:

```javascript
{
  type: 'button',
  content: 'Click me',
  onClick: (event) => {
    console.log('Button clicked!');
    this.handleButtonClick();
  }
}
```

## Supported Element Types

UniversalRenderer includes 28 element types out of the box:

### Containers
- `box`, `div`, `container`, `card`, `section`, `header`, `footer`, `nav`

### Forms
- `button`, `input`, `textarea`, `select`, `form`

### Text
- `heading` (h1-h6), `paragraph`, `p`, `text`, `link`, `a`

### Media
- `image`, `img`

### Layout
- `grid`, `flex`, `list`, `ul`, `ol`, `li`, `table`

## Component Definition Format

```typescript
interface ComponentDef {
  type: string;              // Element type
  id?: string;               // Optional ID
  className?: string;        // CSS class
  content?: string;          // Text content
  style?: Record<string, any>; // Inline styles
  attributes?: Record<string, string>; // HTML attributes
  dataAttributes?: Record<string, any>; // data-* attributes
  children?: ComponentDef | ComponentDef[] | string;
  onClick?: (event: MouseEvent) => void;
  onChange?: (event: Event) => void;
  onInput?: (event: Event) => void;
  // ... other event handlers
}
```

## Style Properties

All CSS properties are supported via camelCase:

```javascript
style: {
  display: 'flex',           // display: flex
  flexDirection: 'column',   // flex-direction: column
  padding: '16px',           // padding: 16px
  backgroundColor: '#fff',   // background-color: #fff
  borderRadius: '8px'        // border-radius: 8px
}
```

## Performance Optimization

UniversalRenderer includes automatic caching:

```javascript
const renderer = createUniversalRenderer({
  performanceTracking: true
});

renderer.registerHook('afterRender', () => {
  const metrics = renderer.getMetrics();
  console.log(`Cache hit rate: ${metrics.cacheHitRate}`);
  console.log(`Renders: ${metrics.renders}`);
});

// Clear cache if needed (when styles change)
renderer.clearCache();
```

## Error Handling

Errors are caught and rendered safely:

```javascript
const renderer = createUniversalRenderer({
  errorBoundary: true  // Enabled by default
});

// Rendering errors will show a safe error message instead of crashing
renderer.render(componentDef, rootElement);
```

## Integration with Pattern Systems

UniversalRenderer works seamlessly with pattern systems:

```javascript
import {
  createUniversalRenderer,
  PatternIntegrationBridge,
  PatternUILibrary
} from 'http://localhost:3001/dist/dynamic-components.js';

const renderer = createUniversalRenderer();
const patternBridge = new PatternIntegrationBridge(null, null, null);
const patternUI = new PatternUILibrary(patternBridge);

// Register pattern systems
patternBridge.registerPatternSystem('validator', validator);
patternBridge.registerPatternSystem('auditor', auditor);

// Use pattern panels in your UI
const inspectorPanel = patternUI.createInspectorPanel(selectedComponentId);
renderer.render(inspectorPanel, document.getElementById('panel'));
```

## Migration Checklist

- [ ] Remove framework-specific imports (React, Vue, etc.)
- [ ] Import UniversalRenderer from dynamic-components
- [ ] Convert component definitions to supported format
- [ ] Replace render/mount calls with `renderer.render()`
- [ ] Update state management to trigger re-renders
- [ ] Map event handlers to supported types
- [ ] Test all interactive features
- [ ] Verify styling with UniversalRenderer
- [ ] Setup performance monitoring (optional)
- [ ] Integrate with pattern systems (optional)

## Migration Examples by App Type

### Dashboard App (like app-observability-dashboard)

```javascript
class Dashboard {
  constructor() {
    this.renderer = createUniversalRenderer({ performanceTracking: true });
    this.state = { activeTab: 'metrics', data: {} };
  }

  async init() {
    await this.fetchData();
    this.setupPolling();
    this.render();
  }

  async fetchData() {
    const res = await fetch('/api/dashboard');
    const { data } = await res.json();
    this.state.data = data;
  }

  setupPolling() {
    setInterval(() => this.fetchData(), 5000);
  }

  render() {
    const ui = this.buildUI();
    this.renderer.render(ui, document.getElementById('app'));
  }

  buildUI() {
    return {
      type: 'box',
      style: { display: 'flex', flexDirection: 'column', height: '100vh' },
      children: [
        this.buildHeader(),
        this.buildMetrics(),
        this.buildTabs(),
        this.buildFooter()
      ]
    };
  }

  // ... builder methods
}
```

### Editor App (like app-app-editor)

```javascript
class Editor {
  constructor() {
    this.renderer = createUniversalRenderer();
    this.patternBridge = new PatternIntegrationBridge(...);
    this.state = { selectedComponent: null, editMode: true };
  }

  selectComponent(id) {
    this.state.selectedComponent = id;
    this.render();
  }

  render() {
    const ui = {
      type: 'grid',
      style: { gridTemplateColumns: '200px 1fr 300px', height: '100vh' },
      children: [
        this.buildLeftPanel(),
        this.buildCanvas(),
        this.buildInspector()
      ]
    };
    this.renderer.render(ui, document.getElementById('app'));
  }

  buildInspector() {
    return this.patternBridge.buildInspectorPanel(this.state.selectedComponent);
  }
}
```

### Simple App

```javascript
const renderer = createUniversalRenderer();

const ui = {
  type: 'box',
  style: { padding: '20px', maxWidth: '800px', margin: '0 auto' },
  children: [
    { type: 'heading', content: 'Welcome', level: 1 },
    { type: 'paragraph', content: 'This is rendered with UniversalRenderer' },
    {
      type: 'button',
      content: 'Click Me',
      onClick: () => alert('Clicked!')
    }
  ]
};

renderer.render(ui, document.getElementById('app'));
```

## Troubleshooting

### Elements Not Rendering

Ensure your component definitions have the `type` property:
```javascript
// ❌ Wrong
const component = { content: 'Hello' };

// ✓ Correct
const component = { type: 'paragraph', content: 'Hello' };
```

### Styles Not Applied

Use camelCase for CSS properties:
```javascript
// ❌ Wrong
style: { 'background-color': '#fff' }

// ✓ Correct
style: { backgroundColor: '#fff' }
```

### Events Not Triggering

Ensure event handlers are functions:
```javascript
// ❌ Wrong
onClick: this.handleClick  // Missing context binding

// ✓ Correct
onClick: () => this.handleClick()  // Bound via arrow function
```

### Performance Issues

Enable metrics to identify bottlenecks:
```javascript
const renderer = createUniversalRenderer({ performanceTracking: true });

setInterval(() => {
  const metrics = renderer.getMetrics();
  if (metrics.renders > 100) {
    console.warn('High render count - may cause performance issues');
    renderer.clearCache();
  }
}, 10000);
```

## Next Steps

1. Start with one app (e.g., app-observability-dashboard)
2. Follow the migration steps above
3. Test thoroughly
4. Document any custom behaviors
5. Migrate remaining apps using the same pattern
6. Integrate pattern systems for enhanced UI creation

## Support

For issues or questions:
1. Check the UniversalRenderer implementation in `@sequential/dynamic-components/src/universal-renderer.js`
2. Review pattern system integrations in PatternIntegrationBridge
3. Refer to existing migrated apps for examples
