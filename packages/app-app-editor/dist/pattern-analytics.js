class PatternAnalytics {
  constructor() {
    this.events = [];
    this.patterns = new Map();
    this.storage = 'pattern-analytics';
    this.loadEvents();
  }

  trackPatternUsage(patternId, action, metadata = {}) {
    const event = {
      patternId,
      action,
      timestamp: Date.now(),
      isoTime: new Date().toISOString(),
      metadata,
      sessionId: this.getSessionId()
    };

    this.events.push(event);
    this.updatePatternStats(patternId);
    this.saveEvents();

    return event;
  }

  trackCompositionCreation(compositionId, patterns, config) {
    return this.trackPatternUsage('composition', 'create', {
      compositionId,
      patternCount: patterns.length,
      layout: config.layout
    });
  }

  trackVariantCreation(variantId, basePatternId, variantType) {
    return this.trackPatternUsage('variant', 'create', {
      variantId,
      basePatternId,
      variantType
    });
  }

  trackPatternInsertion(patternId, source) {
    return this.trackPatternUsage(patternId, 'insert', { source });
  }

  getPatternStats(patternId) {
    if (!this.patterns.has(patternId)) {
      return {
        patternId,
        usageCount: 0,
        insertions: 0,
        customizations: 0,
        compositions: 0,
        lastUsed: null,
        firstUsed: null,
        totalEvents: 0
      };
    }
    return this.patterns.get(patternId);
  }

  getTopPatterns(limit = 10) {
    return Array.from(this.patterns.values())
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  getPatternsByCategory(category, limit = 10) {
    return Array.from(this.patterns.values())
      .filter(p => p.category === category)
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  getUsageTrend(patternId, days = 7) {
    const now = Date.now();
    const timeframe = days * 24 * 60 * 60 * 1000;
    const cutoff = now - timeframe;

    const dailyUsage = {};

    this.events
      .filter(e => e.patternId === patternId && e.timestamp >= cutoff)
      .forEach(e => {
        const date = new Date(e.timestamp).toLocaleDateString();
        dailyUsage[date] = (dailyUsage[date] || 0) + 1;
      });

    return dailyUsage;
  }

  getSessionStats() {
    const sessionId = this.getSessionId();
    const sessionEvents = this.events.filter(e => e.sessionId === sessionId);

    return {
      sessionId,
      eventCount: sessionEvents.length,
      uniquePatterns: new Set(sessionEvents.map(e => e.patternId)).size,
      duration: sessionEvents.length > 0
        ? sessionEvents[sessionEvents.length - 1].timestamp - sessionEvents[0].timestamp
        : 0,
      actions: this.groupBy(sessionEvents, 'action')
    };
  }

  getReport(timeframeHours = 24) {
    const now = Date.now();
    const cutoff = now - (timeframeHours * 60 * 60 * 1000);

    const recentEvents = this.events.filter(e => e.timestamp >= cutoff);

    return {
      timeframeHours,
      totalEvents: recentEvents.length,
      uniquePatterns: new Set(recentEvents.map(e => e.patternId)).size,
      topPatterns: this.getTopPatterns(5),
      actionBreakdown: this.groupBy(recentEvents, 'action'),
      averageEventsPerPattern: recentEvents.length > 0
        ? (recentEvents.length / new Set(recentEvents.map(e => e.patternId)).size).toFixed(2)
        : 0,
      mostActiveTime: this.getMostActiveTime(recentEvents)
    };
  }

  getMostActiveTime(events) {
    const hourCounts = {};
    events.forEach(e => {
      const hour = new Date(e.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    return Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
  }

  groupBy(array, key) {
    return array.reduce((acc, item) => {
      const group = item[key];
      acc[group] = (acc[group] || 0) + 1;
      return acc;
    }, {});
  }

  getSessionId() {
    let sessionId = sessionStorage.getItem('pattern-analytics-session');
    if (!sessionId) {
      sessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('pattern-analytics-session', sessionId);
    }
    return sessionId;
  }

  updatePatternStats(patternId) {
    let stats = this.patterns.get(patternId);

    if (!stats) {
      stats = {
        patternId,
        usageCount: 0,
        insertions: 0,
        customizations: 0,
        compositions: 0,
        lastUsed: null,
        firstUsed: Date.now(),
        totalEvents: 0,
        category: 'unknown'
      };
      this.patterns.set(patternId, stats);
    }

    stats.usageCount++;
    stats.lastUsed = Date.now();
    stats.totalEvents++;
  }

  saveEvents() {
    try {
      localStorage.setItem(this.storage, JSON.stringify(this.events));
    } catch (e) {
      console.error('Failed to save analytics events:', e);
    }
  }

  loadEvents() {
    try {
      const stored = localStorage.getItem(this.storage);
      if (stored) {
        this.events = JSON.parse(stored);
        this.rebuildPatternStats();
      }
    } catch (e) {
      console.error('Failed to load analytics events:', e);
    }
  }

  rebuildPatternStats() {
    this.patterns.clear();
    this.events.forEach(e => this.updatePatternStats(e.patternId));
  }

  exportAnalytics() {
    return {
      events: this.events,
      patterns: Array.from(this.patterns.values()),
      report: this.getReport(24),
      exportedAt: new Date().toISOString()
    };
  }

  clearAnalytics() {
    this.events = [];
    this.patterns.clear();
    localStorage.removeItem(this.storage);
  }

  buildDashboardUI() {
    const report = this.getReport(24);
    const topPatterns = this.getTopPatterns(5);

    return {
      type: 'box',
      style: {
        padding: '16px',
        background: '#1e1e1e',
        borderRadius: '6px',
        border: '1px solid #3e3e42'
      },
      children: [
        {
          type: 'heading',
          content: '📊 Pattern Analytics',
          level: 2,
          style: {
            margin: '0 0 16px 0',
            color: '#e0e0e0',
            fontSize: '16px'
          }
        },
        {
          type: 'flex',
          style: {
            gap: '16px',
            marginBottom: '16px',
            flexWrap: 'wrap'
          },
          children: [
            this.buildStatCard('Total Events', report.totalEvents, '#0e639c'),
            this.buildStatCard('Unique Patterns', report.uniquePatterns, '#28a745'),
            this.buildStatCard('Avg Events/Pattern', report.averageEventsPerPattern, '#f59e0b'),
            this.buildStatCard('Timeframe', report.timeframeHours + 'h', '#667eea')
          ]
        },
        {
          type: 'heading',
          content: '🏆 Top Patterns',
          level: 3,
          style: {
            margin: '0 0 12px 0',
            color: '#e0e0e0',
            fontSize: '13px'
          }
        },
        {
          type: 'box',
          children: topPatterns.length > 0
            ? topPatterns.map((p, idx) => ({
              type: 'flex',
              style: {
                padding: '8px 12px',
                background: '#2d2d30',
                borderRadius: '4px',
                marginBottom: '6px',
                justifyContent: 'space-between',
                alignItems: 'center'
              },
              children: [
                {
                  type: 'paragraph',
                  content: `${idx + 1}. ${p.patternId}`,
                  style: {
                    margin: 0,
                    fontSize: '12px',
                    color: '#d4d4d4',
                    fontWeight: 600
                  }
                },
                {
                  type: 'paragraph',
                  content: `${p.usageCount} uses`,
                  style: {
                    margin: 0,
                    fontSize: '11px',
                    color: '#28a745'
                  }
                }
              ]
            }))
            : [
              {
                type: 'paragraph',
                content: 'No pattern usage data yet',
                style: {
                  margin: 0,
                  fontSize: '12px',
                  color: '#858585'
                }
              }
            ]
        }
      ]
    };
  }

  buildStatCard(label, value, color) {
    return {
      type: 'box',
      style: {
        flex: '1 1 calc(25% - 12px)',
        minWidth: '140px',
        background: '#2d2d30',
        borderLeft: `4px solid ${color}`,
        borderRadius: '4px',
        padding: '12px',
        border: '1px solid #3e3e42'
      },
      children: [
        {
          type: 'paragraph',
          content: label,
          style: {
            margin: 0,
            fontSize: '10px',
            color: '#858585',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: '4px'
          }
        },
        {
          type: 'paragraph',
          content: value.toString(),
          style: {
            margin: 0,
            fontSize: '18px',
            color: color,
            fontWeight: 600
          }
        }
      ]
    };
  }
}

function createPatternAnalytics() {
  return new PatternAnalytics();
}
