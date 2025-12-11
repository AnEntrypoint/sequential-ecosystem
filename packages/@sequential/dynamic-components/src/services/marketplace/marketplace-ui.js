export class MarketplaceUI {
  constructor(store) {
    this.store = store;
  }

  buildPatternCard(pattern) {
    return {
      type: 'box',
      style: {
        padding: '16px',
        backgroundColor: '#fff',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s'
      },
      children: [
        {
          type: 'heading',
          content: pattern.name,
          level: 4,
          style: { margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600 }
        },
        {
          type: 'text',
          content: pattern.description,
          style: { margin: '0 0 12px 0', fontSize: '13px', color: '#666', lineHeight: 1.5 }
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
            fontSize: '12px'
          },
          children: [
            {
              type: 'text',
              content: `By ${pattern.author}`,
              style: { color: '#999' }
            },
            {
              type: 'text',
              content: `${pattern.rating.toFixed(1)} ★`,
              style: { fontWeight: 600, color: '#ffc107' }
            }
          ]
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            gap: '6px',
            flexWrap: 'wrap'
          },
          children: pattern.tags.slice(0, 3).map(tag => ({
            type: 'box',
            style: {
              padding: '2px 8px',
              backgroundColor: '#f0f0f0',
              borderRadius: '3px',
              fontSize: '11px',
              color: '#666'
            },
            children: [{ type: 'text', content: tag }]
          }))
        }
      ]
    };
  }

  buildMarketplaceUI() {
    const featured = this.store.getFeaturedPatterns(6);
    const trending = this.store.getTrendingPatterns(6);

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        padding: '20px',
        backgroundColor: '#fafafa'
      },
      children: [
        {
          type: 'heading',
          content: 'Pattern Marketplace',
          level: 1,
          style: { margin: 0, fontSize: '28px', fontWeight: 700 }
        },
        {
          type: 'box',
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '16px'
          },
          children: [
            {
              type: 'heading',
              content: 'Featured Patterns',
              level: 2,
              style: { margin: 0, fontSize: '20px', fontWeight: 600, gridColumn: '1/-1' }
            },
            ...featured.map(pattern => this.buildPatternCard(pattern))
          ]
        },
        {
          type: 'box',
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '16px'
          },
          children: [
            {
              type: 'heading',
              content: 'Trending Now',
              level: 2,
              style: { margin: 0, fontSize: '20px', fontWeight: 600, gridColumn: '1/-1' }
            },
            ...trending.map(pattern => this.buildPatternCard(pattern))
          ]
        }
      ]
    };
  }

  buildSearchUI() {
    const categories = this.store.getCategories();

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
}
