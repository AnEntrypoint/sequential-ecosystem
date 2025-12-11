// Pattern metadata management (ratings, downloads, reviews, favorites)
export class PatternMetadata {
  constructor(patterns, ratings, downloads, favorites, reviews, listeners) {
    this.patterns = patterns;
    this.ratings = ratings;
    this.downloads = downloads;
    this.favorites = favorites;
    this.reviews = reviews;
    this.listeners = listeners;
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
}
