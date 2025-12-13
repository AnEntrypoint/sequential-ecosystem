// Editor integration facade - maintains 100% backward compatibility
import { DynamicComponentRegistry, AppRenderer, ComponentBuilder, renderJSX } from './core.js';
import { AppComponentLibrary } from './app-components.js';
import { ComponentTreeModel } from './component-tree-model.js';
import { ComponentPropertyEditor } from './component-property-editor.js';
import { ComponentPreviewRenderer } from './component-preview-renderer.js';

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

export { ComponentPropertyEditor, ComponentPreviewRenderer, ComponentTreeModel };

export const createComponentEditor = () => new ComponentTreeEditor();
