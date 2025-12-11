// Component tree builder for editor UI
export class EditorTreeBuilder {
  constructor(core) {
    this.core = core;
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
          children: this.buildTreeNode(this.core.currentPattern?.definition, '')
        }
      ]
    };
  }

  buildTreeNode(element, path) {
    if (!element) return [];

    const isSelected = path === this.core.editorState.selectedPath;

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
}
