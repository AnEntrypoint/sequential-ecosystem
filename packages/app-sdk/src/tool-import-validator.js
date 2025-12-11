/**
 * tool-import-validator.js - Tool import validation
 *
 * Validate imports against code and detect missing/unused dependencies
 */

export class ToolImportValidator {
  constructor(appSDK) {
    this.appSDK = appSDK;
  }

  validateToolCode(code, imports) {
    const validation = this.validateImports(code, imports);
    return validation;
  }

  validateImports(code, declaredImports) {
    const importRegex = /import\s+(?:(?:{[^}]*})|(?:\*\s+as\s+\w+)|(?:\w+(?:\s*,\s*{[^}]*})?)|(?:(?:\w+\s+from\s+)?))?\s*['"]([^'"]+)['"]/g;
    const usedImports = new Set();

    let match;
    while ((match = importRegex.exec(code)) !== null) {
      const moduleName = match[1];
      if (!moduleName.startsWith('.')) {
        usedImports.add(moduleName);
      }
    }

    const declared = new Set(declaredImports);
    const missing = Array.from(usedImports).filter(imp => !declared.has(imp));
    const unused = declaredImports.filter(imp => !usedImports.has(imp));

    return {
      valid: missing.length === 0,
      missing,
      unused,
      used: Array.from(usedImports)
    };
  }
}
