// Searchable list builder with search input
export function buildSearchableList(themeEngine, items, options = {}) {
  return {
    type: 'flex',
    direction: 'column',
    gap: themeEngine.getSpacing('md'),
    children: [
      {
        type: 'input',
        placeholder: options.searchPlaceholder || 'Search...',
        inputType: 'text',
        onChange: options.onSearch,
        style: { width: '100%' }
      },
      {
        type: 'flex',
        direction: 'column',
        gap: themeEngine.getSpacing('sm'),
        children: items.map(item => ({
          type: 'card',
          variant: 'flat',
          content: item.label,
          style: {
            cursor: 'pointer',
            padding: themeEngine.getSpacing('md')
          }
        }))
      }
    ]
  };
}
