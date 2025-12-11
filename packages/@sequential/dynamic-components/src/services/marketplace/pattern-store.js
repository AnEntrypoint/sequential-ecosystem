// Pattern store facade - maintains 100% backward compatibility
import { PatternLifecycle } from '../../pattern-store-lifecycle.js';
import { PatternMetadata } from '../../pattern-store-metadata.js';
import { PatternQueries } from '../../pattern-store-queries.js';

export class PatternStore {
  constructor() {
    this.patterns = new Map();
    this.categories = new Map();
    this.ratings = new Map();
    this.downloads = new Map();
    this.favorites = new Map();
    this.reviews = [];
    this.featured = [];
    this.searchIndex = new Map();
    this.listeners = [];

    this.lifecycle = new PatternLifecycle(this.patterns, this.categories, this.searchIndex, this.listeners);
    this.metadata = new PatternMetadata(this.patterns, this.ratings, this.downloads, this.favorites, this.reviews, this.listeners);
    this.queries = new PatternQueries(this.patterns, this.categories, this.searchIndex, this.featured, this.listeners);
  }

  publishPattern(patternId, metadata, definition) {
    return this.lifecycle.publishPattern(patternId, metadata, definition);
  }

  unpublishPattern(patternId) {
    return this.lifecycle.unpublishPattern(patternId);
  }

  updatePattern(patternId, metadata, definition) {
    return this.lifecycle.updatePattern(patternId, metadata, definition);
  }

  downloadPattern(patternId, userId) {
    return this.metadata.downloadPattern(patternId, userId);
  }

  ratePattern(patternId, userId, rating) {
    return this.metadata.ratePattern(patternId, userId, rating);
  }

  reviewPattern(patternId, userId, review) {
    return this.metadata.reviewPattern(patternId, userId, review);
  }

  favoritePattern(patternId, userId) {
    return this.metadata.favoritePattern(patternId, userId);
  }

  unfavoritePattern(patternId, userId) {
    return this.metadata.unfavoritePattern(patternId, userId);
  }

  isFavorited(patternId, userId) {
    return this.metadata.isFavorited(patternId, userId);
  }

  getUserFavorites(userId) {
    return this.metadata.getUserFavorites(userId);
  }

  featurePattern(patternId) {
    const pattern = this.patterns.get(patternId);
    if (!pattern) return false;
    pattern.isFeatured = true;
    if (!this.featured.includes(patternId)) {
      this.featured.unshift(patternId);
      if (this.featured.length > 20) {
        this.featured.pop();
      }
    }
    this.listeners
      .filter(l => l.event === 'patternFeatured')
      .forEach(l => l.callback({ patternId }));
    return true;
  }

  unfeaturePattern(patternId) {
    const pattern = this.patterns.get(patternId);
    if (!pattern) return false;
    pattern.isFeatured = false;
    const idx = this.featured.indexOf(patternId);
    if (idx >= 0) {
      this.featured.splice(idx, 1);
    }
    this.listeners
      .filter(l => l.event === 'patternUnfeatured')
      .forEach(l => l.callback({ patternId }));
    return true;
  }

  search(query, filters = {}) {
    return this.queries.search(query, filters);
  }

  getPatternsByCategory(category) {
    return this.queries.getPatternsByCategory(category);
  }

  getCategories() {
    return this.queries.getCategories();
  }

  getFeaturedPatterns(limit = 10) {
    return this.queries.getFeaturedPatterns(limit);
  }

  getTrendingPatterns(limit = 10) {
    return this.queries.getTrendingPatterns(limit);
  }

  getTopRatedPatterns(limit = 10) {
    return this.queries.getTopRatedPatterns(limit);
  }

  on(event, callback) {
    this.listeners.push({ event, callback });
    return this;
  }

  off(event, callback) {
    this.listeners = this.listeners.filter(
      l => !(l.event === event && l.callback === callback)
    );
    return this;
  }

  clear() {
    this.patterns.clear();
    this.categories.clear();
    this.ratings.clear();
    this.downloads.clear();
    this.favorites.clear();
    this.reviews = [];
    this.featured = [];
    this.searchIndex.clear();
    this.listeners = [];
    return this;
  }
}
