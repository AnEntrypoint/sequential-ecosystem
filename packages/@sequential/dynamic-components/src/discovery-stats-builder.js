// Statistics cards builder - displays pattern discovery stats
export function buildStatsCards(stats) {
  return {
    type: 'flex',
    direction: 'row',
    gap: '16px',
    style: { flexWrap: 'wrap' },
    children: [
      buildStatCard(stats.totalPatterns.toString(), 'Total Patterns', '#0078d4'),
      buildStatCard(stats.categories.toString(), 'Categories', '#107c10'),
      buildStatCard(`${stats.averageCodeReduction}%`, 'Avg Code Reduction', '#d13438')
    ]
  };
}

function buildStatCard(value, label, color) {
  return {
    type: 'flex',
    direction: 'column',
    gap: '8px',
    style: {
      flex: '1',
      minWidth: '150px',
      padding: '16px',
      background: '#f5f5f5',
      borderRadius: '8px',
      textAlign: 'center'
    },
    children: [
      {
        type: 'paragraph',
        content: value,
        style: { margin: 0, fontSize: '28px', fontWeight: '700', color }
      },
      {
        type: 'paragraph',
        content: label,
        style: { margin: '4px 0 0 0', fontSize: '13px', color: '#666' }
      }
    ]
  };
}
