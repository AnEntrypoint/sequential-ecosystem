/**
 * Tool Dependency Parser
 * Parses and validates tool dependencies
 */

export function parseToolDependencies(implementation) {
  const imports = {
    npm: [],
    cdn: [],
    builtin: [],
    local: []
  };

  const npmPattern = /from\s+['"]([@\w/-]+)['"]/g;
  const cdnPattern = /https?:\/\/[^\s'"]+/g;
  const builtinPattern = /require\s*\(\s*['"](\w+)['"]\s*\)|import\s+['"](\w+)['"]/g;

  let match;

  while ((match = npmPattern.exec(implementation)) !== null) {
    const pkg = match[1];
    if (!imports.npm.includes(pkg)) {
      imports.npm.push(pkg);
    }
  }

  while ((match = cdnPattern.exec(implementation)) !== null) {
    const url = match[0];
    if (!imports.cdn.includes(url)) {
      imports.cdn.push(url);
    }
  }

  while ((match = builtinPattern.exec(implementation)) !== null) {
    const pkg = match[1] || match[2];
    if (!imports.builtin.includes(pkg)) {
      imports.builtin.push(pkg);
    }
  }

  return imports;
}

export function validateToolDependencies(tool) {
  const issues = [];

  if (!tool.imports) {
    return { valid: true, issues: [] };
  }

  const { npm = [], cdn = [] } = tool.imports;

  if (npm.length > 0 && !tool.dependencies) {
    issues.push({
      severity: 'WARNING',
      message: `Tool uses ${npm.length} npm package(s) but has no dependencies defined`,
      packages: npm,
      fix: 'Update tool.dependencies or package.json'
    });
  }

  if (cdn.length > 0 && tool.imports.length < 1) {
    issues.push({
      severity: 'INFO',
      message: `Tool uses ${cdn.length} CDN resource(s); ensure they're loaded in app context`,
      urls: cdn
    });
  }

  return {
    valid: issues.filter(i => i.severity === 'ERROR').length === 0,
    issues
  };
}
