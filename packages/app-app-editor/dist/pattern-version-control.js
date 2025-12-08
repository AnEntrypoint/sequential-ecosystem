class PatternVersionControl {
  constructor() {
    this.versions = new Map();
    this.history = [];
    this.storage = 'pattern-versions';
    this.loadVersions();
  }

  createVersion(patternId, definition, message = '') {
    if (!this.versions.has(patternId)) {
      this.versions.set(patternId, []);
    }

    const versions = this.versions.get(patternId);
    const versionNumber = versions.length + 1;

    const version = {
      id: `${patternId}-v${versionNumber}`,
      patternId,
      versionNumber,
      definition: JSON.parse(JSON.stringify(definition)),
      message,
      createdAt: Date.now(),
      isoTime: new Date().toISOString(),
      changes: versionNumber > 1 ? this.calculateChanges(patternId, definition) : 'Initial version'
    };

    versions.push(version);
    this.addHistoryEntry('version_created', patternId, versionNumber);
    this.saveVersions();

    return version;
  }

  getVersion(patternId, versionNumber) {
    const versions = this.versions.get(patternId);
    if (!versions || versionNumber < 1 || versionNumber > versions.length) {
      return null;
    }
    return versions[versionNumber - 1];
  }

  getLatestVersion(patternId) {
    const versions = this.versions.get(patternId);
    if (!versions || versions.length === 0) return null;
    return versions[versions.length - 1];
  }

  getAllVersions(patternId) {
    return this.versions.get(patternId) || [];
  }

  revertToVersion(patternId, versionNumber) {
    const version = this.getVersion(patternId, versionNumber);
    if (!version) return null;

    const reverted = {
      ...version,
      id: `${patternId}-v${this.getAllVersions(patternId).length + 1}`,
      versionNumber: this.getAllVersions(patternId).length + 1,
      message: `Reverted to v${versionNumber}`,
      createdAt: Date.now(),
      isoTime: new Date().toISOString()
    };

    this.versions.get(patternId).push(reverted);
    this.addHistoryEntry('version_reverted', patternId, versionNumber);
    this.saveVersions();

    return reverted;
  }

  compareVersions(patternId, v1, v2) {
    const version1 = this.getVersion(patternId, v1);
    const version2 = this.getVersion(patternId, v2);

    if (!version1 || !version2) return null;

    return {
      patternId,
      from: { version: v1, time: version1.isoTime },
      to: { version: v2, time: version2.isoTime },
      differences: this.deepDiff(version1.definition, version2.definition)
    };
  }

  calculateChanges(patternId, definition) {
    const previous = this.getLatestVersion(patternId);
    if (!previous) return 'Initial version';

    const diff = this.deepDiff(previous.definition, definition);
    const changes = [];

    for (const [key, change] of Object.entries(diff)) {
      if (change.type === 'added') {
        changes.push(`Added ${key}`);
      } else if (change.type === 'removed') {
        changes.push(`Removed ${key}`);
      } else if (change.type === 'modified') {
        changes.push(`Modified ${key}: ${change.from} → ${change.to}`);
      }
    }

    return changes.length > 0 ? changes.join('; ') : 'No changes';
  }

  deepDiff(obj1, obj2) {
    const diff = {};
    const keys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);

    keys.forEach(key => {
      const v1 = obj1?.[key];
      const v2 = obj2?.[key];

      if (JSON.stringify(v1) !== JSON.stringify(v2)) {
        if (!(key in (obj1 || {}))) {
          diff[key] = { type: 'added', value: v2 };
        } else if (!(key in (obj2 || {}))) {
          diff[key] = { type: 'removed', value: v1 };
        } else if (typeof v1 === 'object' && typeof v2 === 'object') {
          diff[key] = { type: 'modified', from: v1, to: v2, nested: this.deepDiff(v1, v2) };
        } else {
          diff[key] = { type: 'modified', from: v1, to: v2 };
        }
      }
    });

    return diff;
  }

  addHistoryEntry(action, patternId, versionNumber) {
    this.history.push({
      action,
      patternId,
      versionNumber,
      timestamp: Date.now(),
      isoTime: new Date().toISOString()
    });
  }

  getHistory(patternId, limit = 10) {
    return this.history
      .filter(h => h.patternId === patternId)
      .slice(-limit)
      .reverse();
  }

  saveVersions() {
    try {
      const data = {
        versions: Array.from(this.versions.entries()),
        history: this.history
      };
      localStorage.setItem(this.storage, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save versions:', e);
    }
  }

  loadVersions() {
    try {
      const data = localStorage.getItem(this.storage);
      if (data) {
        const parsed = JSON.parse(data);
        this.versions = new Map(parsed.versions);
        this.history = parsed.history || [];
      }
    } catch (e) {
      console.error('Failed to load versions:', e);
    }
  }

  buildVersionTimeline(patternId) {
    const versions = this.getAllVersions(patternId);

    return {
      type: 'box',
      style: {
        padding: '12px',
        background: '#1e1e1e',
        borderRadius: '6px',
        border: '1px solid #3e3e42'
      },
      children: [
        {
          type: 'heading',
          content: '📜 Version History',
          level: 3,
          style: {
            margin: '0 0 12px 0',
            fontSize: '12px',
            color: '#e0e0e0'
          }
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          },
          children: versions.length > 0
            ? versions.reverse().map((v, idx) => ({
              type: 'box',
              style: {
                padding: '8px 12px',
                background: '#2d2d30',
                borderLeft: '3px solid #667eea',
                borderRadius: '4px',
                cursor: 'pointer'
              },
              children: [
                {
                  type: 'flex',
                  style: {
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    marginBottom: '4px'
                  },
                  children: [
                    {
                      type: 'paragraph',
                      content: `v${v.versionNumber}`,
                      style: {
                        margin: 0,
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#667eea'
                      }
                    },
                    {
                      type: 'paragraph',
                      content: new Date(v.createdAt).toLocaleString(),
                      style: {
                        margin: 0,
                        fontSize: '10px',
                        color: '#858585'
                      }
                    }
                  ]
                },
                {
                  type: 'paragraph',
                  content: v.message || v.changes,
                  style: {
                    margin: 0,
                    fontSize: '11px',
                    color: '#d4d4d4'
                  }
                }
              ]
            }))
            : [
              {
                type: 'paragraph',
                content: 'No versions yet',
                style: {
                  margin: 0,
                  fontSize: '11px',
                  color: '#858585',
                  textAlign: 'center',
                  padding: '12px'
                }
              }
            ]
        }
      ]
    };
  }

  exportVersionHistory(patternId) {
    const versions = this.getAllVersions(patternId);
    const history = this.getHistory(patternId, 100);

    return {
      patternId,
      totalVersions: versions.length,
      versions: versions.map(v => ({
        version: v.versionNumber,
        message: v.message,
        changes: v.changes,
        createdAt: v.isoTime,
        definition: v.definition
      })),
      history,
      exportedAt: new Date().toISOString()
    };
  }

  getVersionStats(patternId) {
    const versions = this.getAllVersions(patternId);
    return {
      patternId,
      totalVersions: versions.length,
      firstVersion: versions[0]?.isoTime,
      latestVersion: versions[versions.length - 1]?.isoTime,
      averageTimePerVersion: versions.length > 1
        ? (versions[versions.length - 1].createdAt - versions[0].createdAt) / (versions.length - 1)
        : 0
    };
  }
}

function createPatternVersionControl() {
  return new PatternVersionControl();
}
