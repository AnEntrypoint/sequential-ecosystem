/**
 * dependency-parser.js
 *
 * Parse and extract dependencies from code
 */

export function createDependencyParser() {
  return {
    parseDependencies(code) {
      const imports = new Set();
      const importRegex = /import\s+(?:(?:{[^}]*})|(?:\*\s+as\s+\w+)|(?:\w+(?:\s*,\s*{[^}]*})?)|(?:(?:\w+\s+from\s+)?))?\s*['"]([^'"]+)['"]/g;

      let match;
      while ((match = importRegex.exec(code)) !== null) {
        const moduleName = match[1];
        if (!moduleName.startsWith('.')) {
          imports.add(moduleName);
        }
      }

      return Array.from(imports);
    },

    validateDependencies(toolDef) {
      const required = toolDef.metadata?.imports || [];
      const code = toolDef.code || '';
      const found = this.parseDependencies(code);

      const missing = required.filter(dep => !found.includes(dep));
      const unused = found.filter(dep => !required.includes(dep));

      return {
        valid: missing.length === 0,
        missing,
        unused,
        found,
        required
      };
    }
  };
}
