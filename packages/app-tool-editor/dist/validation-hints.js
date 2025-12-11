
// Consolidated from @sequentialos/editor-validation-hints

function checkMissingAwait(code, hints) {
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
      hints.push({
        line,
        message: hint,
        severity,
        suggestion: 'Add "await" before the function call or use .then/.catch'
      });
    }
  });
}

function checkMissingErrorHandling(code, hints) {
  const fetchRegex = /fetch\s*\([^)]*\)(?!\s*\.catch|\s*\.then|\s*await)/g;
  let match;
  while ((match = fetchRegex.exec(code)) !== null) {
    const beforeMatch = code.substring(0, match.index);
    const tryCount = (beforeMatch.match(/\btry\b/g) || []).length;
    const catchCount = (beforeMatch.match(/\bcatch\b/g) || []).length;

    if (tryCount <= catchCount) {
      const line = beforeMatch.split('\n').length;
      hints.push({
        line,
        message: 'Missing error handling on fetch',
        severity: 'error',
        suggestion: 'Add .catch((err) => { }) or wrap in try-catch'
      });
    }
  }
}

function checkUnusedVariables(code, hints) {
  const varRegex = /\b(const|let|var)\s+(\w+)\s*=/g;
  const declaredVars = [];

  let match;
  while ((match = varRegex.exec(code)) !== null) {
    declaredVars.push({
      name: match[2],
      line: code.substring(0, match.index).split('\n').length,
      index: match.index
    });
  }

  declaredVars.forEach(({ name, line, index }) => {
    const afterDeclaration = code.substring(index);
    if (!new RegExp(`\\b${name}\\b`).test(afterDeclaration.substring(name.length + 10))) {
      hints.push({
        line,
        message: `Unused variable "${name}"`,
        severity: 'info',
        suggestion: 'Remove this variable or use it in your code'
      });
    }
  });
}

function checkCommonMistakes(code, hints) {
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
      hints.push({
        line,
        message: hint,
        severity,
        suggestion
      });
    }
  });
}

function checkMissingReturns(code, hints) {
  const funcRegex = /export\s+async\s+function\s+\w+\s*\([^)]*\)\s*\{([\s\S]*)\}/;
  const match = funcRegex.exec(code);

  if (match && match[1]) {
    const body = match[1];
    if (!body.includes('return')) {
      hints.push({
        line: 1,
        message: 'Function has no return statement',
        severity: 'warning',
        suggestion: 'Add "return {...}" to return data from your task'
      });
    }
  }
}


function createHintsContainer(editor) {
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
    const editorContainer = editor.parentElement;
    if (editorContainer) {
      editorContainer.style.position = 'relative';
      editorContainer.appendChild(container);
    }
  }
  return container;
}

function renderHints(hints) {
  const container = document.getElementById('validation-hints-container');
  if (!container) return;

  if (hints.length === 0) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';
  container.innerHTML = `
    <div style="padding: 12px; border-bottom: 1px solid #3a3a3a; background: #1a1a1a; font-weight: 600; color: #e0e0e0;">
      Hints & Warnings (${hints.length})
    </div>
    ${hints.map(hint => `
      <div style="
        padding: 12px;
        border-bottom: 1px solid #3a3a3a;
        border-left: 3px solid ${getSeverityColor(hint.severity)};
      ">
        <div style="color: ${getSeverityColor(hint.severity)}; font-weight: 600; margin-bottom: 4px;">
          Line ${hint.line}: ${hint.message}
        </div>
        <div style="color: #999; font-size: 11px;">
          ${hint.suggestion}
        </div>
      </div>
    `).join('')}
  `;
}

function getSeverityColor(severity) {
  const colors = {
    error: '#ff5f56',
    warning: '#f59e0b',
    info: '#3b82f6'
  };
  return colors[severity] || '#999';
}





class ValidationHints {
  constructor(editorId = 'codeEditor') {
    this.editor = document.getElementById(editorId);
    this.hints = [];
    this.checkInterval = null;
  }

  init() {
    if (!this.editor) return;

    createHintsContainer(this.editor);

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

  analyzeCode() {
    const code = this.editor.value;
    this.hints = [];

    checkMissingAwait(code, this.hints);
    checkMissingErrorHandling(code, this.hints);
    checkUnusedVariables(code, this.hints);
    checkCommonMistakes(code, this.hints);
    checkMissingReturns(code, this.hints);

    renderHints(this.hints);
  }

  destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }
}

function initValidationHints(editorId = 'codeEditor') {
  const hints = new ValidationHints(editorId);
  window.validationHints = hints;
  hints.init();
  return hints;
}

if (typeof window !== 'undefined') {
  window.initValidationHints = initValidationHints;
}


if (typeof window !== 'undefined') {
  window.ValidationHints = ValidationHints;
}
