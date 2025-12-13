// UI builder for code generation interface
export class CodegenUIBuilder {
  buildCodegenUI(supportedFormats = ['react-jsx', 'react-ts', 'vue3', 'svelte', 'web-component', 'angular']) {
    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '12px',
        background: '#1e1e1e',
        borderRadius: '6px'
      },
      children: [
        {
          type: 'heading',
          content: '⚙️ Code Generator',
          level: 3,
          style: { margin: 0, fontSize: '12px', color: '#e0e0e0' }
        },
        {
          type: 'box',
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px'
          },
          children: supportedFormats.map(format => ({
            type: 'box',
            style: {
              padding: '8px 12px',
              background: '#2d2d30',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '10px',
              color: '#d4d4d4',
              border: '1px solid #3e3e42',
              textAlign: 'center'
            },
            children: [{
              type: 'paragraph',
              content: format.replace('-', ' ').toUpperCase(),
              style: { margin: 0 }
            }]
          }))
        }
      ]
    };
  }
}
