// Marketplace UI facade - maintains 100% backward compatibility
import { MarketplaceState } from './marketplace-state.js';
import { MarketplaceUIComponents } from './marketplace-ui-components.js';
import { MarketplaceDetailBuilder } from './marketplace-detail-builder.js';

export class MarketplaceUI {
  constructor(patternMarketplace) {
    this.state = new MarketplaceState(patternMarketplace);
    this.components = new MarketplaceUIComponents();
    this.detailBuilder = new MarketplaceDetailBuilder();
    this.listeners = this.state.listeners;
  }

  setView(view) {
    return this.state.setView(view);
  }

  search(query) {
    return this.state.search(query);
  }

  setCategory(category) {
    return this.state.setCategory(category);
  }

  setSortBy(sortBy) {
    return this.state.setSortBy(sortBy);
  }

  insertPattern(patternId, targetPath = null) {
    return this.state.insertPattern(patternId, targetPath);
  }

  toggleFavorite(patternId, userId) {
    return this.state.toggleFavorite(patternId, userId);
  }

  buildMarketplacePanel() {
    const categories = this.state.marketplace.getCategories?.() || [];
    const featured = this.state.marketplace.getFeaturedPatterns?.(6) || [];
    const trending = this.state.marketplace.getTrendingPatterns?.(6) || [];

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '16px',
        backgroundColor: '#fafafa',
        height: '100%',
        overflow: 'auto'
      },
      children: [
        this.components.buildSearchBar(this.state.searchQuery),
        this.components.buildCategoryTabs(categories, this.state.selectedCategory),
        this.components.buildSortControls(this.state.sortBy),
        {
          type: 'heading',
          content: 'Featured Patterns',
          level: 4,
          style: { margin: '12px 0 8px 0', fontSize: '13px', fontWeight: 600 }
        },
        {
          type: 'box',
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '8px'
          },
          children: featured.map(p => this.components.buildPatternCardSmall(p))
        },
        {
          type: 'heading',
          content: 'Trending',
          level: 4,
          style: { margin: '12px 0 8px 0', fontSize: '13px', fontWeight: 600 }
        },
        {
          type: 'box',
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '8px'
          },
          children: trending.map(p => this.components.buildPatternCardSmall(p))
        }
      ]
    };
  }

  buildDetailView(patternId) {
    return this.detailBuilder.buildDetailView(patternId, this.state.marketplace);
  }

  on(event, callback) {
    return this.state.on(event, callback);
  }

  off(event, callback) {
    return this.state.off(event, callback);
  }

  clear() {
    return this.state.clear();
  }
}

export const createMarketplaceUI = (patternMarketplace) =>
  new MarketplaceUI(patternMarketplace);
