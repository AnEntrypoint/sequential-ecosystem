export class ValidationHints {
  constructor(editorId = 'codeEditor') {
    this.editor = document.getElementById(editorId);
    this.hints = [];
    this.checkInterval = null;
  }

  init() {
    if (!this.editor) return;

    this.createHintsContainer();

    // Check code every 1 second
    this.checkInterval = setInterval(() => {
      this.analyzeCode();
    }, 1000);

    this.editor.addEventListener('input', () => {
      clearInterval(this.checkInterval);
      this.checkInterval = setInterval(() => {
        this.analyzeCode();
      }, 1000);
    });
  }

  createHintsContainer() {
    let container = document.getElementById('validation-hints-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'validation-hints-container';
      container.style.cssText = `
        position: absolute;
        top: 0;
        right: 0;
        width: 300px;
        max-height: 300px;
        overflow-y: auto;
        background: #2a2a2a;
        border-left: 1px solid #3a3a3a;
        padding: 0;
        z-index: 100;
        font-size: 12px;
      `;
      const editorContainer = this.editor.parentElement;
      if (editorContainer) {
        editorContainer.style.position = 'relative';
        editorContainer.appendChild(container);
      }
    }
    return container;
  }

  analyzeCode() {
    const code = this.editor.value;
    this.hints = [];

    // Check for missing await on async functions
    this.checkMissingAwait(code);

    // Check for missing error handling
    this.checkMissingErrorHandling(code);

    // Check for unused variables
    this.checkUnusedVariables(code);

    // Check for common mistakes
    this.checkCommonMistakes(code);

    // Check for missing returns
    this.checkMissingReturns(code);

    this.renderHints();
  }

  checkMissingAwait(code) {
    // Look for async operations without await (common mistake)
    const patterns = [
      {
        regex: /\b(fetch|__callHostTool__)\s*\([^)]*\)\s*(?!\.then|\.catch|await)/g,
        hint: 'Missing await on async operation',
        severity: 'warning'
      }
    ];

    patterns.forEach(({ regex, hint, severity }) => {
      let match;
      while ((match = regex.exec(code)) !== null) {
        const line = code.substring(0, match.index).split('\n').length;
        this.hints.push({
          line,
          message: hint,
          severity,
          suggestion: 'Add "await" before the function call or use .then/.catch'
        });
      }
    });
  }

  checkMissingErrorHandling(code) {
    // Look for fetch without .catch or try block
    const fetchRegex = /fetch\s*\([^)]*\)(?!\s*\.catch|\s*\.then|\s*await)/g;
    let match;
    while ((match = fetchRegex.exec(code)) !== null) {
      // Check if it's inside a try-catch
      const beforeMatch = code.substring(0, match.index);
      const tryCount = (beforeMatch.match(/\btry\b/g) || []).length;
      const catchCount = (beforeMatch.match(/\bcatch\b/g) || []).length;

      if (tryCount <= catchCount) {
        const line = beforeMatch.split('\n').length;
        this.hints.push({
          line,
          message: 'Missing error handling on fetch',
          severity: 'error',
          suggestion: 'Add .catch((err) => { }) or wrap in try-catch'
        });
      }
    }
  }

  checkUnusedVariables(code) {
    // Look for declared variables that aren't used
    const varRegex = /\b(const|let|var)\s+(\w+)\s*=/g;
    const usedVars = new Set();
    const declaredVars = [];

    let match;
    while ((match = varRegex.exec(code)) !== null) {
      declaredVars.push({
        name: match[2],
        line: code.substring(0, match.index).split('\n').length,
        index: match.index
      });
    }

    // Check if each variable is used after declaration
    declaredVars.forEach(({ name, line, index }) => {
      const afterDeclaration = code.substring(index);
      // Simple check: is the variable name used after declaration?
      if (!new RegExp(`\\b${name}\\b`).test(afterDeclaration.substring(name.length + 10))) {
        this.hints.push({
          line,
          message: `Unused variable "${name}"`,
          severity: 'info',
          suggestion: 'Remove this variable or use it in your code'
        });
      }
    });
  }

  checkCommonMistakes(code) {
    const mistakes = [
      {
        regex: /return\s+\{[^}]*\}\s*;?\s*\}\s*$/m,
        hint: 'Incomplete return statement',
        severity: 'error',
        suggestion: 'Ensure your return object is complete'
      },
      {
        regex: /\/\*(?![\s\S]*?\*\/)/,
        hint: 'Unclosed comment block',
        severity: 'error',
        suggestion: 'Close your /* comment with */'
      },
      {
        regex: /[{(]\s*[}\)]/g,
        hint: 'Empty block or empty parameters',
        severity: 'info',
        suggestion: 'Remove empty blocks or add required parameters'
      }
    ];

    mistakes.forEach(({ regex, hint, severity, suggestion }) => {
      const match = regex.exec(code);
      if (match) {
        const line = code.substring(0, match.index).split('\n').length;
        this.hints.push({
          line,
          message: hint,
          severity,
          suggestion
        });
      }
    });
  }

  checkMissingReturns(code) {
    // Check if export async function has a return statement
    const funcRegex = /export\s+async\s+function\s+\w+\s*\([^)]*\)\s*\{([\s\S]*)\}/;
    const match = funcRegex.exec(code);

    if (match && match[1]) {
      const body = match[1];
      if (!body.includes('return')) {
        this.hints.push({
          line: 1,
          message: 'Function has no return statement',
          severity: 'warning',
          suggestion: 'Add "return {...}" to return data from your task'
        });
      }
    }
  }

  renderHints() {
    const container = document.getElementById('validation-hints-container');
    if (!container) return;

    if (this.hints.length === 0) {
      container.style.display = 'none';
      return;
    }

    container.style.display = 'block';
    container.innerHTML = `
      <div style="padding: 12px; border-bottom: 1px solid #3a3a3a; background: #1a1a1a; font-weight: 600; color: #e0e0e0;">
        Hints & Warnings (${this.hints.length})
      </div>
      ${this.hints.map(hint => `
        <div style="
          padding: 12px;
          border-bottom: 1px solid #3a3a3a;
          border-left: 3px solid ${this.getSeverityColor(hint.severity)};
        ">
          <div style="color: ${this.getSeverityColor(hint.severity)}; font-weight: 600; margin-bottom: 4px;">
            Line ${hint.line}: ${hint.message}
          </div>
          <div style="color: #999; font-size: 11px;">
            ${hint.suggestion}
          </div>
        </div>
      `).join('')}
    `;
  }

  getSeverityColor(severity) {
    const colors = {
      error: '#ff5f56',
      warning: '#f59e0b',
      info: '#3b82f6'
    };
    return colors[severity] || '#999';
  }

  destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }
}

window.initValidationHints = function(editorId = 'codeEditor') {
  const hints = new ValidationHints(editorId);
  window.validationHints = hints;
  hints.init();
};
