// Component tree data structure and operations
export class ComponentTreeModel {
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
