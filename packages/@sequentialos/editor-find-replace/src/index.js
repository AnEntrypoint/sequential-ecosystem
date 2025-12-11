import { createSearchEngine } from './search.js';
import { createFindReplaceUI } from './ui.js';

export class FindReplace {
  constructor(editorId = 'codeEditor') {
    this.editor = document.getElementById(editorId);
    this.isVisible = false;
    this.searchEngine = createSearchEngine(this.editor);
    this.ui = createFindReplaceUI(this.editor, this.searchEngine);
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
    this.ui.createPanel(
      () => this.performFind(),
      () => this.replaceCurrentMatch(),
      () => this.replaceAllMatches(),
      () => this.close()
    );
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
    this.ui.closePanel();
    this.isVisible = false;
    this.searchEngine.clear();
  }

  performFind() {
    const inputs = this.ui.getInputs();
    const matches = this.searchEngine.findMatches(inputs.find);

    if (matches.length > 0) {
      this.searchEngine.selectMatch(0);
    }

    this.ui.updateMatchCount(this.searchEngine.getCurrentIndex(), matches.length);
  }

  replaceCurrentMatch() {
    if (!this.editor) return;
    const idx = this.searchEngine.getCurrentIndex();
    if (idx < 0) return;

    const match = this.searchEngine.getMatchAt(idx);
    const inputs = this.ui.getInputs();

    const before = this.editor.value.substring(0, match.start);
    const after = this.editor.value.substring(match.end);
    this.editor.value = before + inputs.replace + after;

    const matches = this.searchEngine.getMatches();
    matches.splice(idx, 1);

    if (matches.length > 0) {
      const newIdx = Math.min(idx, matches.length - 1);
      this.searchEngine.setCurrentIndex(newIdx);
      this.searchEngine.selectMatch(newIdx);
    } else {
      this.searchEngine.setCurrentIndex(-1);
    }

    this.ui.updateMatchCount(this.searchEngine.getCurrentIndex(), matches.length);
    this.editor.dispatchEvent(new Event('input', { bubbles: true }));
  }

  replaceAllMatches() {
    if (!this.editor) return;
    const inputs = this.ui.getInputs();
    if (!inputs.find) return;

    const regex = new RegExp(this.searchEngine.escapeRegex(inputs.find), 'g');
    const newCode = this.editor.value.replace(regex, inputs.replace);
    this.editor.value = newCode;

    this.searchEngine.clear();
    this.ui.updateMatchCount(0, 0);
    this.editor.dispatchEvent(new Event('input', { bubbles: true }));

    if (window.showSuccess) {
      window.showSuccess('✓ Replaced all matches');
    }
  }
}

export function initFindReplace(editorId = 'codeEditor') {
  const findReplace = new FindReplace(editorId);
  window.findReplace = findReplace;
  findReplace.init();
  return findReplace;
}

if (typeof window !== 'undefined') {
  window.initFindReplace = initFindReplace;
}
