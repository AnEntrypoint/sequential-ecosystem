export class ParameterHints {
  constructor(editorId = 'codeEditor') {
    this.editor = document.getElementById(editorId);
    this.hints = null;
    this.isVisible = false;
  }

  init() {
    if (!this.editor) return;
    this.editor.addEventListener('input', (e) => this.handleInput(e));
    this.editor.addEventListener('click', (e) => this.handleClick(e));
    document.addEventListener('click', (e) => {
      if (e.target !== this.editor && !e.target.closest('#parameterHintsContainer')) {
        this.hide();
      }
    });
  }

  handleInput(e) {
    const code = this.editor.value;
    const cursorPos = this.editor.selectionStart;
    const hint = this.findToolCall(code, cursorPos);

    if (hint) {
      this.show(hint);
    } else {
      this.hide();
    }
  }

  handleClick(e) {
    const code = this.editor.value;
    const cursorPos = this.editor.selectionStart;
    const hint = this.findToolCall(code, cursorPos);

    if (hint) {
      this.show(hint);
    } else {
      this.hide();
    }
  }

  findToolCall(code, cursorPos) {
    const beforeCursor = code.substring(0, cursorPos);
    const callPattern = /__callHostTool__\s*\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]*)['"](?:\s*,\s*(.*))?/;
    const match = beforeCursor.match(callPattern);

    if (match) {
      return {
        appId: match[1],
        toolName: match[2],
        parameters: match[3] || '',
        fullMatch: match[0],
        cursorPos: cursorPos,
        matchStart: beforeCursor.lastIndexOf(match[0])
      };
    }

    return null;
  }

  show(hint) {
    if (this.isVisible && this.hints === hint) return;

    this.hide();
    this.hints = hint;
    this.isVisible = true;

    const container = document.createElement('div');
    container.id = 'parameterHintsContainer';
    container.style.cssText = `
      position: fixed;
      background: #2a2a2a;
      border: 1px solid #3a3a3a;
      border-radius: 6px;
      padding: 12px 16px;
      max-width: 400px;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
      font-size: 12px;
      box-shadow: 0 8px 16px rgba(0,0,0,0.3);
    `;

    const editorRect = this.editor.getBoundingClientRect();
    const scrollTop = this.editor.scrollTop;
    const lineHeight = parseInt(window.getComputedStyle(this.editor).lineHeight);
    const cursorLine = (this.editor.value.substring(0, hint.cursorPos).match(/\n/g) || []).length;

    container.style.left = editorRect.left + 'px';
    container.style.top = (editorRect.top + (cursorLine + 2) * lineHeight - scrollTop) + 'px';

    const title = document.createElement('div');
    title.style.cssText = 'color: #4ade80; font-weight: 600; margin-bottom: 8px;';
    title.textContent = `${hint.appId}::${hint.toolName}`;
    container.appendChild(title);

    const paramInfo = document.createElement('div');
    paramInfo.style.cssText = 'color: #999; font-size: 11px; margin-bottom: 8px;';
    paramInfo.innerHTML = `
      <div>App: <span style="color: #e0e0e0;">${this.escapeHtml(hint.appId)}</span></div>
      <div>Tool: <span style="color: #e0e0e0;">${this.escapeHtml(hint.toolName)}</span></div>
    `;
    container.appendChild(paramInfo);

    const paramsLabel = document.createElement('div');
    paramsLabel.style.cssText = 'color: #666; font-weight: 600; margin-top: 8px; margin-bottom: 4px;';
    paramsLabel.textContent = 'Parameters:';
    container.appendChild(paramsLabel);

    const paramsList = document.createElement('div');
    paramsList.style.cssText = 'color: #999; font-size: 11px; font-family: monospace;';
    paramsList.innerHTML = `
      <div style="color: #64b5f6;">function(input)</div>
      <div style="color: #999; margin-top: 4px;">Returns: Promise&lt;any&gt;</div>
    `;
    container.appendChild(paramsList);

    const note = document.createElement('div');
    note.style.cssText = 'color: #666; font-size: 10px; margin-top: 8px; border-top: 1px solid #3a3a3a; padding-top: 8px;';
    note.textContent = 'Press Escape to close • Tab to autocomplete';
    container.appendChild(note);

    document.body.appendChild(container);

    setTimeout(() => {
      if (window.addEventListener) {
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
      }
    }, 100);
  }

  hide() {
    const container = document.getElementById('parameterHintsContainer');
    if (container) {
      container.remove();
    }
    this.isVisible = false;
    this.hints = null;
  }

  handleKeyDown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      this.hide();
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

window.initParameterHints = function(editorId = 'codeEditor') {
  const hints = new ParameterHints(editorId);
  window.parameterHints = hints;
  hints.init();
};

