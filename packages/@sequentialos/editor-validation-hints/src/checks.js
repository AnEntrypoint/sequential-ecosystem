export function checkMissingAwait(code, hints) {
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

export function checkMissingErrorHandling(code, hints) {
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

export function checkUnusedVariables(code, hints) {
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

export function checkCommonMistakes(code, hints) {
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

export function checkMissingReturns(code, hints) {
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
