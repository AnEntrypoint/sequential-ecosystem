// Code generation optimization and formatting
export class CodeGenOptimizer {
  optimize(code, options = {}) {
    let optimized = code;

    if (options.minify) {
      optimized = this.minify(optimized);
    }

    if (options.format) {
      optimized = this.format(optimized, options.format);
    }

    if (options.addComments) {
      optimized = this.addComments(optimized);
    }

    return optimized;
  }

  minify(code) {
    return code
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  format(code, format = 'prettier') {
    if (format === 'prettier') {
      return this.formatWithPrettier(code);
    }
    return code;
  }

  formatWithPrettier(code) {
    const lines = code.split('\n');
    return lines.map(line => line.replace(/^\s+/, '')).join('\n');
  }

  addComments(code) {
    return code.replace(/^(.*?)\s*{$/gm, '$1 { // Added by code generator');
  }

  validateCode(code, language) {
    const checks = {
      jsx: () => this.validateJSX(code),
      javascript: () => this.validateJS(code),
      typescript: () => this.validateTS(code),
      html: () => this.validateHTML(code)
    };

    const validator = checks[language];
    return validator ? validator() : { valid: true };
  }

  validateJSX(code) {
    const hasImportReact = /import.*React/.test(code);
    const hasExport = /export\s+(default\s+)?/.test(code);
    return { valid: hasImportReact && hasExport };
  }

  validateJS(code) {
    try {
      new Function(code);
      return { valid: true };
    } catch (e) {
      return { valid: false, error: e.message };
    }
  }

  validateTS(code) {
    return { valid: true };
  }

  validateHTML(code) {
    return { valid: /^</.test(code.trim()) };
  }

  estimate(code, language) {
    return {
      lines: code.split('\n').length,
      characters: code.length,
      complexity: this.calculateComplexity(code)
    };
  }

  calculateComplexity(code) {
    const functions = (code.match(/function|=>|=>/g) || []).length;
    const conditionals = (code.match(/if|switch|ternary/g) || []).length;
    return (functions + conditionals) / 10;
  }
}
