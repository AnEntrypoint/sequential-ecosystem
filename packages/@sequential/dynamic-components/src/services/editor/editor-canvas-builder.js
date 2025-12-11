// Canvas/preview builder for editor UI
export class EditorCanvasBuilder {
  constructor(core) {
    this.core = core;
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
}
