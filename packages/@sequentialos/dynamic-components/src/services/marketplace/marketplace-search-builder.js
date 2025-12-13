// Marketplace search UI builder with filters and categories
export function buildSearchUI(store) {
  const categories = store.getCategories();

  return {
    type: 'box',
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      padding: '16px',
      backgroundColor: '#f9f9f9',
      borderRadius: '6px'
    },
    children: [
      {
        type: 'heading',
        content: 'Search Patterns',
        level: 4,
        style: { margin: 0, fontSize: '14px', fontWeight: 600 }
      },
      {
        type: 'input',
        placeholder: 'Search patterns...',
        style: {
          padding: '8px 12px',
          borderRadius: '4px',
          border: '1px solid #ddd',
          fontSize: '13px',
          width: '100%'
        }
      },
      {
        type: 'heading',
        content: 'Categories',
        level: 5,
        style: { margin: '8px 0 0 0', fontSize: '12px', fontWeight: 600 }
      },
      {
        type: 'box',
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        },
        children: categories.map(cat => ({
          type: 'box',
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          },
          children: [
            {
              type: 'input',
              value: cat,
              checked: false,
              style: { cursor: 'pointer' }
            },
            {
              type: 'text',
              content: cat,
              style: { fontSize: '12px' }
            }
          ]
        }))
      }
    ]
  };
}
