// Command palette UI structure builder
export class PaletteUIBuilder {
  buildPaletteUI(state) {
    const itemHeight = 50;
    const maxHeight = Math.min(state.filteredPatterns.length * itemHeight + 100, 500);

    return {
      type: 'box',
      style: {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        maxHeight: `${maxHeight}px`,
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        zIndex: 50000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      },
      children: [
        this.buildSearchHeader(state),
        this.buildResultsList(state),
        this.buildFooter()
      ]
    };
  }

  buildSearchHeader(state) {
    return {
      type: 'flex',
      style: {
        padding: '12px 16px',
        borderBottom: '1px solid #e0e0e0',
        gap: '8px',
        alignItems: 'center'
      },
      children: [
        { type: 'paragraph', content: '🔍', style: { margin: 0, fontSize: '16px' } },
        {
          type: 'input',
          placeholder: 'Search patterns... (type to filter, ↑↓ to navigate, Enter to select)',
          value: state.searchQuery,
          style: {
            flex: 1,
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            fontFamily: 'inherit'
          },
          onChange: (e) => state.setSearchQuery(e.target?.value || '')
        }
      ]
    };
  }

  buildResultsList(state) {
    return {
      type: 'box',
      style: {
        flex: 1,
        overflowY: 'auto',
        maxHeight: '400px',
        display: 'flex',
        flexDirection: 'column'
      },
      children: state.filteredPatterns.length > 0
        ? state.filteredPatterns.map((pattern, idx) => this.buildPatternItem(pattern, idx, state.selectedIndex))
        : [{ type: 'paragraph', content: 'No patterns found', style: { textAlign: 'center', color: '#999', padding: '20px', margin: 0 } }]
    };
  }

  buildPatternItem(pattern, idx, selectedIndex) {
    return {
      type: 'box',
      style: {
        padding: '12px 16px',
        borderBottom: '1px solid #f0f0f0',
        background: idx === selectedIndex ? '#f0f7ff' : 'white',
        cursor: 'pointer',
        transition: 'all 0.1s'
      },
      onClick: () => idx,
      children: [
        {
          type: 'flex',
          gap: '12px',
          alignItems: 'center',
          children: [
            { type: 'paragraph', content: pattern.icon || '◆', style: { margin: 0, fontSize: '18px', minWidth: '24px' } },
            {
              type: 'flex',
              direction: 'column',
              gap: '4px',
              style: { flex: 1 },
              children: [
                { type: 'paragraph', content: pattern.name, style: { margin: 0, fontSize: '13px', fontWeight: '600', color: '#333' } },
                { type: 'paragraph', content: `${pattern.category} • ${pattern.codeReduction} reduction`, style: { margin: 0, fontSize: '11px', color: '#999' } }
              ]
            }
          ]
        }
      ]
    };
  }

  buildFooter() {
    return {
      type: 'flex',
      style: {
        padding: '8px 16px',
        background: '#f9f9f9',
        borderTop: '1px solid #e0e0e0',
        gap: '12px',
        fontSize: '11px',
        color: '#666'
      },
      children: [
        { type: 'paragraph', content: '↑↓ Navigate', style: { margin: 0 } },
        { type: 'paragraph', content: 'Enter Select', style: { margin: 0 } },
        { type: 'paragraph', content: 'Esc Close', style: { margin: 0 } }
      ]
    };
  }
}
