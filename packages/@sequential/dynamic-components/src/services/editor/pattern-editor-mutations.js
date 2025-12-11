// Mutations layer - element modifications and child operations
export class PatternEditorMutations {
  constructor(navigation) {
    this.navigation = navigation;
  }

  selectElement(path) {
    const element = this.navigation.getElementByPath(this.navigation.currentPattern.definition, path);
    if (!element) return null;
    return { path, element };
  }

  updateElementStyle(path, styleUpdates) {
    const element = this.navigation.getElementByPath(this.navigation.currentPattern.definition, path);
    if (!element) return false;
    element.style = { ...element.style, ...styleUpdates };
    return true;
  }

  updateElementContent(path, content) {
    const element = this.navigation.getElementByPath(this.navigation.currentPattern.definition, path);
    if (!element) return false;
    element.content = content;
    return true;
  }

  updateElementAttributes(path, attributes) {
    const element = this.navigation.getElementByPath(this.navigation.currentPattern.definition, path);
    if (!element) return false;
    element.attributes = { ...element.attributes, ...attributes };
    return true;
  }

  addChild(parentPath, childDefinition) {
    const parent = parentPath
      ? this.navigation.getElementByPath(this.navigation.currentPattern.definition, parentPath)
      : this.navigation.currentPattern.definition;
    if (!parent) return false;
    if (!parent.children) {
      parent.children = [];
    }
    parent.children.push(JSON.parse(JSON.stringify(childDefinition)));
    return true;
  }

  removeElement(path) {
    if (!path) return false;
    const parts = path.split('.');
    const lastPart = parts.pop();
    const parentPath = parts.join('.');
    const parent = parentPath
      ? this.navigation.getElementByPath(this.navigation.currentPattern.definition, parentPath)
      : this.navigation.currentPattern.definition;
    if (!parent) return false;
    if (lastPart.startsWith('children[')) {
      const match = lastPart.match(/children\[(\d+)\]/);
      if (match) {
        const index = parseInt(match[1], 10);
        parent.children?.splice(index, 1);
      }
    } else {
      delete parent[lastPart];
    }
    return true;
  }

  duplicateElement(path) {
    const element = this.navigation.getElementByPath(this.navigation.currentPattern.definition, path);
    if (!element) return false;
    const parts = path.split('.');
    const lastPart = parts.pop();
    const parentPath = parts.join('.');
    const parent = parentPath
      ? this.navigation.getElementByPath(this.navigation.currentPattern.definition, parentPath)
      : this.navigation.currentPattern.definition;
    if (!parent) return false;
    const duplicate = JSON.parse(JSON.stringify(element));
    if (lastPart.startsWith('children[')) {
      const match = lastPart.match(/children\[(\d+)\]/);
      if (match) {
        const index = parseInt(match[1], 10);
        parent.children?.splice(index + 1, 0, duplicate);
      }
    }
    return true;
  }
}
