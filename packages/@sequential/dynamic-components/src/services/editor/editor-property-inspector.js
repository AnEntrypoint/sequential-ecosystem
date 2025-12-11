// Property inspector builder for editor UI
export class EditorPropertyInspector {
  constructor(core) {
    this.core = core;
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
