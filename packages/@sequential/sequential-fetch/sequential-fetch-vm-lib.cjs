class SequentialFetchVM {
  constructor(options = {}) {
    this.variables = new Map();
    this.paused = null;
    this.nextFetchId = 1;
  }

  async initialize() {}

  async executeCode(code) {
    try {
      return await this._execute(code, []);
    } catch (error) {
      throw error;
    }
  }

  async _execute(code, remainingCode) {
    const statements = this._split(code);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i].trim();
      if (!stmt) continue;

      if (stmt.includes('fetch(')) {
        const fetchId = this.nextFetchId++;
        const url = this._extractUrl(stmt);
        const varName = this._extractVarName(stmt);
        this.paused = {
          id: fetchId,
          lastVarName: varName,
          variables: new Map(this.variables),
          remaining: [...statements.slice(i + 1), ...remainingCode]
        };

        return {
          type: 'pause',
          state: fetchId,
          fetchRequest: { id: fetchId, url, options: null }
        };
      }

      try {
        this._executeStmt(stmt);
      } catch (e) {
        if (stmt.includes('throw ')) throw e;
      }
    }

    return { type: 'complete', result: this._lastValue };
  }

  async resumeExecution(fetchId, response) {
    if (!this.paused || this.paused.id !== fetchId) {
      throw new Error('No paused fetch with ID ' + fetchId);
    }

    const varName = this.paused.lastVarName;
    if (varName) this.variables.set(varName, response);

    const remaining = this.paused.remaining;
    this.paused = null;

    return this._execute(remaining.join(';'), []);
  }

  _executeStmt(stmt) {
    const varMatch = stmt.match(/^(const|let|var)\s+(\w+)\s*=\s*(.+)$/);
    if (varMatch) {
      const [, , varName, expr] = varMatch;
      this.variables.set(varName, this._eval(expr));
      return;
    }

    const assignMatch = stmt.match(/^(\w+)\s*=\s*(.+)$/);
    if (assignMatch) {
      const [, varName, expr] = assignMatch;
      this.variables.set(varName, this._eval(expr));
      return;
    }

    if (stmt.startsWith('throw ')) {
      const msg = stmt.match(/Error\s*\(\s*['"`]([^'"`]+)/)?.[1] || 'Error';
      throw new Error(msg);
    }

    this._lastValue = this._eval(stmt);
  }

  _eval(expr) {
    const trimmed = expr.trim();

    if (trimmed === 'true') return true;
    if (trimmed === 'false') return false;
    if (trimmed === 'null') return null;
    if (trimmed === 'undefined') return undefined;

    if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);

    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
        (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
      return trimmed.slice(1, -1);
    }

    if (this.variables.has(trimmed)) return this.variables.get(trimmed);

    const propMatch = trimmed.match(/^(\w+)\.(\w+)$/);
    if (propMatch) {
      const obj = this.variables.get(propMatch[1]);
      return obj ? obj[propMatch[2]] : undefined;
    }

    let expr2 = trimmed;
    for (const [k, v] of this.variables) {
      expr2 = expr2.replace(new RegExp('\\b' + k + '\\b', 'g'), JSON.stringify(v));
    }

    try {
      const fn = new Function('return (' + expr2 + ')');
      return fn();
    } catch {
      return undefined;
    }
  }

  _split(code) {
    const statements = [];
    let current = '';
    let depth = { paren: 0, brace: 0, bracket: 0 };
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < code.length; i++) {
      const char = code[i];

      if (!inString) {
        if (char === '"' || char === "'" || char === '`') {
          inString = true;
          stringChar = char;
        } else if (char === '(') depth.paren++;
        else if (char === ')') depth.paren--;
        else if (char === '{') depth.brace++;
        else if (char === '}') depth.brace--;
        else if (char === '[') depth.bracket++;
        else if (char === ']') depth.bracket--;
        else if (char === ';' && depth.paren === 0 && depth.brace === 0 && depth.bracket === 0) {
          if (current.trim()) statements.push(current);
          current = '';
          continue;
        }
      } else if (char === stringChar) {
        inString = false;
      }

      current += char;
    }

    if (current.trim()) statements.push(current);
    return statements;
  }

  _extractUrl(stmt) {
    const match = stmt.match(/fetch\s*\(\s*(.+)\s*\)\s*;?$/);
    if (!match) return 'unknown';

    const arg = match[1].trim();
    if ((arg.startsWith('"') && arg.includes('"')) ||
        (arg.startsWith("'") && arg.includes("'")) ||
        (arg.startsWith('`') && arg.includes('`'))) {
      try {
        return this._eval(arg);
      } catch {
        return 'unknown';
      }
    }

    return this._eval(arg) || 'unknown';
  }

  _extractVarName(stmt) {
    const match = stmt.match(/^(const|let|var)\s+(\w+)\s*=/);
    return match ? match[2] : null;
  }

  dispose() {
    this.variables.clear();
    this.paused = null;
  }
}

async function executeCode(code) {
  const vm = new SequentialFetchVM();
  const result = await vm.executeCode(code);
  if (result.type !== 'pause') vm.dispose();
  return result;
}

module.exports = { SequentialFetchVM, executeCode };
