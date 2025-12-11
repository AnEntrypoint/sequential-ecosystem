// Version sequencing and comparison logic
export class MigrationVersionEngine {
  constructor(registry) {
    this.registry = registry;
  }

  getVersionSequence(fromVersion, toVersion) {
    const versions = Array.from(this.registry.migrations.keys())
      .sort((a, b) => this.compareVersions(a, b));

    const fromIndex = versions.indexOf(fromVersion);
    const toIndex = versions.indexOf(toVersion);

    if (fromIndex === -1 || toIndex === -1) {
      return [];
    }

    return versions.slice(fromIndex + 1, toIndex + 1);
  }

  compareVersions(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;

      if (p1 !== p2) return p1 - p2;
    }

    return 0;
  }

  getSortedVersions() {
    return Array.from(this.registry.migrations.keys())
      .sort((a, b) => this.compareVersions(a, b));
  }
}
