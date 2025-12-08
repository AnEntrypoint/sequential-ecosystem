class PatternMarketplace {
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

    if (ratings.length === 0) {
      pattern.rating = 0;
    } else {
      pattern.rating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    }
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

  buildMarketplaceUI() {
    const featured = this.getFeaturedPatterns(6);
    const trending = this.getTrendingPatterns(6);
    const categories = this.getCategories();

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

  buildSearchUI() {
    const categories = this.getCategories();

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

function createPatternMarketplace() {
  return new PatternMarketplace();
}

export { PatternMarketplace, createPatternMarketplace };
