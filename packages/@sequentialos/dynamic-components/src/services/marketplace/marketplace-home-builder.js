// Marketplace home view builder with featured and trending sections
import { buildPatternCard } from './marketplace-pattern-card.js';

export function buildMarketplaceUI(store) {
  const featured = store.getFeaturedPatterns(6);
  const trending = store.getTrendingPatterns(6);

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
          ...featured.map(pattern => buildPatternCard(pattern))
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
          ...trending.map(pattern => buildPatternCard(pattern))
        ]
      }
    ]
  };
}
