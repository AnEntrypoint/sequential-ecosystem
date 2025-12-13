// Discovery search and category filter panel builder
export function buildSearchPanel(state) {
  return {
    type: 'flex',
    direction: 'column',
    gap: '12px',
    style: { flex: 0.4, borderRight: '1px solid #e0e0e0', paddingRight: '16px' },
    children: [
      {
        type: 'input',
        value: state.searchQuery,
        placeholder: 'Search patterns...',
        style: {
          width: '100%',
          padding: '8px 10px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          fontSize: '13px'
        },
        onChange: (e) => state.setSearchQuery(e.target.value)
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
            border: state.selectedCategory === cat.category ? '1px solid #0078d4' : '1px solid #ddd',
            background: state.selectedCategory === cat.category ? '#e7f0ff' : 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            color: state.selectedCategory === cat.category ? '#0078d4' : '#333'
          },
          onClick: () => state.setCategory(cat.category)
        }))
      }
    ]
  };
}
