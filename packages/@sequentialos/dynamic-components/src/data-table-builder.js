// Data table builder with columnar layout
export function buildDataTable(themeEngine, columns, rows, options = {}) {
  return {
    type: 'flex',
    direction: 'column',
    gap: '0',
    style: {
      border: `1px solid ${themeEngine.getColor('border')}`,
      borderRadius: themeEngine.getBorderRadius('md'),
      overflow: 'auto'
    },
    children: [
      {
        type: 'flex',
        direction: 'row',
        gap: '0',
        style: {
          background: themeEngine.getColor('backgroundLight'),
          borderBottom: `1px solid ${themeEngine.getColor('border')}`,
          fontWeight: '600'
        },
        children: columns.map(col => ({
          type: 'paragraph',
          content: col.label,
          style: {
            flex: col.flex || 1,
            padding: themeEngine.getSpacing('md'),
            borderRight: `1px solid ${themeEngine.getColor('borderLight')}`
          }
        }))
      },
      ...rows.map((row, idx) => ({
        type: 'flex',
        direction: 'row',
        gap: '0',
        style: {
          borderBottom: idx < rows.length - 1 ? `1px solid ${themeEngine.getColor('border')}` : 'none',
          background: idx % 2 === 0 ? 'transparent' : themeEngine.getColor('backgroundLight')
        },
        children: columns.map(col => ({
          type: 'paragraph',
          content: row[col.key] || '',
          style: {
            flex: col.flex || 1,
            padding: themeEngine.getSpacing('md'),
            borderRight: `1px solid ${themeEngine.getColor('borderLight')}`
          }
        }))
      }))
    ]
  };
}
