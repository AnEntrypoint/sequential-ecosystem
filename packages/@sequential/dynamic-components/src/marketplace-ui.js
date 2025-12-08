class MarketplaceUI {
  constructor(patternMarketplace) {
    this.marketplace = patternMarketplace;
    this.currentView = 'browse';
    this.searchQuery = '';
    this.selectedCategory = null;
    this.sortBy = 'recent';
    this.listeners = [];
  }

  setView(view) {
    this.currentView = view;
    this.notifyListeners('viewChanged', { view });
    return this;
  }

  search(query) {
    this.searchQuery = query;
    const results = this.marketplace.search(query, {
      category: this.selectedCategory,
      sortBy: this.sortBy
    });

    this.notifyListeners('searchResults', { query, results });

    return results;
  }

  setCategory(category) {
    this.selectedCategory = category;
    const results = this.marketplace.getPatternsByCategory(category);

    this.notifyListeners('categorySelected', { category, results });

    return results;
  }

  setSortBy(sortBy) {
    this.sortBy = sortBy;
    return this;
  }

  insertPattern(patternId, targetPath = null) {
    const pattern = this.marketplace.patterns.get(patternId);

    if (!pattern) return false;

    this.marketplace.downloadPattern(patternId, 'user');

    this.notifyListeners('patternInserted', {
      patternId,
      pattern,
      targetPath,
      definition: pattern.definition
    });

    return true;
  }

  toggleFavorite(patternId, userId) {
    const isFavorited = this.marketplace.isFavorited(patternId, userId);

    if (isFavorited) {
      this.marketplace.unfavoritePattern(patternId, userId);
    } else {
      this.marketplace.favoritePattern(patternId, userId);
    }

    this.notifyListeners('favoriteToggled', {
      patternId,
      isFavorited: !isFavorited
    });

    return !isFavorited;
  }

  buildMarketplacePanel() {
    const categories = this.marketplace.getCategories();
    const featured = this.marketplace.getFeaturedPatterns(6);
    const trending = this.marketplace.getTrendingPatterns(6);

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
        this.buildSearchBar(),
        this.buildCategoryTabs(categories),
        this.buildSortControls(),
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
          children: featured.map(p => this.buildPatternCardSmall(p))
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
          children: trending.map(p => this.buildPatternCardSmall(p))
        }
      ]
    };
  }

  buildSearchBar() {
    return {
      type: 'box',
      style: {
        display: 'flex',
        gap: '8px'
      },
      children: [
        {
          type: 'input',
          placeholder: 'Search patterns...',
          value: this.searchQuery,
          style: {
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '12px',
            flex: 1
          }
        },
        {
          type: 'button',
          content: '🔍',
          style: {
            padding: '8px 12px',
            backgroundColor: '#667eea',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }
        }
      ]
    };
  }

  buildCategoryTabs(categories) {
    return {
      type: 'box',
      style: {
        display: 'flex',
        gap: '4px',
        flexWrap: 'wrap'
      },
      children: [
        {
          type: 'button',
          content: 'All',
          style: {
            padding: '6px 12px',
            backgroundColor: !this.selectedCategory ? '#667eea' : '#e0e0e0',
            color: !this.selectedCategory ? '#fff' : '#333',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: !this.selectedCategory ? 600 : 400
          }
        },
        ...categories.slice(0, 5).map(cat => ({
          type: 'button',
          content: cat,
          style: {
            padding: '6px 12px',
            backgroundColor: this.selectedCategory === cat ? '#667eea' : '#e0e0e0',
            color: this.selectedCategory === cat ? '#fff' : '#333',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: this.selectedCategory === cat ? 600 : 400
          }
        }))
      ]
    };
  }

  buildSortControls() {
    const sortOptions = [
      { label: 'Recent', value: 'recent' },
      { label: 'Downloads', value: 'downloads' },
      { label: 'Rating', value: 'rating' }
    ];

    return {
      type: 'box',
      style: {
        display: 'flex',
        gap: '4px'
      },
      children: sortOptions.map(opt => ({
        type: 'button',
        content: opt.label,
        style: {
          padding: '4px 8px',
          backgroundColor: this.sortBy === opt.value ? '#667eea' : '#f0f0f0',
          color: this.sortBy === opt.value ? '#fff' : '#666',
          border: 'none',
          borderRadius: '3px',
          cursor: 'pointer',
          fontSize: '11px'
        }
      }))
    };
  }

  buildPatternCardSmall(pattern) {
    return {
      type: 'box',
      style: {
        padding: '8px',
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      },
      children: [
        {
          type: 'text',
          content: pattern.name,
          style: { fontSize: '11px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }
        },
        {
          type: 'text',
          content: `${pattern.rating.toFixed(1)} ★ • ${pattern.downloadCount} downloads`,
          style: { fontSize: '10px', color: '#999' }
        },
        {
          type: 'button',
          content: 'Insert',
          style: {
            padding: '4px 8px',
            backgroundColor: '#667eea',
            color: '#fff',
            border: 'none',
            borderRadius: '2px',
            cursor: 'pointer',
            fontSize: '10px',
            marginTop: '4px'
          }
        }
      ]
    };
  }

  buildDetailView(patternId) {
    const pattern = this.marketplace.patterns.get(patternId);

    if (!pattern) return null;

    const reviews = this.marketplace.reviews.filter(r => r.patternId === patternId);

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '20px',
        backgroundColor: '#fafafa',
        maxWidth: '600px'
      },
      children: [
        {
          type: 'heading',
          content: pattern.name,
          level: 2,
          style: { margin: 0, fontSize: '24px', fontWeight: 700 }
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            fontSize: '12px'
          },
          children: [
            { type: 'text', content: `By ${pattern.author}` },
            { type: 'text', content: `v${pattern.version}` },
            { type: 'text', content: `${pattern.rating.toFixed(1)} ★ (${pattern.reviewCount} reviews)` },
            { type: 'text', content: `${pattern.downloadCount} downloads`, style: { color: '#666' } }
          ]
        },
        {
          type: 'paragraph',
          content: pattern.description,
          style: { margin: 0, fontSize: '13px', lineHeight: 1.6 }
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          },
          children: pattern.tags.map(tag => ({
            type: 'box',
            style: {
              padding: '4px 8px',
              backgroundColor: '#e3f2fd',
              color: '#1976d2',
              borderRadius: '3px',
              fontSize: '11px'
            },
            children: [{ type: 'text', content: tag }]
          }))
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            gap: '8px'
          },
          children: [
            {
              type: 'button',
              content: '⬇ Insert Pattern',
              style: {
                padding: '10px 16px',
                backgroundColor: '#667eea',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 600
              }
            },
            {
              type: 'button',
              content: '❤ Favorite',
              style: {
                padding: '10px 16px',
                backgroundColor: '#f0f0f0',
                color: '#333',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }
            }
          ]
        },
        {
          type: 'heading',
          content: 'Reviews',
          level: 4,
          style: { margin: '12px 0 0 0', fontSize: '14px', fontWeight: 600 }
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          },
          children: reviews.slice(0, 3).map(review => ({
            type: 'box',
            style: {
              padding: '12px',
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '4px'
            },
            children: [
              {
                type: 'text',
                content: `${review.rating} ★ by ${review.userId}`,
                style: { fontWeight: 600, fontSize: '12px' }
              },
              {
                type: 'paragraph',
                content: review.title,
                style: { margin: '4px 0', fontSize: '11px', fontWeight: 500 }
              },
              {
                type: 'paragraph',
                content: review.content,
                style: { margin: 0, fontSize: '11px', color: '#666' }
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
          console.error(`Marketplace UI listener error for ${event}:`, e);
        }
      });
  }

  clear() {
    this.searchQuery = '';
    this.selectedCategory = null;
    this.listeners = [];
    return this;
  }
}

function createMarketplaceUI(patternMarketplace) {
  return new MarketplaceUI(patternMarketplace);
}

export { MarketplaceUI, createMarketplaceUI };
