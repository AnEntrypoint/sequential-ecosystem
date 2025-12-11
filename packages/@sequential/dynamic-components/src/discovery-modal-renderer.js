// Modal rendering
export class DiscoveryModalRenderer {
  constructor(state, panels) {
    this.state = state;
    this.panels = panels;
  }

  buildModal() {
    return {
      type: 'box',
      style: {
        position: 'fixed',
        inset: 0,
        background: this.state.isOpen ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: this.state.isOpen ? 'auto' : 'none',
        opacity: this.state.isOpen ? 1 : 0,
        transition: 'all 0.2s'
      },
      children: [
        {
          type: 'box',
          style: {
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
            width: '90%',
            maxWidth: '1000px',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          },
          children: [
            {
              type: 'flex',
              style: {
                padding: '16px 20px',
                borderBottom: '1px solid #e0e0e0',
                justifyContent: 'space-between',
                alignItems: 'center'
              },
              children: [
                { type: 'heading', content: '🎨 Pattern Discovery', level: 2, style: { margin: 0, fontSize: '18px', color: '#333' } },
                {
                  type: 'button',
                  label: '✕',
                  style: {
                    background: 'transparent',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer',
                    color: '#999'
                  },
                  onClick: () => this.state.close()
                }
              ]
            },
            {
              type: 'flex',
              style: { flex: 1, overflow: 'hidden', padding: '16px 20px', gap: '16px' },
              children: [
                this.panels.buildSearchPanel(),
                this.panels.buildPatternList(),
                this.panels.buildPreviewPanel()
              ]
            }
          ]
        }
      ]
    };
  }

  render() {
    return this.buildModal();
  }
}
