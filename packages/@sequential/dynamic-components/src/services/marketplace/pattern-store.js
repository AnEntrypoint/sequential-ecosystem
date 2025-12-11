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
  }

  publishPattern(patternId, metadata, definition) {
    const pattern = {
      id: patternId,
      name: metadata.name,
      description: metadata.description || '',
      author: metadata.author || 'Anonymous',
      version: metadata.version || '1.0.0',
      category: metadata.category || 'general',
      tags: metadata.tags || [],
      definition,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublished: true,
      isFeatured: false,
      downloadCount: 0,
      rating: 0,
      reviewCount: 0,
      license: metadata.license || 'MIT',
      repository: metadata.repository || '',
      homepage: metadata.homepage || '',
      keywords: metadata.keywords || []
    };

    this.patterns.set(patternId, pattern);
    this.indexPatternForSearch(patternId, pattern);
    this.addToCategory(metadata.category, patternId);
    this.notifyListeners('patternPublished', { patternId, pattern });
    return patternId;
  }

  unpublishPattern(patternId) {
    const pattern = this.patterns.get(patternId);
    if (!pattern) return false;
    pattern.isPublished = false;
    this.notifyListeners('patternUnpublished', { patternId });
    return true;
  }

  updatePattern(patternId, metadata, definition) {
    const pattern = this.patterns.get(patternId);
    if (!pattern) return false;

    Object.assign(pattern, {
      name: metadata.name || pattern.name,
      description: metadata.description || pattern.description,
      version: metadata.version || pattern.version,
      tags: metadata.tags || pattern.tags,
      keywords: metadata.keywords || pattern.keywords,
      updatedAt: new Date().toISOString()
    });

    if (definition) {
      pattern.definition = JSON.parse(JSON.stringify(definition));
    }

    this.notifyListeners('patternUpdated', { patternId, pattern });
    return true;
  }

  downloadPattern(patternId, userId) {
    const pattern = this.patterns.get(patternId);
    if (!pattern) return false;

    pattern.downloadCount++;
    const key = `${patternId}:${userId}`;
    if (!this.downloads.has(key)) {
      this.downloads.set(key, {
        patternId,
        userId,
        downloadedAt: new Date().toISOString(),
        count: 0
      });
    }

    const record = this.downloads.get(key);
    record.count++;
    this.notifyListeners('patternDownloaded', { patternId, userId, pattern });
    return pattern;
  }

  ratePattern(patternId, userId, rating) {
    if (rating < 1 || rating > 5) return false;
    const pattern = this.patterns.get(patternId);
    if (!pattern) return false;

    const key = `${patternId}:${userId}`;
    const existingRating = this.ratings.get(key);

    if (!existingRating) {
      pattern.reviewCount++;
    }

    this.ratings.set(key, {
      patternId,
      userId,
      rating,
      ratedAt: new Date().toISOString()
    });

    this.updateAverageRating(patternId);
    this.notifyListeners('patternRated', { patternId, userId, rating });
    return true;
  }

  updateAverageRating(patternId) {
    const pattern = this.patterns.get(patternId);
    if (!pattern) return;

    const ratings = [];
    for (const [key, rating] of this.ratings.entries()) {
      if (key.startsWith(patternId + ':')) {
        ratings.push(rating.rating);
      }
    }

    pattern.rating = ratings.length === 0 ? 0 : ratings.reduce((a, b) => a + b, 0) / ratings.length;
  }

  reviewPattern(patternId, userId, review) {
    const pattern = this.patterns.get(patternId);
    if (!pattern) return false;

    const reviewRecord = {
      id: `review:${Date.now()}:${Math.random()}`,
      patternId,
      userId,
      title: review.title || '',
      content: review.content || '',
      rating: review.rating || 0,
      createdAt: new Date().toISOString(),
      helpful: 0,
      verified: false
    };

    this.reviews.push(reviewRecord);
    this.notifyListeners('reviewAdded', { patternId, reviewRecord });
    return reviewRecord.id;
  }

  favoritePattern(patternId, userId) {
    const key = `${patternId}:${userId}`;
    if (!this.favorites.has(key)) {
      this.favorites.set(key, {
        patternId,
        userId,
        favoritedAt: new Date().toISOString()
      });
      this.notifyListeners('patternFavorited', { patternId, userId });
      return true;
    }
    return false;
  }

  unfavoritePattern(patternId, userId) {
    const key = `${patternId}:${userId}`;
    if (this.favorites.has(key)) {
      this.favorites.delete(key);
      this.notifyListeners('patternUnfavorited', { patternId, userId });
      return true;
    }
    return false;
  }

  isFavorited(patternId, userId) {
    return this.favorites.has(`${patternId}:${userId}`);
  }

  getUserFavorites(userId) {
    const favorites = [];
    for (const [key, fav] of this.favorites.entries()) {
      if (fav.userId === userId) {
        favorites.push(this.patterns.get(fav.patternId));
      }
    }
    return favorites.filter(Boolean);
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
    this.notifyListeners('patternFeatured', { patternId });
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
    this.notifyListeners('patternUnfeatured', { patternId });
    return true;
  }

  indexPatternForSearch(patternId, pattern) {
    const searchTerms = [
      pattern.name,
      pattern.description,
      pattern.author,
      ...pattern.tags,
      ...pattern.keywords,
      pattern.category
    ].filter(Boolean);

    searchTerms.forEach(term => {
      const normalized = term.toLowerCase().trim();
      if (!this.searchIndex.has(normalized)) {
        this.searchIndex.set(normalized, []);
      }
      const patterns = this.searchIndex.get(normalized);
      if (!patterns.includes(patternId)) {
        patterns.push(patternId);
      }
    });
  }

  search(query, filters = {}) {
    const normalizedQuery = query.toLowerCase().trim();
    let results = new Set();

    if (normalizedQuery) {
      const words = normalizedQuery.split(/\s+/);
      words.forEach(word => {
        const matchingPatterns = this.searchIndex.get(word) || [];
        matchingPatterns.forEach(id => results.add(id));
        for (const [key, ids] of this.searchIndex.entries()) {
          if (key.includes(word)) {
            ids.forEach(id => results.add(id));
          }
        }
      });
    } else {
      results = new Set(this.patterns.keys());
    }

    let patterns = Array.from(results)
      .map(id => this.patterns.get(id))
      .filter(Boolean);

    if (filters.category) {
      patterns = patterns.filter(p => p.category === filters.category);
    }
    if (filters.minRating) {
      patterns = patterns.filter(p => p.rating >= filters.minRating);
    }
    if (filters.author) {
      patterns = patterns.filter(p => p.author === filters.author);
    }

    if (filters.sortBy === 'downloads') {
      patterns.sort((a, b) => b.downloadCount - a.downloadCount);
    } else if (filters.sortBy === 'rating') {
      patterns.sort((a, b) => b.rating - a.rating);
    } else if (filters.sortBy === 'recent') {
      patterns.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }

    return patterns;
  }

  getPatternsByCategory(category) {
    const patternIds = this.categories.get(category) || [];
    return patternIds
      .map(id => this.patterns.get(id))
      .filter(p => p && p.isPublished);
  }

  addToCategory(category, patternId) {
    if (!this.categories.has(category)) {
      this.categories.set(category, []);
    }
    const patterns = this.categories.get(category);
    if (!patterns.includes(patternId)) {
      patterns.push(patternId);
    }
  }

  getCategories() {
    return Array.from(this.categories.keys());
  }

  getFeaturedPatterns(limit = 10) {
    return this.featured
      .slice(0, limit)
      .map(id => this.patterns.get(id))
      .filter(Boolean);
  }

  getTrendingPatterns(limit = 10) {
    return Array.from(this.patterns.values())
      .filter(p => p.isPublished)
      .sort((a, b) => b.downloadCount - a.downloadCount)
      .slice(0, limit);
  }

  getTopRatedPatterns(limit = 10) {
    return Array.from(this.patterns.values())
      .filter(p => p.isPublished)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
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

  notifyListeners(event, data) {
    this.listeners
      .filter(l => l.event === event)
      .forEach(l => {
        try {
          l.callback(data);
        } catch (e) {
          console.error(`Marketplace listener error for ${event}:`, e);
        }
      });
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
