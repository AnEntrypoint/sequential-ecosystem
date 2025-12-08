class PatternEditor {
  constructor(universalRenderer) {
    this.renderer = universalRenderer;
    this.currentPattern = null;
    this.editHistory = [];
    this.previewElement = null;
    this.editorState = {
      selectedPath: null,
      selectedElement: null,
      editMode: 'visual',
      zoom: 100,
      showGrid: false
    };
    this.listeners = [];
    this.undoStack = [];
    this.redoStack = [];
  }

  openPattern(patternId, definition) {
    this.currentPattern = {
      id: patternId,
      definition: JSON.parse(JSON.stringify(definition)),
      originalDefinition: JSON.parse(JSON.stringify(definition))
    };

    this.undoStack = [];
    this.redoStack = [];
    this.editorState.selectedPath = null;
    this.editorState.selectedElement = null;

    this.notifyListeners('patternOpened', { patternId, definition });

    return this.currentPattern;
  }

  initializePreview(containerId) {
    this.previewElement = document.getElementById(containerId);

    if (!this.previewElement) {
      return false;
    }

    this.renderPreview();

    return true;
  }

  renderPreview() {
    if (!this.previewElement || !this.currentPattern) return;

    try {
      this.renderer.render(this.currentPattern.definition, this.previewElement);
      this.notifyListeners('previewRendered', { patternId: this.currentPattern.id });
    } catch (e) {
      this.renderPreviewError(e);
    }
  }

  renderPreviewError(error) {
    if (!this.previewElement) return;

    this.previewElement.innerHTML = `
      <div style="padding: 20px; background: #fee; color: #c00; border-radius: 4px;">
        <strong>Preview Error:</strong> ${error.message}
      </div>
    `;
  }

  selectElement(path) {
    const element = this.getElementByPath(this.currentPattern.definition, path);

    if (!element) return false;

    this.editorState.selectedPath = path;
    this.editorState.selectedElement = element;

    this.notifyListeners('elementSelected', { path, element });

    return true;
  }

  getElementByPath(definition, path) {
    if (!path) return definition;

    const parts = path.split('.');
    let current = definition;

    for (const part of parts) {
      if (part.startsWith('children[')) {
        const match = part.match(/children\[(\d+)\]/);
        if (match) {
          const index = parseInt(match[1], 10);
          current = current.children?.[index];
        }
      } else {
        current = current[part];
      }

      if (!current) return null;
    }

    return current;
  }

  updateElementStyle(path, styleUpdates) {
    const element = this.getElementByPath(this.currentPattern.definition, path);

    if (!element) return false;

    this.saveToUndoStack();

    element.style = { ...element.style, ...styleUpdates };

    this.renderPreview();

    this.notifyListeners('styleUpdated', { path, styleUpdates });

    return true;
  }

  updateElementContent(path, content) {
    const element = this.getElementByPath(this.currentPattern.definition, path);

    if (!element) return false;

    this.saveToUndoStack();

    element.content = content;

    this.renderPreview();

    this.notifyListeners('contentUpdated', { path, content });

    return true;
  }

  updateElementAttributes(path, attributes) {
    const element = this.getElementByPath(this.currentPattern.definition, path);

    if (!element) return false;

    this.saveToUndoStack();

    element.attributes = { ...element.attributes, ...attributes };

    this.renderPreview();

    this.notifyListeners('attributesUpdated', { path, attributes });

    return true;
  }

  addChild(parentPath, childDefinition) {
    const parent = parentPath
      ? this.getElementByPath(this.currentPattern.definition, parentPath)
      : this.currentPattern.definition;

    if (!parent) return false;

    this.saveToUndoStack();

    if (!parent.children) {
      parent.children = [];
    }

    parent.children.push(JSON.parse(JSON.stringify(childDefinition)));

    this.renderPreview();

    this.notifyListeners('childAdded', { parentPath, childDefinition });

    return true;
  }

  removeElement(path) {
    if (!path) return false;

    const parts = path.split('.');
    const lastPart = parts.pop();
    const parentPath = parts.join('.');

    const parent = parentPath
      ? this.getElementByPath(this.currentPattern.definition, parentPath)
      : this.currentPattern.definition;

    if (!parent) return false;

    this.saveToUndoStack();

    if (lastPart.startsWith('children[')) {
      const match = lastPart.match(/children\[(\d+)\]/);
      if (match) {
        const index = parseInt(match[1], 10);
        parent.children?.splice(index, 1);
      }
    } else {
      delete parent[lastPart];
    }

    this.renderPreview();

    this.notifyListeners('elementRemoved', { path });

    return true;
  }

  duplicateElement(path) {
    const element = this.getElementByPath(this.currentPattern.definition, path);

    if (!element) return false;

    const parts = path.split('.');
    const lastPart = parts.pop();
    const parentPath = parts.join('.');

    const parent = parentPath
      ? this.getElementByPath(this.currentPattern.definition, parentPath)
      : this.currentPattern.definition;

    if (!parent) return false;

    this.saveToUndoStack();

    const duplicate = JSON.parse(JSON.stringify(element));

    if (lastPart.startsWith('children[')) {
      const match = lastPart.match(/children\[(\d+)\]/);
      if (match) {
        const index = parseInt(match[1], 10);
        parent.children?.splice(index + 1, 0, duplicate);
      }
    }

    this.renderPreview();

    this.notifyListeners('elementDuplicated', { path });

    return true;
  }

  saveToUndoStack() {
    this.undoStack.push(JSON.parse(JSON.stringify(this.currentPattern.definition)));
    this.redoStack = [];

    if (this.undoStack.length > 50) {
      this.undoStack.shift();
    }
  }

  undo() {
    if (this.undoStack.length === 0) return false;

    this.redoStack.push(JSON.parse(JSON.stringify(this.currentPattern.definition)));

    this.currentPattern.definition = this.undoStack.pop();

    this.renderPreview();

    this.notifyListeners('undo', {});

    return true;
  }

  redo() {
    if (this.redoStack.length === 0) return false;

    this.undoStack.push(JSON.parse(JSON.stringify(this.currentPattern.definition)));

    this.currentPattern.definition = this.redoStack.pop();

    this.renderPreview();

    this.notifyListeners('redo', {});

    return true;
  }

  resetToOriginal() {
    this.currentPattern.definition = JSON.parse(JSON.stringify(this.currentPattern.originalDefinition));

    this.undoStack = [];
    this.redoStack = [];

    this.renderPreview();

    this.notifyListeners('resetToOriginal', {});

    return true;
  }

  getCurrentDefinition() {
    return this.currentPattern?.definition || null;
  }

  hasChanges() {
    if (!this.currentPattern) return false;

    return JSON.stringify(this.currentPattern.definition) !==
           JSON.stringify(this.currentPattern.originalDefinition);
  }

  buildEditorUI() {
    return {
      type: 'box',
      style: {
        display: 'grid',
        gridTemplateColumns: '200px 1fr 300px',
        height: '100vh',
        gap: 0,
        backgroundColor: '#fafafa'
      },
      children: [
        this.buildComponentTree(),
        this.buildCanvas(),
        this.buildPropertyInspector()
      ]
    };
  }

  buildComponentTree() {
    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fff',
        borderRight: '1px solid #ddd',
        overflow: 'auto',
        padding: '12px'
      },
      children: [
        {
          type: 'heading',
          content: 'Components',
          level: 5,
          style: { margin: '0 0 12px 0', fontSize: '12px', fontWeight: 600 }
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '2px'
          },
          children: this.buildTreeNode(this.currentPattern?.definition, '')
        }
      ]
    };
  }

  buildTreeNode(element, path) {
    if (!element) return [];

    const isSelected = path === this.editorState.selectedPath;

    const node = {
      type: 'box',
      style: {
        padding: '6px 8px',
        backgroundColor: isSelected ? '#e3f2fd' : 'transparent',
        borderRadius: '3px',
        cursor: 'pointer',
        fontSize: '12px',
        color: isSelected ? '#1976d2' : '#333',
        fontWeight: isSelected ? 600 : 400,
        userSelect: 'none'
      },
      children: [
        {
          type: 'text',
          content: `${element.type || 'element'}${element.id ? ` #${element.id}` : ''}`
        }
      ]
    };

    const nodes = [node];

    if (element.children && Array.isArray(element.children)) {
      element.children.forEach((child, idx) => {
        const childPath = `${path}.children[${idx}]`;
        nodes.push(...this.buildTreeNode(child, childPath));
      });
    }

    return nodes;
  }

  buildCanvas() {
    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5',
        overflow: 'hidden'
      },
      children: [
        {
          type: 'box',
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 12px',
            backgroundColor: '#fff',
            borderBottom: '1px solid #ddd',
            fontSize: '12px'
          },
          children: [
            {
              type: 'text',
              content: `Zoom: ${this.editorState.zoom}%`
            },
            {
              type: 'box',
              style: { display: 'flex', gap: '4px' },
              children: [
                {
                  type: 'button',
                  content: '↶ Undo',
                  style: { padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }
                },
                {
                  type: 'button',
                  content: '↷ Redo',
                  style: { padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }
                },
                {
                  type: 'button',
                  content: '↻ Reset',
                  style: { padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }
                }
              ]
            }
          ]
        },
        {
          type: 'box',
          id: 'pattern-preview-container',
          style: {
            flex: 1,
            overflow: 'auto',
            padding: '20px',
            backgroundColor: '#f5f5f5'
          }
        }
      ]
    };
  }

  buildPropertyInspector() {
    const element = this.editorState.selectedElement;

    if (!element) {
      return {
        type: 'box',
        style: {
          padding: '16px',
          backgroundColor: '#fff',
          borderLeft: '1px solid #ddd',
          color: '#999'
        },
        children: [
          {
            type: 'text',
            content: 'Select an element to edit'
          }
        ]
      };
    }

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '12px',
        backgroundColor: '#fff',
        borderLeft: '1px solid #ddd',
        overflow: 'auto'
      },
      children: [
        {
          type: 'heading',
          content: 'Properties',
          level: 5,
          style: { margin: 0, fontSize: '12px', fontWeight: 600 }
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          },
          children: [
            {
              type: 'box',
              style: { display: 'flex', flexDirection: 'column', gap: '4px' },
              children: [
                { type: 'text', content: 'Type', style: { fontSize: '11px', fontWeight: 600 } },
                { type: 'input', value: element.type || '', style: { padding: '4px 8px', fontSize: '11px' } }
              ]
            },
            {
              type: 'box',
              style: { display: 'flex', flexDirection: 'column', gap: '4px' },
              children: [
                { type: 'text', content: 'Content', style: { fontSize: '11px', fontWeight: 600 } },
                { type: 'textarea', value: element.content || '', style: { padding: '4px 8px', fontSize: '11px', minHeight: '60px' } }
              ]
            },
            {
              type: 'heading',
              content: 'Styling',
              level: 6,
              style: { margin: '8px 0 0 0', fontSize: '11px', fontWeight: 600 }
            },
            this.buildStylePropertyInputs(element.style || {})
          ]
        }
      ]
    };
  }

  buildStylePropertyInputs(styles) {
    const commonProps = ['display', 'padding', 'margin', 'backgroundColor', 'color', 'fontSize', 'fontWeight'];

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      },
      children: commonProps.map(prop => ({
        type: 'box',
        style: { display: 'flex', gap: '4px', alignItems: 'center' },
        children: [
          { type: 'text', content: prop, style: { fontSize: '10px', flex: '0 0 80px', fontWeight: 500 } },
          { type: 'input', value: styles[prop] || '', placeholder: 'value', style: { padding: '4px', fontSize: '11px', flex: 1 } }
        ]
      }))
    };
  }

  on(event, callback) {
    this.listeners.push({ event, callback });
    return this;
  }

  off(event, callback) {
    this.listeners = this.listeners.filter(
      l => !(l.event === event && l.callback === callback)
    );
    return this;
  }

  notifyListeners(event, data) {
    this.listeners
      .filter(l => l.event === event)
      .forEach(l => {
        try {
          l.callback(data);
        } catch (e) {
          console.error(`Pattern editor listener error for ${event}:`, e);
        }
      });
  }

  clear() {
    this.currentPattern = null;
    this.editHistory = [];
    this.previewElement = null;
    this.listeners = [];
    this.undoStack = [];
    this.redoStack = [];
    return this;
  }
}

function createPatternEditor(universalRenderer) {
  return new PatternEditor(universalRenderer);
}

export { PatternEditor, createPatternEditor };
