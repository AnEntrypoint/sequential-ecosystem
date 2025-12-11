export class ExecutionWrapper {
  constructor(code, breakpoints) {
    this.originalCode = code;
    this.breakpointLines = new Set(breakpoints.keys());
    this.localVars = new Map();
    this.callStack = [];
    this.wrappedCode = this.wrapCode(code);
  }

  wrapCode(code) {
    const lines = code.split('\n');
    const wrappedLines = [];

    for (let i = 0; i < lines.length; i++) {
      const lineNum = i + 1;
      const line = lines[i];
      let wrappedLine = line;

      if (this.breakpointLines.has(lineNum) && !line.trim().startsWith('//') && !line.trim().startsWith('*')) {
        wrappedLine = `__captureVars__(${lineNum}); ${line}`;
      }

      wrappedLines.push(wrappedLine);
    }

    return wrappedLines.join('\n');
  }

  captureVars() {
    const vars = {};
    const functionBody = this.wrappedCode;
    const varDeclMatch = functionBody.match(/(?:const|let|var)\s+(\w+)/g);

    if (varDeclMatch) {
      varDeclMatch.forEach(decl => {
        const varName = decl.replace(/(?:const|let|var)\s+/, '');
        const value = this.localVars.get(varName);
        if (typeof value !== 'undefined') {
          vars[varName] = value;
        }
      });
    }

    return vars;
  }

  injectGlobals(captureStepFn) {
    const wrapper = this;
    window.__wrapper__ = this;
    window.__taskCode__ = this.originalCode;

    window.__captureVars__ = function(lineNum) {
      try {
        const scope = arguments.callee.caller.toString();
        const varMatch = scope.match(/\b(const|let|var)\s+(\w+)/g);
        if (varMatch) {
          varMatch.forEach(match => {
            const parts = match.split(/\s+/);
            const varName = parts[parts.length - 1];
            wrapper.localVars.set(varName, eval('typeof ' + varName + ' !== "undefined" ? ' + varName + ' : undefined'));
          });
        }
      } catch (e) {}
      window.__executionCheckpoint__(lineNum);
    };

    window.__executionCheckpoint__ = function(lineNum) {
      const vars = {};
      for (const [name, value] of wrapper.localVars) {
        if (typeof value !== 'function') {
          vars[name] = value;
        }
      }
      captureStepFn(lineNum, vars, wrapper.callStack);
    };
  }
}
