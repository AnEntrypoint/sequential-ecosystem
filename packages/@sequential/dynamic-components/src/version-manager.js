// Version creation and storage management
export class VersionManager {
  constructor() {
    this.versions = new Map();
    this.currentVersions = new Map();
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
    return versionId;
  }

  getCurrentVersion(patternName) {
    return this.currentVersions.get(patternName) || null;
  }

  getVersionById(patternName, versionId) {
    const versions = this.versions.get(patternName) || [];
    return versions.find(v => v.id === versionId) || null;
  }

  rollback(patternName, versionId) {
    const version = this.getVersionById(patternName, versionId);
    if (!version) return false;

    this.currentVersions.set(patternName, JSON.parse(JSON.stringify(version)));
    return true;
  }

  deleteVersion(patternName, versionId) {
    const versions = this.versions.get(patternName) || [];
    const idx = versions.findIndex(v => v.id === versionId);

    if (idx < 0) return false;

    versions.splice(idx, 1);

    if (this.currentVersions.get(patternName)?.id === versionId) {
      this.currentVersions.set(patternName, versions[0] || null);
    }

    return true;
  }
}
