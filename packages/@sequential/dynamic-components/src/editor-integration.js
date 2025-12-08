import { DynamicComponentRegistry, AppRenderer, ComponentBuilder, renderJSX } from './core.js';
import { AppComponentLibrary } from './app-components.js';

export class ComponentTreeEditor {
  constructor() {
    this.registry = new DynamicComponentRegistry();
    this.library = new AppComponentLibrary();
    this.registry = this.library.getRegistry();
    this.tree = new ComponentTreeModel();
    this.selectedId = null;
    this.clipboard = null;
    this.undoStack = [];
    this.redoStack = [];
  }

  createComponent(type, props = {}, parentId = null) {
    const id = `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const component = {
      id,
      type,
      props,
      parentId,
      children: [],
      style: {}
    };
    this.tree.addComponent(component);
    return component;
  }

  addToParent(componentId, parentId) {
    this.tree.addChild(parentId, componentId);
  }

  removeComponent(componentId) {
    this.tree.removeComponent(componentId);
  }

  updateComponentProps(componentId, props) {
    const component = this.tree.getComponent(componentId);
    if (component) {
      const oldComponent = { ...component };
      component.props = { ...component.props, ...props };
      this.saveUndo(oldComponent, component);
    }
  }

  updateComponentStyle(componentId, style) {
    const component = this.tree.getComponent(componentId);
    if (component) {
      const oldComponent = { ...component };
      component.style = { ...component.style, ...style };
      this.saveUndo(oldComponent, component);
    }
  }

  selectComponent(componentId) {
    this.selectedId = componentId;
  }

  getSelectedComponent() {
    return this.selectedId ? this.tree.getComponent(this.selectedId) : null;
  }

  copyComponent(componentId) {
    const component = this.tree.getComponent(componentId);
    this.clipboard = JSON.parse(JSON.stringify(component));
  }

  pasteComponent(parentId) {
    if (!this.clipboard) return null;
    const newComponent = JSON.parse(JSON.stringify(this.clipboard));
    newComponent.id = `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    newComponent.parentId = parentId;
    this.tree.addComponent(newComponent);
    return newComponent;
  }

  duplicateComponent(componentId, parentId) {
    this.copyComponent(componentId);
    return this.pasteComponent(parentId);
  }

  saveUndo(oldComponent, newComponent) {
    this.undoStack.push({ old: oldComponent, new: newComponent });
    this.redoStack = [];
  }

  undo() {
    if (this.undoStack.length === 0) return;
    const action = this.undoStack.pop();
    this.redoStack.push(action);
    this.tree.updateComponent(action.old.id, action.old);
  }

  redo() {
    if (this.redoStack.length === 0) return;
    const action = this.redoStack.pop();
    this.undoStack.push(action);
    this.tree.updateComponent(action.new.id, action.new);
  }

  exportAsJSX() {
    const roots = this.tree.getRoots();
    const jsx = roots.map(root => this.componentToJSX(root)).join('\n\n');
    return `<>\n${jsx}\n</>`;
  }

  componentToJSX(component, depth = 0) {
    const indent = '  '.repeat(depth);
    const propsStr = Object.entries(component.props)
      .map(([k, v]) => `${k}="${typeof v === 'string' ? v : JSON.stringify(v)}"`)
      .join(' ');

    const children = component.children.length > 0
      ? component.children
          .map(childId => this.componentToJSX(this.tree.getComponent(childId), depth + 1))
          .join('\n')
      : '';

    if (children) {
      return `${indent}<${component.type} ${propsStr}>\n${children}\n${indent}</${component.type}>`;
    } else {
      return `${indent}<${component.type} ${propsStr} />`;
    }
  }

  exportAsJSON() {
    return JSON.stringify({
      version: '1.0.0',
      components: this.tree.components,
      metadata: {
        createdAt: new Date().toISOString(),
        componentCount: this.tree.components.size
      }
    }, null, 2);
  }

  importFromJSON(jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      this.tree = new ComponentTreeModel();
      data.components.forEach(comp => this.tree.addComponent(comp));
      return true;
    } catch (err) {
      console.error('Import error:', err);
      return false;
    }
  }

  getComponentTree() {
    return this.tree;
  }

  registerComponentTemplate(name, template) {
    this.registry.register(name, template.code, {
      category: 'templates',
      description: template.description,
      tags: template.tags
    });
  }
}

class ComponentTreeModel {
  constructor() {
    this.components = new Map();
    this.roots = [];
  }

  addComponent(component) {
    this.components.set(component.id, component);
    if (!component.parentId) {
      this.roots.push(component.id);
    }
  }

  getComponent(id) {
    return this.components.get(id);
  }

  addChild(parentId, childId) {
    const parent = this.components.get(parentId);
    const child = this.components.get(childId);
    if (parent && child) {
      if (!parent.children) parent.children = [];
      parent.children.push(childId);
      child.parentId = parentId;
    }
  }

  removeComponent(id) {
    const component = this.components.get(id);
    if (!component) return;

    if (component.parentId) {
      const parent = this.components.get(component.parentId);
      if (parent) {
        parent.children = parent.children.filter(cid => cid !== id);
      }
    } else {
      this.roots = this.roots.filter(rid => rid !== id);
    }

    if (component.children) {
      component.children.forEach(childId => this.removeComponent(childId));
    }

    this.components.delete(id);
  }

  updateComponent(id, updates) {
    const component = this.components.get(id);
    if (component) {
      Object.assign(component, updates);
    }
  }

  getRoots() {
    return this.roots.map(id => this.components.get(id));
  }

  getChildren(id) {
    const component = this.components.get(id);
    return component && component.children
      ? component.children.map(childId => this.components.get(childId))
      : [];
  }

  flatten() {
    return Array.from(this.components.values());
  }
}

export class ComponentPropertyEditor {
  constructor(component, registry) {
    this.component = component;
    this.registry = registry;
  }

  getPropertySchema() {
    const meta = this.registry.metadata.get(this.component.type) || {};
    return {
      type: this.component.type,
      description: meta.description || '',
      properties: this.getComponentProperties()
    };
  }

  getComponentProperties() {
    const commonProps = {
      className: { type: 'string', label: 'CSS Classes', hint: 'Space-separated class names' },
      style: { type: 'object', label: 'Inline Styles', hint: 'CSS style object' }
    };

    const typeSpecificProps = {
      heading: {
        content: { type: 'string', label: 'Content', required: true },
        level: { type: 'number', label: 'Level', min: 1, max: 6 },
        variant: { type: 'select', label: 'Variant', options: ['h1', 'h2', 'h3', 'highlight'] }
      },
      button: {
        label: { type: 'string', label: 'Label', required: true },
        variant: { type: 'select', label: 'Variant', options: ['primary', 'secondary', 'danger', 'outline'] },
        disabled: { type: 'boolean', label: 'Disabled' }
      },
      input: {
        placeholder: { type: 'string', label: 'Placeholder' },
        type: { type: 'select', label: 'Type', options: ['text', 'email', 'password', 'number', 'date'] },
        value: { type: 'string', label: 'Value' },
        disabled: { type: 'boolean', label: 'Disabled' }
      },
      card: {
        title: { type: 'string', label: 'Title' },
        content: { type: 'string', label: 'Content' },
        variant: { type: 'select', label: 'Variant', options: ['default', 'elevated', 'flat'] }
      },
      flex: {
        direction: { type: 'select', label: 'Direction', options: ['row', 'column'] },
        gap: { type: 'string', label: 'Gap', hint: 'e.g., "12px"' },
        align: { type: 'select', label: 'Align Items', options: ['stretch', 'center', 'flex-start', 'flex-end'] }
      },
      grid: {
        cols: { type: 'string', label: 'Columns', hint: 'e.g., "1fr 1fr"' },
        rows: { type: 'string', label: 'Rows', hint: 'e.g., "auto 1fr"' },
        gap: { type: 'string', label: 'Gap', hint: 'e.g., "16px"' }
      }
    };

    return { ...commonProps, ...(typeSpecificProps[this.component.type] || {}) };
  }

  validateProperty(propName, value) {
    const schema = this.getComponentProperties();
    const propSchema = schema[propName];
    if (!propSchema) return { valid: true };

    if (propSchema.required && !value) {
      return { valid: false, error: `${propName} is required` };
    }

    if (propSchema.type === 'number') {
      const num = Number(value);
      if (isNaN(num)) return { valid: false, error: 'Must be a number' };
      if (propSchema.min !== undefined && num < propSchema.min) {
        return { valid: false, error: `Minimum value is ${propSchema.min}` };
      }
      if (propSchema.max !== undefined && num > propSchema.max) {
        return { valid: false, error: `Maximum value is ${propSchema.max}` };
      }
    }

    if (propSchema.type === 'select' && propSchema.options) {
      if (!propSchema.options.includes(value)) {
        return { valid: false, error: `Must be one of: ${propSchema.options.join(', ')}` };
      }
    }

    return { valid: true };
  }

  getPropertyHint(propName) {
    const schema = this.getComponentProperties();
    const propSchema = schema[propName];
    if (!propSchema) return '';

    let hint = propSchema.hint || '';
    if (propSchema.required) hint = '* ' + hint;
    if (propSchema.options) hint += ` (${propSchema.options.join(' | ')})`;
    return hint;
  }
}

export class ComponentPreviewRenderer {
  constructor(registry, rootElement) {
    this.registry = registry;
    this.rootElement = typeof rootElement === 'string'
      ? document.querySelector(rootElement)
      : rootElement;
    this.renderer = new AppRenderer(registry, rootElement);
    this.currentComponent = null;
  }

  previewComponent(component) {
    try {
      this.currentComponent = component;
      const jsx = this.buildComponentJSX(component);
      const result = renderJSX(jsx, component.props, { React: window.React });
      if (this.rootElement && window.ReactDOM) {
        const root = window.ReactDOM.createRoot(this.rootElement);
        root.render(result);
      }
    } catch (err) {
      this.renderPreviewError(err);
    }
  }

  previewTree(tree) {
    try {
      const roots = tree.getRoots();
      const jsx = roots.map(root => this.buildComponentJSX(root)).join('\n');
      const wrappedJSX = `<div style={{padding: '16px'}}>\n${jsx}\n</div>`;
      const result = renderJSX(wrappedJSX, {}, { React: window.React });
      if (this.rootElement && window.ReactDOM) {
        const root = window.ReactDOM.createRoot(this.rootElement);
        root.render(result);
      }
    } catch (err) {
      this.renderPreviewError(err);
    }
  }

  buildComponentJSX(component) {
    const propsStr = Object.entries(component.props)
      .map(([k, v]) => {
        if (typeof v === 'string') {
          return `${k}="${v}"`;
        } else {
          return `${k}={${JSON.stringify(v)}}`;
        }
      })
      .join(' ');

    if (!component.children || component.children.length === 0) {
      return `<${component.type} ${propsStr} />`;
    }

    return `<${component.type} ${propsStr}>...</${component.type}>`;
  }

  renderPreviewError(err) {
    if (!this.rootElement) return;
    this.rootElement.innerHTML = `
      <div style="background: #fee2e2; border: 1px solid #fecaca; borderRadius: 6px; padding: 12px; color: #dc2626;">
        <div style="fontWeight: 600; marginBottom: 4px; fontSize: 12px;">Preview Error</div>
        <div style="fontSize: 12px; fontFamily: monospace; whiteSpace: pre-wrap;">${err.message}</div>
      </div>
    `;
  }

  clear() {
    if (this.rootElement) {
      this.rootElement.innerHTML = '';
    }
    this.currentComponent = null;
  }
}

export const createComponentEditor = () => new ComponentTreeEditor();
