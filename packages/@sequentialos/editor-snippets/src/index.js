import { initSnippets } from './snippets.js';
import { createModal, closeModal } from './modal.js';
import { updateList, escapeHtml } from './ui.js';

export class SnippetInsert {
  constructor(editorId = 'codeEditor') {
    this.editor = document.getElementById(editorId);
    this.snippets = initSnippets();
    this.isVisible = false;
  }

  init() {
    if (!this.editor) return;
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "'") {
        e.preventDefault();
        this.toggle();
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
    createModal(
      (query) => this.handleSearch(query),
      (snippet) => this.insertSnippet(snippet),
      () => this.close()
    );
    this.isVisible = true;
    const input = document.getElementById('snippetSearchInput');
    if (input) {
      input.focus();
    }
  }

  close() {
    closeModal();
    this.isVisible = false;
  }

  handleSearch(query) {
    updateList(this.snippets, query, (snippet) => this.insertSnippet(snippet));
  }

  insertSnippet(snippet) {
    if (!this.editor) return;

    const { selectionStart, selectionEnd, value } = this.editor;
    const before = value.substring(0, selectionStart);
    const after = value.substring(selectionEnd);

    const newCode = before + snippet.code + after;
    this.editor.value = newCode;

    const newPos = selectionStart + snippet.code.length;
    this.editor.setSelectionRange(newPos, newPos);
    this.editor.focus();
    this.editor.dispatchEvent(new Event('input', { bubbles: true }));

    this.close();

    if (window.showSuccess) {
      window.showSuccess(`✓ Inserted: ${snippet.label}`);
    }
  }
}

export function initSnippetInsert(editorId = 'codeEditor') {
  const snippets = new SnippetInsert(editorId);
  window.snippetInsert = snippets;
  snippets.init();
  return snippets;
}

if (typeof window !== 'undefined') {
  window.initSnippetInsert = initSnippetInsert;
}
