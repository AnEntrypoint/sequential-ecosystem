import { parseVersion } from './semantic-versioning-parser.js';

export function validateVersionConfig(version) {
  const errors = [];

  try {
    parseVersion(version);
  } catch (error) {
    errors.push(error.message);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function getNextVersion(currentVersion, changeType = 'patch') {
  const ver = parseVersion(currentVersion);

  switch (changeType) {
    case 'major':
      return `${ver.major + 1}.0.0`;
    case 'minor':
      return `${ver.major}.${ver.minor + 1}.0`;
    case 'patch':
      return `${ver.major}.${ver.minor}.${ver.patch + 1}`;
    default:
      throw new Error(`Unknown change type: ${changeType}`);
  }
}
