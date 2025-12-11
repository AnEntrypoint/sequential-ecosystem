export class EditorUI {
  constructor(core) {
    this.core = core;
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
              content: `Zoom: ${this.core.editorState.zoom}%`
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
    const element = this.core.editorState.selectedElement;

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
}
