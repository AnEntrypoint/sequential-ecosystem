// Suggestions UI component builders
export class SuggestionsUIComponents {
  buildSearchBar(onSearch, currentQuery = '') {
    return {
      type: 'box',
      style: { display: 'flex', gap: '8px', marginBottom: '8px' },
      children: [
        {
          type: 'input',
          placeholder: 'Search patterns...',
          value: currentQuery,
          onChange: (val) => onSearch(val),
          style: { flex: 1, padding: '8px' }
        },
        { type: 'button', content: '🔍', onClick: () => onSearch(currentQuery) }
      ]
    };
  }

  buildContextFilters(context, onFilterChange) {
    return {
      type: 'box',
      style: { display: 'flex', gap: '4px', flexWrap: 'wrap' },
      children: [
        { type: 'text', content: 'Filters:', style: { fontSize: '10px', color: '#858585' } },
        ...Object.entries(context).map(([key, val]) => ({
          type: 'button',
          content: `${key}: ${val}`,
          style: { fontSize: '9px', padding: '4px 8px' },
          onClick: () => onFilterChange(key)
        }))
      ]
    };
  }

  buildSuggestionsGrid(suggestions, onSelect) {
    return {
      type: 'box',
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px'
      },
      children: suggestions.map((sugg, idx) =>
        this.buildSuggestionCard(sugg, idx, onSelect)
      )
    };
  }

  buildSuggestionCard(suggestion, index, onSelect) {
    return {
      type: 'box',
      style: {
        padding: '12px',
        background: '#2d2d30',
        borderRadius: '4px',
        border: '1px solid #3e3e42',
        cursor: 'pointer'
      },
      onClick: () => onSelect(suggestion),
      children: [
        { type: 'heading', content: suggestion.name, level: 4, style: { margin: 0 } },
        { type: 'text', content: suggestion.description || '', style: { fontSize: '10px', color: '#858585' } },
        {
          type: 'box',
          style: { display: 'flex', gap: '4px', marginTop: '8px' },
          children: (suggestion.tags || []).slice(0, 2).map(tag => ({
            type: 'box',
            style: { padding: '2px 6px', background: '#667eea', borderRadius: '2px', fontSize: '8px' },
            children: [{ type: 'text', content: tag }]
          }))
        }
      ]
    };
  }

  buildDetailView(suggestion) {
    return {
      type: 'box',
      style: { padding: '16px' },
      children: [
        { type: 'heading', content: suggestion.name, level: 2 },
        { type: 'text', content: suggestion.description || 'No description' },
        suggestion.tags && {
          type: 'box',
          style: { marginTop: '12px' },
          children: [
            { type: 'text', content: 'Tags:', style: { fontWeight: 'bold' } },
            ...suggestion.tags.map(tag => ({
              type: 'button',
              content: tag,
              style: { marginRight: '4px', marginTop: '4px' }
            }))
          ]
        }
      ].filter(Boolean)
    };
  }

  buildEmptyState() {
    return {
      type: 'box',
      style: { textAlign: 'center', padding: '40px' },
      children: [
        { type: 'text', content: '🔍 No suggestions found', style: { fontSize: '16px' } },
        { type: 'text', content: 'Try a different query or context', style: { fontSize: '12px', color: '#858585' } }
      ]
    };
  }
}
