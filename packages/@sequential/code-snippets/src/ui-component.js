import { SnippetManager } from './index.js';
import { injectSnippetStyles } from './snippet-styles.js';
import { createAndAppendMenuDOM } from './snippet-dom-builder.js';
import { renderCategories, filterSnippets, populateSnippetModal, toggleCategoryExpanded } from './snippet-renderer.js';
import { setupKeyboardShortcuts, setupSearchListener, clearSearchBox, collectTemplateVariables, insertSnippetAtCursor } from './snippet-interaction.js';

/**
 * Facade maintaining 100% backward compatibility with SnippetUIManager
 */
class SnippetUIManager {
  constructor(editorId, type) {
    this.editorId = editorId;
    this.editorElement = null;
    this.type = type;
    this.snippetManager = new SnippetManager(type);
    this.isMenuOpen = false;
    this.currentCategory = null;
    this.menuElement = null;
    this.searchBox = null;
    this.modalElement = null;
    this.selectedSnippet = null;
  }

  init() {
    this.editorElement = document.getElementById(this.editorId);
    if (!this.editorElement) {
      console.warn(`Editor element not found: ${this.editorId}`);
      return;
    }

    this.createMenuHTML();
    this.attachEventListeners();
  }

  createMenuHTML() {
    injectSnippetStyles();
    const menuId = `snippet-menu-${this.editorId}`;
    const { menuElement, searchBox, modalElement } = createAndAppendMenuDOM(this.editorElement, menuId, this.editorId);

    this.menuElement = menuElement;
    this.searchBox = searchBox;
    this.modalElement = modalElement;
  }

  attachEventListeners() {
    if (!this.menuElement) return;

    setupKeyboardShortcuts(this.editorId, () => this.toggleMenu());
    setupSearchListener(this.searchBox, (query) => this.filterSnippets(query));
    this.renderCategories();
  }

  renderCategories() {
    renderCategories(this.editorId, this.menuElement, this.snippetManager);
  }

  filterSnippets(query) {
    filterSnippets(this.editorId, this.menuElement, this.snippetManager, query);
  }

  toggleCategory(categoryKey) {
    toggleCategoryExpanded(this.menuElement.id, categoryKey);
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    if (this.isMenuOpen) {
      this.menuElement.classList.add('open');
      this.searchBox.focus();
    } else {
      this.menuElement.classList.remove('open');
      clearSearchBox(this.searchBox);
      this.filterSnippets('');
    }
  }

  selectSnippet(snippetId) {
    const snippet = this.snippetManager.getSnippetById(snippetId);
    if (!snippet) return;

    this.selectedSnippet = snippet;
    this.menuElement.classList.remove('open');
    this.isMenuOpen = false;

    const modalTitle = this.modalElement.querySelector('[id$="-modal-title"]');
    const modalVars = this.modalElement.querySelector('[id$="-modal-vars"]');

    modalTitle.textContent = snippet.name;

    if (snippet.templateVars.length === 0) {
      modalVars.innerHTML = '<p style="color: #888;">No variables to configure</p>';
      this.insertSelectedSnippet();
      return;
    }

    const { buildVariableInputsHTML } = require('./snippet-dom-builder.js');
    const varsHTML = buildVariableInputsHTML(snippet.templateVars);
    modalVars.innerHTML = varsHTML;
    this.modalElement.classList.add('open');

    const firstInput = modalVars.querySelector('input');
    if (firstInput) {
      firstInput.focus();
    }
  }

  insertSelectedSnippet() {
    if (!this.selectedSnippet) return;

    const snippet = this.selectedSnippet;
    const templateVars = collectTemplateVariables(this.modalElement);

    insertSnippetAtCursor(this.editorElement, this.snippetManager, snippet, templateVars);
    this.modalElement.classList.remove('open');
    this.selectedSnippet = null;
  }
}

if (typeof window !== 'undefined') {
  window._snippetUIManagers = window._snippetUIManagers || {};
}

export { SnippetUIManager };
