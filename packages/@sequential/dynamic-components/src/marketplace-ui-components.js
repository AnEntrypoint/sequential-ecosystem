// Marketplace UI components
export class MarketplaceUIComponents {
  buildSearchBar(searchQuery) {
    return {
      type: 'box',
      style: {
        display: 'flex',
        gap: '8px'
      },
      children: [
        {
          type: 'input',
          placeholder: 'Search patterns...',
          value: searchQuery,
          style: {
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '12px',
            flex: 1
          }
        },
        {
          type: 'button',
          content: '🔍',
          style: {
            padding: '8px 12px',
            backgroundColor: '#667eea',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }
        }
      ]
    };
  }

  buildCategoryTabs(categories, selectedCategory) {
    return {
      type: 'box',
      style: {
        display: 'flex',
        gap: '4px',
        flexWrap: 'wrap'
      },
      children: [
        {
          type: 'button',
          content: 'All',
          style: {
            padding: '6px 12px',
            backgroundColor: !selectedCategory ? '#667eea' : '#e0e0e0',
            color: !selectedCategory ? '#fff' : '#333',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: !selectedCategory ? 600 : 400
          }
        },
        ...categories.slice(0, 5).map(cat => ({
          type: 'button',
          content: cat,
          style: {
            padding: '6px 12px',
            backgroundColor: selectedCategory === cat ? '#667eea' : '#e0e0e0',
            color: selectedCategory === cat ? '#fff' : '#333',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: selectedCategory === cat ? 600 : 400
          }
        }))
      ]
    };
  }

  buildSortControls(sortBy) {
    const sortOptions = [
      { label: 'Recent', value: 'recent' },
      { label: 'Downloads', value: 'downloads' },
      { label: 'Rating', value: 'rating' }
    ];

    return {
      type: 'box',
      style: {
        display: 'flex',
        gap: '4px'
      },
      children: sortOptions.map(opt => ({
        type: 'button',
        content: opt.label,
        style: {
          padding: '4px 8px',
          backgroundColor: sortBy === opt.value ? '#667eea' : '#f0f0f0',
          color: sortBy === opt.value ? '#fff' : '#666',
          border: 'none',
          borderRadius: '3px',
          cursor: 'pointer',
          fontSize: '11px'
        }
      }))
    };
  }

  buildPatternCardSmall(pattern) {
    return {
      type: 'box',
      style: {
        padding: '8px',
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      },
      children: [
        {
          type: 'text',
          content: pattern.name,
          style: { fontSize: '11px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }
        },
        {
          type: 'text',
          content: `${pattern.rating.toFixed(1)} ★ • ${pattern.downloadCount} downloads`,
          style: { fontSize: '10px', color: '#999' }
        },
        {
          type: 'button',
          content: 'Insert',
          style: {
            padding: '4px 8px',
            backgroundColor: '#667eea',
            color: '#fff',
            border: 'none',
            borderRadius: '2px',
            cursor: 'pointer',
            fontSize: '10px',
            marginTop: '4px'
          }
        }
      ]
    };
  }
}
