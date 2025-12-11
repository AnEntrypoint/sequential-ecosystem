// Version metadata management (tags, stability, deprecation)
export class VersionMetadata {
  constructor(versionManager) {
    this.versionManager = versionManager;
  }

  tagVersion(patternName, versionId, tag) {
    const version = this.versionManager.getVersionById(patternName, versionId);
    if (!version) return false;

    if (!version.tags.includes(tag)) {
      version.tags.push(tag);
    }

    return true;
  }

  markStable(patternName, versionId) {
    const version = this.versionManager.getVersionById(patternName, versionId);
    if (!version) return false;

    version.isStable = true;

    if (!version.tags.includes('stable')) {
      version.tags.push('stable');
    }

    return true;
  }

  markDeprecated(patternName, versionId, reason = '') {
    const version = this.versionManager.getVersionById(patternName, versionId);
    if (!version) return false;

    version.isDeprecated = true;
    version.deprecationReason = reason;

    if (!version.tags.includes('deprecated')) {
      version.tags.push('deprecated');
    }

    return true;
  }
}
