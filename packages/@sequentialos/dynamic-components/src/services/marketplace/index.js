import { PatternStore } from './pattern-store.js';
import { MarketplaceUI } from './marketplace-ui.js';

export class PatternMarketplace {
  constructor() {
    this.store = new PatternStore();
    this.ui = new MarketplaceUI(this.store);
  }

  publishPattern(patternId, metadata, definition) {
    return this.store.publishPattern(patternId, metadata, definition);
  }

  unpublishPattern(patternId) {
    return this.store.unpublishPattern(patternId);
  }

  updatePattern(patternId, metadata, definition) {
    return this.store.updatePattern(patternId, metadata, definition);
  }

  downloadPattern(patternId, userId) {
    return this.store.downloadPattern(patternId, userId);
  }

  ratePattern(patternId, userId, rating) {
    return this.store.ratePattern(patternId, userId, rating);
  }

  reviewPattern(patternId, userId, review) {
    return this.store.reviewPattern(patternId, userId, review);
  }

  favoritePattern(patternId, userId) {
    return this.store.favoritePattern(patternId, userId);
  }

  unfavoritePattern(patternId, userId) {
    return this.store.unfavoritePattern(patternId, userId);
  }

  isFavorited(patternId, userId) {
    return this.store.isFavorited(patternId, userId);
  }

  getUserFavorites(userId) {
    return this.store.getUserFavorites(userId);
  }

  featurePattern(patternId) {
    return this.store.featurePattern(patternId);
  }

  unfeaturePattern(patternId) {
    return this.store.unfeaturePattern(patternId);
  }

  search(query, filters) {
    return this.store.search(query, filters);
  }

  getPatternsByCategory(category) {
    return this.store.getPatternsByCategory(category);
  }

  getCategories() {
    return this.store.getCategories();
  }

  getFeaturedPatterns(limit) {
    return this.store.getFeaturedPatterns(limit);
  }

  getTrendingPatterns(limit) {
    return this.store.getTrendingPatterns(limit);
  }

  getTopRatedPatterns(limit) {
    return this.store.getTopRatedPatterns(limit);
  }

  buildMarketplaceUI() {
    return this.ui.buildMarketplaceUI();
  }

  buildSearchUI() {
    return this.ui.buildSearchUI();
  }

  on(event, callback) {
    return this.store.on(event, callback);
  }

  off(event, callback) {
    return this.store.off(event, callback);
  }

  clear() {
    return this.store.clear();
  }
}

export const createPatternMarketplace = () => new PatternMarketplace();
