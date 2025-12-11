// Version export and import
export class VersionPersistence {
  constructor(versionManager) {
    this.versionManager = versionManager;
  }

  exportVersions(patternName) {
    const versions = this.versionManager.versions.get(patternName) || [];

    return {
      patternName,
      exportedAt: new Date().toISOString(),
      currentVersionId: this.versionManager.currentVersions.get(patternName)?.id,
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

    this.versionManager.versions.set(patternName, exportedData.versions);

    if (exportedData.currentVersionId) {
      const current = this.versionManager.getVersionById(patternName, exportedData.currentVersionId);
      if (current) {
        this.versionManager.currentVersions.set(patternName, current);
      }
    }

    return true;
  }
}
