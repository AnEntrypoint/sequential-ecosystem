// Modal panel builders
export class DiscoveryModalPanels {
  constructor(state) {
    this.state = state;
  }

  buildSearchPanel() {
    return {
      type: 'flex',
      direction: 'column',
      gap: '12px',
      style: { flex: 0.4, borderRight: '1px solid #e0e0e0', paddingRight: '16px' },
      children: [
        {
          type: 'input',
          value: this.state.searchQuery,
          placeholder: 'Search patterns...',
          style: {
            width: '100%',
            padding: '8px 10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '13px'
          },
          onChange: (e) => this.state.setSearchQuery(e.target.value)
        },
        {
          type: 'heading',
          content: 'Categories',
          level: 4,
          style: { margin: '0 0 8px 0', fontSize: '12px', fontWeight: '600', color: '#333' }
        },
        {
          type: 'flex',
          direction: 'column',
          gap: '4px',
          children: [
            { label: 'All', category: null },
            { label: 'Forms', category: 'forms' },
            { label: 'Lists', category: 'lists' },
            { label: 'Charts', category: 'charts' },
            { label: 'Tables', category: 'tables' },
            { label: 'Modals', category: 'modals' },
            { label: 'Grids', category: 'grids' }
          ].map(cat => ({
            type: 'button',
            label: cat.label,
            style: {
              width: '100%',
              textAlign: 'left',
              padding: '8px 10px',
              border: this.state.selectedCategory === cat.category ? '1px solid #0078d4' : '1px solid #ddd',
              background: this.state.selectedCategory === cat.category ? '#e7f0ff' : 'white',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              color: this.state.selectedCategory === cat.category ? '#0078d4' : '#333'
            },
            onClick: () => this.state.setCategory(cat.category)
          }))
        }
      ]
    };
  }

  buildPatternList() {
    const patterns = this.state.getFilteredPatterns();

    return {
      type: 'flex',
      direction: 'column',
      gap: '8px',
      style: { flex: 0.6, overflowY: 'auto', maxHeight: '500px' },
      children: patterns.length > 0
        ? patterns.map(pattern => ({
          type: 'box',
          style: {
            padding: '10px 12px',
            border: this.state.selectedPattern?.id === pattern.id ? '2px solid #0078d4' : '1px solid #e0e0e0',
            borderRadius: '4px',
            background: this.state.selectedPattern?.id === pattern.id ? '#e7f0ff' : '#f9f9f9',
            cursor: 'pointer',
            transition: 'all 0.2s'
          },
          onClick: () => this.state.selectPattern(pattern),
          children: [
            {
              type: 'flex',
              gap: '8px',
              alignItems: 'center',
              style: { marginBottom: '6px' },
              children: [
                { type: 'paragraph', content: pattern.icon || '◆', style: { margin: 0, fontSize: '16px' } },
                {
                  type: 'flex',
                  direction: 'column',
                  gap: '2px',
                  style: { flex: 1 },
                  children: [
                    { type: 'paragraph', content: pattern.name, style: { margin: 0, fontSize: '13px', fontWeight: '600', color: '#333' } },
                    { type: 'paragraph', content: `Code reduction: ${pattern.codeReduction}`, style: { margin: 0, fontSize: '10px', color: '#0078d4' } }
                  ]
                }
              ]
            },
            { type: 'paragraph', content: pattern.description, style: { margin: 0, fontSize: '11px', color: '#666' } }
          ]
        }))
        : [
          { type: 'paragraph', content: 'No patterns found', style: { textAlign: 'center', color: '#999', padding: '20px 0', margin: 0 } }
        ]
    };
  }

  buildPreviewPanel() {
    if (!this.state.selectedPattern) {
      return {
        type: 'box',
        style: { flex: 0.4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' },
        children: [{ type: 'paragraph', content: 'Select a pattern to preview', style: { margin: 0 } }]
      };
    }

    const pattern = this.state.selectedPattern;
    return {
      type: 'flex',
      direction: 'column',
      gap: '12px',
      style: { flex: 0.4, paddingLeft: '16px', borderLeft: '1px solid #e0e0e0' },
      children: [
        {
          type: 'flex',
          direction: 'column',
          gap: '4px',
          children: [
            { type: 'heading', content: pattern.name, level: 3, style: { margin: 0, fontSize: '16px', color: '#333' } },
            { type: 'paragraph', content: pattern.description, style: { margin: 0, fontSize: '12px', color: '#666' } }
          ]
        },
        {
          type: 'flex',
          gap: '8px',
          style: { flexWrap: 'wrap' },
          children: (pattern.tags || []).map(tag => ({
            type: 'box',
            style: {
              background: '#e7f0ff',
              color: '#0078d4',
              padding: '2px 8px',
              borderRadius: '3px',
              fontSize: '10px',
              fontWeight: '500'
            },
            children: [{ type: 'paragraph', content: tag, style: { margin: 0 } }]
          }))
        },
        {
          type: 'flex',
          direction: 'column',
          gap: '6px',
          children: [
            {
              type: 'flex',
              gap: '8px',
              children: [
                { type: 'paragraph', content: 'Code Reduction:', style: { margin: 0, fontSize: '11px', fontWeight: '600', color: '#333' } },
                { type: 'paragraph', content: pattern.codeReduction, style: { margin: 0, fontSize: '11px', color: '#0078d4', fontWeight: '600' } }
              ]
            },
            {
              type: 'flex',
              gap: '8px',
              children: [
                { type: 'paragraph', content: 'Category:', style: { margin: 0, fontSize: '11px', fontWeight: '600', color: '#333' } },
                { type: 'paragraph', content: pattern.category, style: { margin: 0, fontSize: '11px', color: '#666' } }
              ]
            },
            {
              type: 'flex',
              gap: '8px',
              children: [
                { type: 'paragraph', content: 'Author:', style: { margin: 0, fontSize: '11px', fontWeight: '600', color: '#333' } },
                { type: 'paragraph', content: pattern.author || 'system', style: { margin: 0, fontSize: '11px', color: '#666' } }
              ]
            }
          ]
        },
        {
          type: 'button',
          label: '✓ Insert Pattern',
          style: {
            width: '100%',
            padding: '8px 12px',
            background: '#0078d4',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600'
          },
          onClick: () => console.log('Insert pattern:', pattern.id)
        }
      ]
    };
  }
}
