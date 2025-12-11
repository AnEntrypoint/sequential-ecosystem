export function parseVersion(versionStr) {
  const match = versionStr.match(/^(\d+)\.(\d+)\.(\d+)(?:-([\w.-]+))?$/);
  if (!match) {
    throw new Error(`Invalid version format: ${versionStr}`);
  }

  return {
    major: parseInt(match[1]),
    minor: parseInt(match[2]),
    patch: parseInt(match[3]),
    prerelease: match[4] || null,
    toString: () => versionStr
  };
}

export function compareVersions(v1, v2) {
  const ver1 = typeof v1 === 'string' ? parseVersion(v1) : v1;
  const ver2 = typeof v2 === 'string' ? parseVersion(v2) : v2;

  if (ver1.major !== ver2.major) return ver1.major - ver2.major;
  if (ver1.minor !== ver2.minor) return ver1.minor - ver2.minor;
  if (ver1.patch !== ver2.patch) return ver1.patch - ver2.patch;

  return 0;
}
