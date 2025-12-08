import { SnippetManager } from './index.js';

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
    const menuId = `snippet-menu-${this.editorId}`;

    const style = document.createElement('style');
    style.textContent = `
      .snippet-button {
        background: #4ade80;
        color: #1a1a1a;
        border: none;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 600;
        font-size: 14px;
        margin: 0 4px;
        transition: background 0.2s;
      }
      .snippet-button:hover {
        background: #22c55e;
      }
      .snippet-menu {
        position: absolute;
        background: #2a2a2a;
        border: 1px solid #4ade80;
        border-radius: 4px;
        box-shadow: 0 8px 16px rgba(0,0,0,0.3);
        z-index: 10000;
        min-width: 300px;
        max-height: 500px;
        overflow-y: auto;
        display: none;
      }
      .snippet-menu.open {
        display: block;
      }
      .snippet-search-box {
        padding: 8px;
        border-bottom: 1px solid #4ade80;
        background: #1a1a1a;
      }
      .snippet-search-box input {
        width: 100%;
        background: #2a2a2a;
        color: #fff;
        border: 1px solid #4ade80;
        padding: 6px 8px;
        border-radius: 3px;
        font-size: 13px;
      }
      .snippet-search-box input::placeholder {
        color: #888;
      }
      .snippet-category {
        padding: 0;
      }
      .snippet-category-title {
        padding: 8px 12px;
        background: #1a1a1a;
        color: #4ade80;
        font-weight: 600;
        cursor: pointer;
        border-bottom: 1px solid #3a3a3a;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .snippet-category-title:hover {
        background: #2a2a2a;
      }
      .snippet-items {
        display: none;
        background: #2a2a2a;
      }
      .snippet-items.expanded {
        display: block;
      }
      .snippet-item {
        padding: 8px 12px;
        border-bottom: 1px solid #3a3a3a;
        cursor: pointer;
        font-size: 13px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .snippet-item:hover {
        background: #3a3a3a;
      }
      .snippet-item-name {
        color: #fff;
        font-weight: 500;
      }
      .snippet-item-desc {
        color: #888;
        font-size: 12px;
        margin-top: 2px;
      }
      .snippet-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.7);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 10001;
      }
      .snippet-modal.open {
        display: flex;
      }
      .snippet-modal-content {
        background: #2a2a2a;
        border: 1px solid #4ade80;
        border-radius: 4px;
        padding: 20px;
        max-width: 500px;
        max-height: 600px;
        overflow-y: auto;
        color: #fff;
      }
      .snippet-modal-title {
        color: #4ade80;
        font-weight: 600;
        margin-bottom: 16px;
        font-size: 16px;
      }
      .snippet-var-group {
        margin-bottom: 16px;
      }
      .snippet-var-label {
        display: block;
        color: #4ade80;
        font-weight: 500;
        font-size: 13px;
        margin-bottom: 4px;
      }
      .snippet-var-input {
        width: 100%;
        background: #1a1a1a;
        color: #fff;
        border: 1px solid #4ade80;
        padding: 8px;
        border-radius: 3px;
        font-size: 13px;
        box-sizing: border-box;
      }
      .snippet-var-input::placeholder {
        color: #666;
      }
      .snippet-var-input:focus {
        outline: none;
        border-color: #22c55e;
      }
      .snippet-modal-buttons {
        display: flex;
        gap: 8px;
        margin-top: 20px;
        justify-content: flex-end;
      }
      .snippet-modal-btn {
        padding: 8px 16px;
        border: none;
        border-radius: 3px;
        cursor: pointer;
        font-weight: 500;
        font-size: 13px;
      }
      .snippet-modal-btn-primary {
        background: #4ade80;
        color: #1a1a1a;
      }
      .snippet-modal-btn-primary:hover {
        background: #22c55e;
      }
      .snippet-modal-btn-secondary {
        background: #3a3a3a;
        color: #fff;
      }
      .snippet-modal-btn-secondary:hover {
        background: #4a4a4a;
      }
    `;

    if (!document.querySelector(`style[data-snippet-css]`)) {
      style.setAttribute('data-snippet-css', 'true');
      document.head.appendChild(style);
    }

    const menuHTML = `
      <div id="${menuId}" class="snippet-menu">
        <div class="snippet-search-box">
          <input type="text" id="${menuId}-search" placeholder="Search snippets...">
        </div>
        <div id="${menuId}-categories"></div>
      </div>
      <div id="${menuId}-modal" class="snippet-modal">
        <div class="snippet-modal-content">
          <div class="snippet-modal-title" id="${menuId}-modal-title"></div>
          <div id="${menuId}-modal-vars"></div>
          <div class="snippet-modal-buttons">
            <button class="snippet-modal-btn snippet-modal-btn-secondary" onclick="document.getElementById('${menuId}-modal').classList.remove('open')">Cancel</button>
            <button class="snippet-modal-btn snippet-modal-btn-primary" onclick="window._snippetUIManagers && window._snippetUIManagers['${this.editorId}'] && window._snippetUIManagers['${this.editorId}'].insertSelectedSnippet()">Insert</button>
          </div>
        </div>
      </div>
    `;

    const container = document.createElement('div');
    container.innerHTML = menuHTML;
    this.editorElement.parentElement.appendChild(container.firstElementChild);
    this.editorElement.parentElement.appendChild(container.lastElementChild);

    this.menuElement = document.getElementById(menuId);
    this.searchBox = document.getElementById(`${menuId}-search`);
    this.modalElement = document.getElementById(`${menuId}-modal`);
    this.modalContent = this.modalElement.querySelector('.snippet-modal-content');
  }

  attachEventListeners() {
    if (!this.menuElement) return;

    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        this.toggleMenu();
      }
    });

    this.searchBox.addEventListener('input', (e) => {
      this.filterSnippets(e.target.value);
    });

    this.renderCategories();
  }

  renderCategories() {
    const categoriesContainer = document.querySelector(`#${this.menuElement.id} + #${this.menuElement.id}-categories`);
    if (!categoriesContainer) {
      const cat = this.menuElement.querySelector(`[id$="-categories"]`);
      this.renderCategoriesInto(cat);
      return;
    }

    const cat = this.menuElement.querySelector(`[id$="-categories"]`);
    if (cat) {
      this.renderCategoriesInto(cat);
    }
  }

  renderCategoriesInto(container) {
    if (!container) return;

    const categories = this.snippetManager.getAllCategories();
    const menuId = this.menuElement.id;

    let html = '';
    for (const category of categories) {
      const snippets = this.snippetManager.getSnippetsByCategory(category);
      const categoryKey = category.replace(/\s+/g, '-').toLowerCase();

      html += `
        <div class="snippet-category">
          <div class="snippet-category-title" onclick="window._snippetUIManagers && window._snippetUIManagers['${this.editorId}'] && window._snippetUIManagers['${this.editorId}'].toggleCategory('${categoryKey}')">
            <span>${category}</span>
            <span id="${menuId}-${categoryKey}-arrow">▶</span>
          </div>
          <div class="snippet-items" id="${menuId}-${categoryKey}-items">
      `;

      for (const snippet of snippets) {
        html += `
          <div class="snippet-item" onclick="window._snippetUIManagers && window._snippetUIManagers['${this.editorId}'] && window._snippetUIManagers['${this.editorId}'].selectSnippet('${snippet.id}')">
            <div>
              <div class="snippet-item-name">${snippet.name}</div>
              <div class="snippet-item-desc">${snippet.description}</div>
            </div>
          </div>
        `;
      }

      html += `
          </div>
        </div>
      `;
    }

    container.innerHTML = html;
  }

  filterSnippets(query) {
    if (!query) {
      this.renderCategories();
      return;
    }

    const results = this.snippetManager.searchSnippets(query);
    const menuId = this.menuElement.id;
    const container = this.menuElement.querySelector(`[id$="-categories"]`);

    let html = '';
    for (const snippet of results) {
      html += `
        <div class="snippet-item" onclick="window._snippetUIManagers && window._snippetUIManagers['${this.editorId}'] && window._snippetUIManagers['${this.editorId}'].selectSnippet('${snippet.id}')">
          <div>
            <div class="snippet-item-name">${snippet.name}</div>
            <div class="snippet-item-desc">${snippet.description}</div>
          </div>
        </div>
      `;
    }

    container.innerHTML = html || '<div style="padding: 12px; color: #888;">No snippets found</div>';
  }

  toggleCategory(categoryKey) {
    const menuId = this.menuElement.id;
    const itemsDiv = document.getElementById(`${menuId}-${categoryKey}-items`);
    const arrowSpan = document.getElementById(`${menuId}-${categoryKey}-arrow`);

    if (itemsDiv) {
      itemsDiv.classList.toggle('expanded');
      arrowSpan.textContent = itemsDiv.classList.contains('expanded') ? '▼' : '▶';
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    if (this.isMenuOpen) {
      this.menuElement.classList.add('open');
      this.searchBox.focus();
    } else {
      this.menuElement.classList.remove('open');
      this.searchBox.value = '';
      this.filterSnippets('');
    }
  }

  selectSnippet(snippetId) {
    const snippet = this.snippetManager.getSnippetById(snippetId);
    if (!snippet) return;

    this.selectedSnippet = snippet;
    this.menuElement.classList.remove('open');
    this.isMenuOpen = false;

    const menuId = this.menuElement.id;
    const modalTitle = this.modalElement.querySelector(`[id$="-modal-title"]`);
    const modalVars = this.modalElement.querySelector(`[id$="-modal-vars"]`);

    modalTitle.textContent = snippet.name;

    if (snippet.templateVars.length === 0) {
      modalVars.innerHTML = '<p style="color: #888;">No variables to configure</p>';
      this.insertSelectedSnippet();
      return;
    }

    let varsHTML = '';
    for (const varDef of snippet.templateVars) {
      varsHTML += `
        <div class="snippet-var-group">
          <label class="snippet-var-label">${varDef.prompt}</label>
          <input type="text" class="snippet-var-input" data-var="${varDef.name}" placeholder="${varDef.name}">
        </div>
      `;
    }

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
    const templateVars = {};

    const inputs = this.modalElement.querySelectorAll('.snippet-var-input');
    for (const input of inputs) {
      const varName = input.getAttribute('data-var');
      templateVars[varName] = input.value || varName;
    }

    this.snippetManager.insertSnippetAtCursor(this.editorElement, snippet, templateVars);
    this.modalElement.classList.remove('open');
    this.selectedSnippet = null;

    if (this.editorElement.onchange) {
      this.editorElement.onchange();
    }
    if (this.editorElement.oninput) {
      this.editorElement.oninput();
    }

    if (typeof showSuccess !== 'undefined') {
      showSuccess(`✓ Inserted snippet: ${snippet.name}`);
    }
  }
}

if (typeof window !== 'undefined') {
  window._snippetUIManagers = window._snippetUIManagers || {};
}

export { SnippetUIManager };
