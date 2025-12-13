// Facade maintaining 100% backward compatibility with editor UI builders
import { EditorTreeBuilder } from './editor-tree-builder.js';
import { EditorCanvasBuilder } from './editor-canvas-builder.js';
import { EditorPropertyInspector } from './editor-property-inspector.js';

export class EditorUI {
  constructor(core) {
    this.core = core;
    this.treeBuilder = new EditorTreeBuilder(core);
    this.canvasBuilder = new EditorCanvasBuilder(core);
    this.propertyInspector = new EditorPropertyInspector(core);
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
    return this.treeBuilder.buildComponentTree();
  }

  buildTreeNode(element, path) {
    return this.treeBuilder.buildTreeNode(element, path);
  }

  buildCanvas() {
    return this.canvasBuilder.buildCanvas();
  }

  buildPropertyInspector() {
    return this.propertyInspector.buildPropertyInspector();
  }

  buildStylePropertyInputs(styles) {
    return this.propertyInspector.buildStylePropertyInputs(styles);
  }
}
