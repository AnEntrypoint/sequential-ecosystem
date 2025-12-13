/**
 * Tool Dependency Generator
 * Generates tool code and package.json with dependencies
 */

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
