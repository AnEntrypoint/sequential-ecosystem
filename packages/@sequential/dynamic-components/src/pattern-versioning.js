class PatternVersioning {
  constructor() {
    this.versions = new Map();
    this.currentVersions = new Map();
    this.history = new Map();
    this.listeners = [];
    this.maxVersionsPerPattern = 50;
  }

  createPatternVersion(patternName, definition, metadata = {}) {
    const versionId = `${patternName}@${Date.now()}`;

    const version = {
      id: versionId,
      patternName,
      definition: JSON.parse(JSON.stringify(definition)),
      metadata: {
        ...metadata,
        createdAt: new Date().toISOString(),
        createdBy: metadata.createdBy || 'system',
        message: metadata.message || ''
      },
      tags: [],
      isStable: false,
      isDeprecated: false
    };

    if (!this.versions.has(patternName)) {
      this.versions.set(patternName, []);
    }

    const patternVersions = this.versions.get(patternName);
    patternVersions.unshift(version);

    if (patternVersions.length > this.maxVersionsPerPattern) {
      patternVersions.pop();
    }

    this.currentVersions.set(patternName, version);

    this.recordHistory(patternName, 'create', {
      versionId,
      metadata
    });

    this.notifyListeners('versionCreated', { patternName, version });

    return versionId;
  }

  getCurrentVersion(patternName) {
    return this.currentVersions.get(patternName) || null;
  }

  getVersionById(patternName, versionId) {
    const versions = this.versions.get(patternName) || [];
    return versions.find(v => v.id === versionId) || null;
  }

  listVersions(patternName) {
    return (this.versions.get(patternName) || []).map(v => ({
      id: v.id,
      patternName: v.patternName,
      createdAt: v.metadata.createdAt,
      createdBy: v.metadata.createdBy,
      message: v.metadata.message,
      tags: v.tags,
      isStable: v.isStable,
      isDeprecated: v.isDeprecated
    }));
  }

  rollback(patternName, versionId) {
    const version = this.getVersionById(patternName, versionId);
    if (!version) return false;

    this.currentVersions.set(patternName, JSON.parse(JSON.stringify(version)));

    this.recordHistory(patternName, 'rollback', {
      versionId,
      rolledBackAt: new Date().toISOString()
    });

    this.notifyListeners('rollbackPerformed', { patternName, versionId, version });

    return true;
  }

  tagVersion(patternName, versionId, tag) {
    const version = this.getVersionById(patternName, versionId);
    if (!version) return false;

    if (!version.tags.includes(tag)) {
      version.tags.push(tag);

      this.recordHistory(patternName, 'tag', {
        versionId,
        tag
      });

      this.notifyListeners('versionTagged', { patternName, versionId, tag });
    }

    return true;
  }

  markStable(patternName, versionId) {
    const version = this.getVersionById(patternName, versionId);
    if (!version) return false;

    version.isStable = true;

    if (!version.tags.includes('stable')) {
      version.tags.push('stable');
    }

    this.recordHistory(patternName, 'markStable', {
      versionId
    });

    this.notifyListeners('versionMarkedStable', { patternName, versionId });

    return true;
  }

  markDeprecated(patternName, versionId, reason = '') {
    const version = this.getVersionById(patternName, versionId);
    if (!version) return false;

    version.isDeprecated = true;
    version.deprecationReason = reason;

    if (!version.tags.includes('deprecated')) {
      version.tags.push('deprecated');
    }

    this.recordHistory(patternName, 'markDeprecated', {
      versionId,
      reason
    });

    this.notifyListeners('versionMarkedDeprecated', { patternName, versionId });

    return true;
  }

  deleteVersion(patternName, versionId) {
    const versions = this.versions.get(patternName) || [];
    const idx = versions.findIndex(v => v.id === versionId);

    if (idx < 0) return false;

    const deleted = versions.splice(idx, 1)[0];

    if (this.currentVersions.get(patternName)?.id === versionId) {
      this.currentVersions.set(patternName, versions[0] || null);
    }

    this.recordHistory(patternName, 'delete', {
      versionId
    });

    this.notifyListeners('versionDeleted', { patternName, versionId });

    return true;
  }

  compareVersions(patternName, versionId1, versionId2) {
    const v1 = this.getVersionById(patternName, versionId1);
    const v2 = this.getVersionById(patternName, versionId2);

    if (!v1 || !v2) return null;

    return {
      version1: {
        id: v1.id,
        createdAt: v1.metadata.createdAt,
        definition: v1.definition
      },
      version2: {
        id: v2.id,
        createdAt: v2.metadata.createdAt,
        definition: v2.definition
      },
      differences: this.computeDifferences(v1.definition, v2.definition)
    };
  }

  computeDifferences(def1, def2) {
    const diff = {
      type: def1.type === def2.type ? 'same' : 'changed',
      style: this.diffObjects(def1.style || {}, def2.style || {}),
      content: def1.content === def2.content ? 'same' : 'changed',
      attributes: this.diffObjects(def1.attributes || {}, def2.attributes || {}),
      children: def1.children?.length === def2.children?.length ? 'same' : 'changed'
    };

    return diff;
  }

  diffObjects(obj1, obj2) {
    const added = {};
    const removed = {};
    const changed = {};

    Object.keys(obj2).forEach(key => {
      if (!(key in obj1)) {
        added[key] = obj2[key];
      } else if (obj1[key] !== obj2[key]) {
        changed[key] = { from: obj1[key], to: obj2[key] };
      }
    });

    Object.keys(obj1).forEach(key => {
      if (!(key in obj2)) {
        removed[key] = obj1[key];
      }
    });

    return {
      added: Object.keys(added).length > 0 ? added : null,
      removed: Object.keys(removed).length > 0 ? removed : null,
      changed: Object.keys(changed).length > 0 ? changed : null
    };
  }

  getVersionByTag(patternName, tag) {
    const versions = this.versions.get(patternName) || [];
    return versions.find(v => v.tags.includes(tag)) || null;
  }

  getLatestStableVersion(patternName) {
    const versions = this.versions.get(patternName) || [];
    return versions.find(v => v.isStable && !v.isDeprecated) || versions[0] || null;
  }

  recordHistory(patternName, action, data) {
    if (!this.history.has(patternName)) {
      this.history.set(patternName, []);
    }

    const record = {
      timestamp: Date.now(),
      action,
      data,
      iso: new Date().toISOString()
    };

    this.history.get(patternName).unshift(record);

    if (this.history.get(patternName).length > 200) {
      this.history.get(patternName).pop();
    }
  }

  getHistory(patternName, limit = 50) {
    const records = this.history.get(patternName) || [];
    return records.slice(0, limit);
  }

  exportVersions(patternName) {
    const versions = this.versions.get(patternName) || [];

    return {
      patternName,
      exportedAt: new Date().toISOString(),
      currentVersionId: this.currentVersions.get(patternName)?.id,
      versions: versions.map(v => ({
        id: v.id,
        definition: v.definition,
        metadata: v.metadata,
        tags: v.tags,
        isStable: v.isStable,
        isDeprecated: v.isDeprecated
      }))
    };
  }

  importVersions(patternName, exportedData) {
    if (!exportedData.versions || !Array.isArray(exportedData.versions)) {
      return false;
    }

    this.versions.set(patternName, exportedData.versions);

    if (exportedData.currentVersionId) {
      const current = this.getVersionById(patternName, exportedData.currentVersionId);
      if (current) {
        this.currentVersions.set(patternName, current);
      }
    }

    this.recordHistory(patternName, 'import', {
      versionCount: exportedData.versions.length
    });

    this.notifyListeners('versionsImported', { patternName });

    return true;
  }

  buildVersionTimeline(patternName) {
    const versions = this.listVersions(patternName);

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px',
        backgroundColor: '#f9f9f9',
        borderRadius: '6px'
      },
      children: [
        {
          type: 'heading',
          content: `Version History: ${patternName}`,
          level: 4,
          style: { margin: 0, fontSize: '14px', fontWeight: 600 }
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          },
          children: versions.map((v, idx) => ({
            type: 'box',
            style: {
              padding: '12px',
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '12px'
            },
            children: [
              {
                type: 'heading',
                content: `v${idx + 1} • ${new Date(v.createdAt).toLocaleDateString()}`,
                level: 5,
                style: { margin: '0 0 4px 0', fontSize: '12px', fontWeight: 600 },
                children: [
                  v.isStable && {
                    type: 'text',
                    content: ' [STABLE]',
                    style: { color: '#28a745', fontWeight: 600 }
                  },
                  v.isDeprecated && {
                    type: 'text',
                    content: ' [DEPRECATED]',
                    style: { color: '#dc3545', fontWeight: 600 }
                  }
                ].filter(Boolean)
              },
              {
                type: 'text',
                content: v.message || 'No message',
                style: { margin: 0, color: '#666' }
              }
            ].filter(Boolean)
          }))
        }
      ]
    };
  }

  buildVersionSelector(patternName) {
    const versions = this.listVersions(patternName);

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      },
      children: [
        {
          type: 'heading',
          content: 'Select Version',
          level: 5,
          style: { margin: 0, fontSize: '12px', fontWeight: 600 }
        },
        {
          type: 'select',
          value: this.currentVersions.get(patternName)?.id || '',
          style: {
            padding: '6px 8px',
            fontSize: '12px',
            borderRadius: '4px',
            border: '1px solid #ddd'
          },
          children: versions.map(v => ({
            type: 'option',
            value: v.id,
            content: `v${versions.indexOf(v) + 1} - ${new Date(v.createdAt).toLocaleDateString()} ${v.isStable ? '[S]' : ''}`
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
          console.error(`Versioning listener error for ${event}:`, e);
        }
      });
  }

  clear() {
    this.versions.clear();
    this.currentVersions.clear();
    this.history.clear();
    this.listeners = [];
    return this;
  }
}

function createPatternVersioning() {
  return new PatternVersioning();
}

export { PatternVersioning, createPatternVersioning };
