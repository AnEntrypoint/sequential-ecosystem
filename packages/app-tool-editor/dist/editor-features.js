export class EditorFeatures {
  constructor(editorId = 'codeEditor') {
    this.editor = document.getElementById(editorId);
    this.shortcuts = new Map();
    this.findVisible = false;
    this.findIndex = -1;
    this.searchMatches = [];
    this.isFlowEditor = !this.editor;
  }

  init() {
    this.setupKeyboardShortcuts();
    if (!this.isFlowEditor) {
      this.injectFindUI();
    }
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'k') {
          e.preventDefault();
          this.showCommandPalette();
        } else if (e.key === 'f') {
          e.preventDefault();
          this.toggleFind();
        } else if (e.key === 'g') {
          e.preventDefault();
          this.showGoToLine();
        } else if (e.key === '/') {
          e.preventDefault();
          this.toggleComment();
        }
      }
    });
  }

  injectFindUI() {
    const container = document.createElement('div');
    container.id = 'find-container';
    container.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      background: #2a2a2a;
      border: 1px solid #3a3a3a;
      border-radius: 6px;
      padding: 10px;
      display: none;
      gap: 8px;
      z-index: 1000;
      min-width: 300px;
    `;

    container.innerHTML = `
      <input type="text" id="find-input" placeholder="Find in code..." style="
        flex: 1;
        background: #1a1a1a;
        border: 1px solid #3a3a3a;
        color: #e0e0e0;
        padding: 8px;
        border-radius: 4px;
        font-size: 13px;
      ">
      <div id="find-stats" style="font-size: 12px; color: #999;">0/0</div>
      <button id="find-prev" style="
        background: #3a3a3a;
        border: none;
        color: #e0e0e0;
        padding: 6px 12px;
        cursor: pointer;
        border-radius: 4px;
      ">↑</button>
      <button id="find-next" style="
        background: #3a3a3a;
        border: none;
        color: #e0e0e0;
        padding: 6px 12px;
        cursor: pointer;
        border-radius: 4px;
      ">↓</button>
      <button id="find-close" style="
        background: #3a3a3a;
        border: none;
        color: #e0e0e0;
        padding: 6px 12px;
        cursor: pointer;
        border-radius: 4px;
      ">✕</button>
    `;

    const editorContainer = this.editor?.parentElement;
    if (editorContainer) {
      editorContainer.style.position = 'relative';
      editorContainer.appendChild(container);
    }

    document.getElementById('find-input').addEventListener('input', (e) => {
      this.performSearch(e.target.value);
    });

    document.getElementById('find-prev').addEventListener('click', () => {
      this.findIndex = Math.max(0, this.findIndex - 1);
      this.highlightMatch();
    });

    document.getElementById('find-next').addEventListener('click', () => {
      this.findIndex = Math.min(this.searchMatches.length - 1, this.findIndex + 1);
      this.highlightMatch();
    });

    document.getElementById('find-close').addEventListener('click', () => {
      this.toggleFind();
    });
  }

  toggleFind() {
    const container = document.getElementById('find-container');
    if (!container) return;

    this.findVisible = !this.findVisible;
    container.style.display = this.findVisible ? 'flex' : 'none';

    if (this.findVisible) {
      document.getElementById('find-input').focus();
    } else {
      this.clearHighlights();
    }
  }

  performSearch(query) {
    if (!query) {
      this.searchMatches = [];
      this.findIndex = -1;
      this.clearHighlights();
      this.updateStats();
      return;
    }

    const code = this.editor.value;
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    this.searchMatches = [...code.matchAll(regex)];
    this.findIndex = 0;
    this.highlightMatch();
  }

  highlightMatch() {
    this.clearHighlights();
    if (this.searchMatches.length === 0) {
      this.updateStats();
      return;
    }

    const match = this.searchMatches[this.findIndex];
    if (!match) return;

    const before = this.editor.value.substring(0, match.index);
    const lineNum = before.split('\n').length - 1;
    this.editor.setSelectionRange(match.index, match.index + match[0].length);

    this.updateStats();
  }

  clearHighlights() {
    this.editor.setSelectionRange(0, 0);
  }

  updateStats() {
    const stats = document.getElementById('find-stats');
    if (stats) {
      const count = this.searchMatches.length;
      const current = this.findIndex >= 0 ? this.findIndex + 1 : 0;
      stats.textContent = `${current}/${count}`;
    }
  }

  showCommandPalette() {
    const commands = [
      { id: 'run', name: '▶ Run Tool', description: 'Execute the tool (F5)' },
      { id: 'save', name: '💾 Save', description: 'Save changes (Ctrl+S)' },
      { id: 'find', name: '🔍 Find', description: 'Find in code (Ctrl+F)' },
      { id: 'goto-line', name: '📍 Go to Line', description: 'Jump to line (Ctrl+G)' },
      { id: 'format', name: '🎨 Format Code', description: 'Format code (Ctrl+Shift+F)' },
      { id: 'help', name: '❓ Keyboard Help', description: 'Show keyboard shortcuts (Ctrl+?)' }
    ];

    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: flex-start;
      justify-content: center;
      z-index: 10002;
      padding-top: 100px;
    `;

    const box = document.createElement('div');
    box.style.cssText = `
      background: #2a2a2a;
      color: #e0e0e0;
      border-radius: 8px;
      width: 90%;
      max-width: 600px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.6);
      overflow: hidden;
    `;

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Search commands...';
    input.style.cssText = `
      width: 100%;
      padding: 12px 16px;
      border: none;
      background: transparent;
      color: #e0e0e0;
      font-size: 16px;
      outline: none;
      border-bottom: 1px solid #3a3a3a;
      box-sizing: border-box;
    `;

    const list = document.createElement('div');
    list.style.cssText = `
      max-height: 400px;
      overflow-y: auto;
    `;

    const renderList = (filtered) => {
      list.innerHTML = filtered.map((cmd) => `
        <div style="
          padding: 12px 16px;
          cursor: pointer;
          border-bottom: 1px solid #3a3a3a;
          transition: background 0.2s;
        "
        onmouseover="this.style.background='#3a3a3a'"
        onmouseout="this.style.background='transparent'"
        onclick="window.editorFeaturesCallback('${cmd.id}')">
          <div style="font-weight: 600; color: #4ade80;">${cmd.name}</div>
          <div style="font-size: 12px; color: #999; margin-top: 4px;">${cmd.description}</div>
        </div>
      `).join('');
    };

    input.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const filtered = commands.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query)
      );
      renderList(filtered);
    });

    box.appendChild(input);
    box.appendChild(list);
    modal.appendChild(box);
    document.body.appendChild(modal);

    input.focus();
    renderList(commands);

    window.editorFeaturesCallback = (cmdId) => {
      modal.remove();
      this.executeCommand(cmdId);
    };

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') modal.remove();
    });
  }

  executeCommand(cmdId) {
    const handlers = {
      'run': () => {
        const runBtn = document.querySelector('button:contains("Run")') ||
                       document.querySelector('[data-action="run"]');
        if (runBtn) runBtn.click();
      },
      'save': () => window.saveTask && window.saveTask(),
      'find': () => this.toggleFind(),
      'goto-line': () => this.showGoToLine(),
      'format': () => window.formatCode && window.formatCode(),
      'help': () => this.showKeyboardHelp()
    };

    const handler = handlers[cmdId];
    if (handler) handler();
  }

  showGoToLine() {
    const input = prompt('Go to line (1-' + (this.editor.value.split('\n').length) + '):');
    if (!input) return;

    const lineNum = parseInt(input, 10);
    if (isNaN(lineNum)) return;

    const lines = this.editor.value.split('\n');
    let pos = 0;

    for (let i = 0; i < Math.min(lineNum - 1, lines.length); i++) {
      pos += lines[i].length + 1;
    }

    this.editor.focus();
    this.editor.setSelectionRange(pos, pos);

    const lineHeight = parseInt(window.getComputedStyle(this.editor).lineHeight);
    this.editor.scrollTop = Math.max(0, (lineNum - 5) * lineHeight);
  }

  toggleComment() {
    const start = this.editor.selectionStart;
    const end = this.editor.selectionEnd;
    const code = this.editor.value;

    const beforeStart = code.lastIndexOf('\n', start - 1) + 1;
    const afterEnd = code.indexOf('\n', end);
    const afterEndPos = afterEnd === -1 ? code.length : afterEnd;

    const selectedLines = code.substring(beforeStart, afterEndPos);
    const isCommented = selectedLines.split('\n').some(line =>
      line.trim().startsWith('//')
    );

    const newSelectedLines = selectedLines.split('\n').map(line => {
      if (isCommented) {
        return line.replace(/^\s*\/\/\s?/, '');
      } else {
        const match = line.match(/^(\s*)/);
        return (match ? match[1] : '') + '// ' + line.trim();
      }
    }).join('\n');

    const newCode = code.substring(0, beforeStart) +
                    newSelectedLines +
                    code.substring(afterEndPos);

    this.editor.value = newCode;
    this.editor.setSelectionRange(beforeStart, beforeStart + newSelectedLines.length);
  }

  showKeyboardHelp() {
    const help = `
TOOL EDITOR KEYBOARD SHORTCUTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ctrl+K      Command Palette
Ctrl+F      Find in Code
Ctrl+G      Go to Line
Ctrl+/      Toggle Comment
F5          Run Tool
Ctrl+S      Save
Ctrl+Shift+F Format Code
Ctrl+?      This Help
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `;
    alert(help);
  }
}
