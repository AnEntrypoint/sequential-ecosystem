// UI building for pattern discovery interfaces
export class DiscoveryUIBuilder {
  buildDiscoveryUI(stats, tags) {
    return {
      type: 'flex',
      direction: 'column',
      gap: '20px',
      style: { padding: '24px', background: '#fff' },
      children: [
        {
          type: 'heading',
          content: 'Pattern Discovery Hub',
          level: 2,
          style: { margin: '0 0 16px 0' }
        },
        this.buildStatsCards(stats),
        this.buildCategorySection(stats),
        this.buildTagsSection(stats)
      ]
    };
  }

  buildStatsCards(stats) {
    return {
      type: 'flex',
      direction: 'row',
      gap: '16px',
      style: { flexWrap: 'wrap' },
      children: [
        this.buildStatCard(
          stats.totalPatterns.toString(),
          'Total Patterns',
          '#0078d4'
        ),
        this.buildStatCard(
          stats.categories.toString(),
          'Categories',
          '#107c10'
        ),
        this.buildStatCard(
          `${stats.averageCodeReduction}%`,
          'Avg Code Reduction',
          '#d13438'
        )
      ]
    };
  }

  buildStatCard(value, label, color) {
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

  buildCategorySection(stats) {
    return {
      type: 'flex',
      direction: 'column',
      gap: '12px',
      style: { marginTop: '16px' },
      children: [
        {
          type: 'paragraph',
          content: 'Patterns by Category:',
          style: { margin: 0, fontSize: '14px', fontWeight: '600' }
        },
        {
          type: 'flex',
          direction: 'row',
          gap: '8px',
          style: { flexWrap: 'wrap' },
          children: Object.entries(stats.patternsPerCategory).map(([cat, count]) => ({
            type: 'box',
            style: {
              padding: '8px 12px',
              background: '#e8f5e9',
              color: '#2e7d32',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '600'
            },
            children: [
              {
                type: 'paragraph',
                content: `${cat}: ${count}`,
                style: { margin: 0 }
              }
            ]
          }))
        }
      ]
    };
  }

  buildTagsSection(stats) {
    return {
      type: 'flex',
      direction: 'column',
      gap: '12px',
      style: { marginTop: '16px' },
      children: [
        {
          type: 'paragraph',
          content: 'Most Used Tags:',
          style: { margin: 0, fontSize: '14px', fontWeight: '600' }
        },
        {
          type: 'flex',
          direction: 'row',
          gap: '8px',
          style: { flexWrap: 'wrap' },
          children: stats.mostCommonTags.map(({ tag, count }) => ({
            type: 'box',
            style: {
              padding: '8px 12px',
              background: '#e3f2fd',
              color: '#0078d4',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '500'
            },
            children: [
              {
                type: 'paragraph',
                content: `${tag} (${count})`,
                style: { margin: 0 }
              }
            ]
          }))
        }
      ]
    };
  }

  buildSearchUI(allTags) {
    return {
      type: 'flex',
      direction: 'column',
      gap: '16px',
      style: { padding: '20px' },
      children: [
        {
          type: 'flex',
          direction: 'row',
          gap: '12px',
          style: { alignItems: 'center' },
          children: [
            {
              type: 'paragraph',
              content: '🔍',
              style: { margin: 0, fontSize: '20px' }
            },
            {
              type: 'input',
              placeholder: 'Search patterns by name, category, or tags...',
              style: {
                flex: 1,
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }
            }
          ]
        },
        {
          type: 'flex',
          direction: 'row',
          gap: '8px',
          style: { flexWrap: 'wrap' },
          children: allTags.slice(0, 8).map(tag => ({
            type: 'button',
            label: tag,
            variant: 'secondary',
            style: {
              padding: '6px 12px',
              background: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '12px'
            }
          }))
        }
      ]
    };
  }
}
