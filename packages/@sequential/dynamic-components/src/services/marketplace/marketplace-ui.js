// Facade maintaining 100% backward compatibility with marketplace UI builders
import { buildPatternCard } from './marketplace-pattern-card.js';
import { buildMarketplaceUI } from './marketplace-home-builder.js';
import { buildSearchUI } from './marketplace-search-builder.js';

export class MarketplaceUI {
  constructor(store) {
    this.store = store;
  }

  buildPatternCard(pattern) {
    return buildPatternCard(pattern);
  }

  buildMarketplaceUI() {
    return buildMarketplaceUI(this.store);
  }

  buildSearchUI() {
    return buildSearchUI(this.store);
  }
}
