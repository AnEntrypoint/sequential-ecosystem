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

export function generateToolWithDependencies(toolName, implementation, dependencies = {}) {
  const { npm = [], cdn = [] } = dependencies;

  const header = `/**
 * ${toolName} - Tool with Dependency Management
 *
 * Dependencies:
 * - NPM: ${npm.length > 0 ? npm.join(', ') : 'None'}
 * - CDN: ${cdn.length > 0 ? cdn.join(', ') : 'None'}
 *
 * Installation:
 * npm install ${npm.join(' ')}
 */`;

  const cdnScripts = cdn.length > 0 ? `// CDN Dependencies:
${cdn.map(url => `// <script src="${url}"><\/script>`).join('\n')}\n` : '';

  const npmImports = npm.length > 0 ? `// NPM Imports:
${npm.map(pkg => `import ${pkg.split('/')[1] || pkg} from '${pkg}';`).join('\n')}\n` : '';

  return `${header}

${npmImports}${cdnScripts}
export async function ${toolName.replace(/-/g, '_')}(input) {
  // TODO: Implement tool logic using dependencies above
  return { success: true, data: input };
}`;
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

export function generateToolPackageJson(toolName, dependencies = {}) {
  const { npm = [], devDeps = [] } = dependencies;

  return {
    name: `tool-${toolName}`,
    version: '1.0.0',
    description: `Tool: ${toolName}`,
    type: 'module',
    dependencies: npm.length > 0 ? Object.fromEntries(
      npm.map(pkg => [pkg, '^1.0.0'])
    ) : {},
    devDependencies: devDeps.length > 0 ? Object.fromEntries(
      devDeps.map(pkg => [pkg, '^1.0.0'])
    ) : {
      eslint: '^8.0.0'
    },
    scripts: {
      test: 'node --test',
      lint: 'eslint . || true'
    },
    sequential: {
      type: 'tool',
      toolName
    }
  };
}
