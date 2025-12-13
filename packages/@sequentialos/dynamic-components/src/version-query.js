// Version querying and comparison
export class VersionQuery {
  constructor(versionManager) {
    this.versionManager = versionManager;
  }

  listVersions(patternName) {
    return (this.versionManager.versions.get(patternName) || []).map(v => ({
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

  compareVersions(patternName, versionId1, versionId2) {
    const v1 = this.versionManager.getVersionById(patternName, versionId1);
    const v2 = this.versionManager.getVersionById(patternName, versionId2);

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
    const versions = this.versionManager.versions.get(patternName) || [];
    return versions.find(v => v.tags.includes(tag)) || null;
  }

  getLatestStableVersion(patternName) {
    const versions = this.versionManager.versions.get(patternName) || [];
    return versions.find(v => v.isStable && !v.isDeprecated) || versions[0] || null;
  }
}
