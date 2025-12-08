export class FindReplace {
  constructor(editorId = 'codeEditor') {
    this.editor = document.getElementById(editorId);
    this.isVisible = false;
    this.findMatches = [];
    this.currentMatchIndex = -1;
    this.replaceMode = false;
  }

  init() {
    if (!this.editor) return;
    this.setupKeyboardShortcuts();
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'h') {
          e.preventDefault();
          this.toggle();
        }
      }
    });
  }

  toggle() {
    if (this.isVisible) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.createPanel();
    this.isVisible = true;
    const findInput = document.getElementById('findInput');
    if (findInput) {
      findInput.focus();
      if (this.editor) {
        const selected = this.editor.value.substring(this.editor.selectionStart, this.editor.selectionEnd);
        if (selected) {
          findInput.value = selected;
          this.performFind();
        }
      }
    }
  }

  close() {
    const panel = document.getElementById('findReplacePanel');
    if (panel) {
      panel.remove();
    }
    this.isVisible = false;
    this.clearHighlights();
  }

  createPanel() {
    let panel = document.getElementById('findReplacePanel');
    if (panel) return;

    panel = document.createElement('div');
    panel.id = 'findReplacePanel';
    panel.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      background: #2a2a2a;
      border-bottom: 1px solid #3a3a3a;
      padding: 12px 16px;
      display: flex;
      gap: 12px;
      align-items: center;
      z-index: 1000;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
    `;

    const findContainer = document.createElement('div');
    findContainer.style.cssText = 'display: flex; gap: 8px; align-items: center; flex: 1;';
    findContainer.innerHTML = `
      <input id="findInput" type="text" placeholder="Find" style="
        background: #3a3a3a;
        border: 1px solid #4a4a4a;
        color: #e0e0e0;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 13px;
        width: 200px;
      " />
      <div id="matchCount" style="color: #999; font-size: 12px; white-space: nowrap;">0 of 0</div>
      <button id="prevMatch" style="
        background: #3a3a3a;
        border: 1px solid #4a4a4a;
        color: #e0e0e0;
        padding: 6px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
      ">↑</button>
      <button id="nextMatch" style="
        background: #3a3a3a;
        border: 1px solid #4a4a4a;
        color: #e0e0e0;
        padding: 6px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
      ">↓</button>
    `;

    const replaceContainer = document.createElement('div');
    replaceContainer.style.cssText = 'display: flex; gap: 8px; align-items: center; flex: 1; border-left: 1px solid #3a3a3a; padding-left: 12px;';
    replaceContainer.innerHTML = `
      <input id="replaceInput" type="text" placeholder="Replace" style="
        background: #3a3a3a;
        border: 1px solid #4a4a4a;
        color: #e0e0e0;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 13px;
        width: 200px;
      " />
      <button id="replaceOne" style="
        background: #3a3a3a;
        border: 1px solid #4a4a4a;
        color: #e0e0e0;
        padding: 6px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
      ">Replace</button>
      <button id="replaceAll" style="
        background: #4ade80;
        border: 1px solid #4ade80;
        color: #1a1a1a;
        padding: 6px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 600;
      ">Replace All</button>
    `;

    const closeButton = document.createElement('button');
    closeButton.textContent = '✕';
    closeButton.style.cssText = `
      background: transparent;
      border: none;
      color: #999;
      cursor: pointer;
      font-size: 18px;
      padding: 4px 8px;
      margin-left: auto;
    `;
    closeButton.onclick = () => this.close();

    panel.appendChild(findContainer);
    panel.appendChild(replaceContainer);
    panel.appendChild(closeButton);

    const editorContainer = this.editor.parentElement;
    if (editorContainer) {
      editorContainer.style.position = 'relative';
      editorContainer.insertBefore(panel, this.editor);
    }

    document.getElementById('findInput').addEventListener('input', () => this.performFind());
    document.getElementById('findInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.findNext();
      if (e.key === 'Escape') this.close();
    });
    document.getElementById('replaceInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.replaceCurrentMatch();
      if (e.key === 'Escape') this.close();
    });
    document.getElementById('nextMatch').addEventListener('click', () => this.findNext());
    document.getElementById('prevMatch').addEventListener('click', () => this.findPrev());
    document.getElementById('replaceOne').addEventListener('click', () => this.replaceCurrentMatch());
    document.getElementById('replaceAll').addEventListener('click', () => this.replaceAllMatches());
  }

  performFind() {
    const findInput = document.getElementById('findInput');
    if (!findInput || !this.editor) return;

    const query = findInput.value;
    this.clearHighlights();

    if (!query) {
      this.updateMatchCount();
      return;
    }

    this.findMatches = [];
    const code = this.editor.value;
    const regex = new RegExp(this.escapeRegex(query), 'gi');
    let match;

    while ((match = regex.exec(code)) !== null) {
      this.findMatches.push({
        start: match.index,
        end: match.index + match[0].length,
        text: match[0]
      });
    }

    if (this.findMatches.length > 0) {
      this.currentMatchIndex = 0;
      this.highlightMatches();
      this.selectMatch(0);
    }

    this.updateMatchCount();
  }

  findNext() {
    if (this.findMatches.length === 0) return;
    this.currentMatchIndex = (this.currentMatchIndex + 1) % this.findMatches.length;
    this.selectMatch(this.currentMatchIndex);
    this.updateMatchCount();
  }

  findPrev() {
    if (this.findMatches.length === 0) return;
    this.currentMatchIndex = (this.currentMatchIndex - 1 + this.findMatches.length) % this.findMatches.length;
    this.selectMatch(this.currentMatchIndex);
    this.updateMatchCount();
  }

  selectMatch(index) {
    if (index < 0 || index >= this.findMatches.length || !this.editor) return;
    const match = this.findMatches[index];
    this.editor.setSelectionRange(match.start, match.end);
    this.editor.focus();
  }

  highlightMatches() {
    if (!this.editor) return;
    const code = this.editor.value;
    let highlighted = '';
    let lastIndex = 0;

    this.findMatches.forEach((match, idx) => {
      highlighted += code.substring(lastIndex, match.start);
      const bgColor = idx === this.currentMatchIndex ? '#f59e0b' : '#3a5f4a';
      highlighted += `<span style="background-color: ${bgColor}; color: #fff;">${this.escapeHtml(match.text)}</span>`;
      lastIndex = match.end;
    });

    highlighted += code.substring(lastIndex);
  }

  clearHighlights() {
    this.findMatches = [];
    this.currentMatchIndex = -1;
  }

  replaceCurrentMatch() {
    if (this.currentMatchIndex < 0 || !this.editor) return;
    const match = this.findMatches[this.currentMatchIndex];
    const replaceInput = document.getElementById('replaceInput');
    const replaceText = replaceInput ? replaceInput.value : '';

    const before = this.editor.value.substring(0, match.start);
    const after = this.editor.value.substring(match.end);
    this.editor.value = before + replaceText + after;

    this.findMatches.splice(this.currentMatchIndex, 1);
    if (this.findMatches.length > 0) {
      this.currentMatchIndex = Math.min(this.currentMatchIndex, this.findMatches.length - 1);
      this.selectMatch(this.currentMatchIndex);
    } else {
      this.currentMatchIndex = -1;
    }

    this.updateMatchCount();
    this.editor.dispatchEvent(new Event('input', { bubbles: true }));
  }

  replaceAllMatches() {
    if (this.findMatches.length === 0 || !this.editor) return;
    const findInput = document.getElementById('findInput');
    const replaceInput = document.getElementById('replaceInput');
    const query = findInput ? findInput.value : '';
    const replaceText = replaceInput ? replaceInput.value : '';

    if (!query) return;

    const regex = new RegExp(this.escapeRegex(query), 'g');
    const newCode = this.editor.value.replace(regex, replaceText);
    this.editor.value = newCode;

    this.findMatches = [];
    this.currentMatchIndex = -1;
    this.updateMatchCount();
    this.editor.dispatchEvent(new Event('input', { bubbles: true }));

    if (window.showSuccess) {
      window.showSuccess(`✓ Replaced all ${this.findMatches.length} matches`);
    }
  }

  updateMatchCount() {
    const matchCount = document.getElementById('matchCount');
    if (!matchCount) return;
    if (this.findMatches.length === 0) {
      matchCount.textContent = '0 of 0';
    } else {
      matchCount.textContent = `${this.currentMatchIndex + 1} of ${this.findMatches.length}`;
    }
  }

  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

window.initFindReplace = function(editorId = 'codeEditor') {
  const findReplace = new FindReplace(editorId);
  window.findReplace = findReplace;
  findReplace.init();
};
