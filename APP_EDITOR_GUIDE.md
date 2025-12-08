# App Editor UI Creation Tooling Guide

The enhanced App Editor now provides comprehensive tools for creating, editing, and managing UI components using the dynamic React renderer. This guide covers the new editor capabilities.

## Architecture

### Core Components

1. **ComponentTreeEditor**: Manages component hierarchy and operations
   - Create/delete/duplicate components
   - Copy/paste functionality
   - Undo/redo stack
   - Component tree traversal
   - JSX and JSON export

2. **ComponentPropertyEditor**: Handles property editing and validation
   - Property schema generation
   - Type-specific property definitions
   - Property validation with error messages
   - Property hints and constraints

3. **ComponentPreviewRenderer**: Real-time preview rendering
   - Single component preview
   - Full tree preview
   - Error handling and feedback
   - Live updates during editing

4. **DynamicCanvas**: Visual component rendering in the editor
   - Drag-drop ready structure
   - Selection and highlighting
   - Component click events
   - Style visualization

## Creating Components

### Method 1: Using the Visual Builder

In the App Editor:
1. Click "+ Add Component" in the sidebar
2. Select component type (heading, button, card, flex, grid, etc.)
3. Drag to position on canvas
4. Click to select and edit properties in the right panel
5. Changes appear in real-time preview

### Method 2: Programmatic Creation

```javascript
import { createComponentEditor } from '@sequential/dynamic-components';

const editor = createComponentEditor();

// Create a component
const heading = editor.createComponent('heading', {
  content: 'Welcome to My App',
  level: 1
}, parentId);

// Create a layout
const flexLayout = editor.createComponent('flex', {
  direction: 'column',
  gap: '16px',
  align: 'stretch'
}, null);

// Add to parent
editor.addToParent(heading.id, flexLayout.id);
```

## Component Types

### Text Components
- **heading**: `{content: string, level: 1-6, variant?: string}`
- **paragraph**: `{content: string}`

### Form Components
- **button**: `{label: string, variant?: 'primary'|'secondary'|'danger'|'outline', disabled?: boolean}`
- **input**: `{placeholder?: string, type?: 'text'|'email'|'password'|'number'|'date', value?: string, disabled?: boolean}`

### Container Components
- **card**: `{title?: string, content?: string, variant?: 'default'|'elevated'|'flat'}`
- **flex**: `{direction?: 'row'|'column', gap?: string, align?: 'stretch'|'center'|'flex-start'|'flex-end'}`
- **grid**: `{cols?: string, rows?: string, gap?: string}`
- **section**: `{}`

## Editing Components

### Change Properties

```javascript
const editor = createComponentEditor();
const component = editor.getSelectedComponent();

// Update props
editor.updateComponentProps(component.id, {
  content: 'New content',
  level: 2
});

// Update styles
editor.updateComponentStyle(component.id, {
  background: '#f5f5f5',
  padding: '16px'
});
```

### Validate Properties

```javascript
const propertyEditor = new ComponentPropertyEditor(component, registry);

// Get validation schema
const schema = propertyEditor.getPropertySchema();
console.log('Component type:', schema.type);
console.log('Properties:', schema.properties);

// Validate a property
const validation = propertyEditor.validateProperty('level', 7);
if (!validation.valid) {
  console.error(validation.error);
}

// Get property hint
const hint = propertyEditor.getPropertyHint('level');
console.log('Hint:', hint); // "* (1 | 2 | 3 | 4 | 5 | 6)"
```

## Component Operations

### Copy/Paste

```javascript
const editor = createComponentEditor();

// Copy selected component
editor.copyComponent(componentId);

// Paste as child of another component
const newComponent = editor.pasteComponent(parentId);

// Or duplicate directly
const duplicate = editor.duplicateComponent(componentId, parentId);
```

### Undo/Redo

```javascript
// Undo last change
editor.undo();

// Redo last undone change
editor.redo();
```

### Selection

```javascript
// Select a component
editor.selectComponent(componentId);

// Get selected component
const selected = editor.getSelectedComponent();
console.log('Selected:', selected.id, selected.type, selected.props);
```

## Component Tree Management

### Get Component Tree

```javascript
const tree = editor.getComponentTree();

// Get root components
const roots = tree.getRoots();

// Get component children
const children = tree.getChildren(componentId);

// Flatten tree
const all = tree.flatten();
```

### Delete Component

```javascript
// Delete component and all children
editor.removeComponent(componentId);
```

## Preview and Export

### Live Preview

```javascript
import { ComponentPreviewRenderer } from '@sequential/dynamic-components';

const renderer = new ComponentPreviewRenderer(
  editor.getComponentTree().registry,
  '#preview'
);

// Preview single component
renderer.previewComponent(component);

// Preview entire tree
renderer.previewTree(editor.getComponentTree());
```

### Export Formats

#### Export as JSX

```javascript
const editor = createComponentEditor();
const jsxCode = editor.exportAsJSX();
console.log(jsxCode);
// Output:
// <>
//   <heading>Welcome to My App</heading>
//   <flex>
//     <button>Click me</button>
//   </flex>
// </>
```

#### Export as JSON

```javascript
const jsonStr = editor.exportAsJSON();
console.log(jsonStr);
// Output:
// {
//   "version": "1.0.0",
//   "components": [...],
//   "metadata": {...}
// }
```

### Import from JSON

```javascript
const editor = createComponentEditor();
const success = editor.importFromJSON(jsonStr);

if (success) {
  console.log('Component tree loaded');
} else {
  console.error('Import failed');
}
```

## Component Templates

### Register Custom Template

```javascript
const editor = createComponentEditor();

editor.registerComponentTemplate('my-form', {
  code: `<div style={{padding: '16px', background: '#f5f5f5'}}>
    <h2>My Form</h2>
    <input type="text" placeholder="Name" />
    <button>Submit</button>
  </div>`,
  description: 'Custom form template',
  tags: ['form', 'custom']
});
```

### Use Template

Once registered, the template appears in the component library and can be:
- Dragged onto the canvas
- Inserted via "Add Component" menu
- Duplicated and modified

## Advanced Features

### Property Constraints

Components automatically validate properties:

```javascript
const editor = createComponentEditor();
const propertyEditor = new ComponentPropertyEditor(component, registry);

// heading level must be 1-6
const result = propertyEditor.validateProperty('level', 7);
// {valid: false, error: "Maximum value is 6"}

// button variant must be one of the options
const result2 = propertyEditor.validateProperty('variant', 'invalid');
// {valid: false, error: "Must be one of: primary, secondary, danger, outline"}
```

### Component Metadata

```javascript
const registry = editor.library.getRegistry();
const meta = registry.metadata.get('button');
console.log(meta);
// {
//   category: 'forms',
//   description: 'Button component',
//   tags: ['button', 'interactive']
// }
```

### Component Search

```javascript
const editor = createComponentEditor();
const results = editor.library.search('form');
results.forEach(comp => {
  console.log(`${comp.name}: ${comp.meta.description}`);
});
```

## Integration with App Editor UI

### The Visual Editor Workflow

1. **Component Palette**: Browse available components by category
2. **Canvas**: Drag components and arrange them
3. **Properties Panel**: Edit selected component properties
4. **Preview**: See changes in real-time
5. **Export**: Save as JSX or JSON

### Keyboard Shortcuts

- **Delete**: Remove selected component
- **Ctrl+C**: Copy selected component
- **Ctrl+V**: Paste component
- **Ctrl+Z**: Undo
- **Ctrl+Shift+Z**: Redo
- **Escape**: Deselect component

### Menu Operations

- **New Component**: Create and add to canvas
- **Edit Properties**: Open property editor
- **Advanced Styles**: Edit flexbox/grid properties
- **Duplicate**: Clone with new ID
- **Convert to Template**: Save pattern for reuse

## Performance Tips

1. **Large Trees**: Editor handles 100+ components efficiently
2. **Real-time Preview**: Debounced updates to preview (300ms)
3. **Undo Stack**: Limited to 50 items (oldest discarded)
4. **Component Caching**: Registered components cached in registry

## Error Handling

### Property Validation Errors

```javascript
try {
  editor.updateComponentProps(componentId, {
    level: 'invalid'  // heading level must be number
  });
} catch (err) {
  console.error('Validation failed:', err.message);
}
```

### Preview Errors

```javascript
const renderer = new ComponentPreviewRenderer(registry, '#preview');
// If component rendering fails:
// - Error message displays in preview area
// - Original component preserved
// - Editor remains usable
```

## Examples

### Create a Simple Form

```javascript
const editor = createComponentEditor();

// Create main flex container
const form = editor.createComponent('flex', {
  direction: 'column',
  gap: '12px'
}, null);

// Add label
const label = editor.createComponent('paragraph', {
  content: 'Enter your name:'
}, form.id);

// Add input
const input = editor.createComponent('input', {
  placeholder: 'Your name',
  type: 'text'
}, form.id);

// Add button
const button = editor.createComponent('button', {
  label: 'Submit'
}, form.id);

// Export
console.log(editor.exportAsJSX());
```

### Build a Dashboard Card

```javascript
const editor = createComponentEditor();

// Create card
const card = editor.createComponent('card', {
  title: 'Dashboard',
  variant: 'elevated'
}, null);

// Create grid inside
const grid = editor.createComponent('grid', {
  cols: '1fr 1fr',
  gap: '16px'
}, card.id);

// Add metric cards
for (let i = 0; i < 4; i++) {
  editor.createComponent('card', {
    title: `Metric ${i + 1}`,
    content: '0',
    variant: 'flat'
  }, grid.id);
}

// Preview
const renderer = new ComponentPreviewRenderer(
  editor.library.getRegistry(),
  '#preview'
);
renderer.previewTree(editor.getComponentTree());
```

## Troubleshooting

### Component doesn't appear on canvas
- Check component has valid parent ID
- Verify component type is registered
- Check for JavaScript errors in console

### Property validation always fails
- Review property schema for component type
- Check property type matches schema (string vs number)
- Verify enum values are spelled correctly

### Export contains `undefined` values
- Only properties with values are exported
- Empty strings and 0 are included
- null/undefined are excluded

---

**For more information**, see:
- DYNAMIC_RENDERER_GUIDE.md - Dynamic renderer API
- Component type definitions in app-components.js
- Editor integration API in editor-integration.js
