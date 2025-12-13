/**
 * DOM creation and structure building for snippet UI
 */
export function buildMenuHTML(menuId, editorId) {
  return `
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
          <button class="snippet-modal-btn snippet-modal-btn-primary" onclick="window._snippetUIManagers && window._snippetUIManagers['${editorId}'] && window._snippetUIManagers['${editorId}'].insertSelectedSnippet()">Insert</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Create and append menu/modal DOM elements
 */
export function createAndAppendMenuDOM(editorElement, menuId, editorId) {
  const container = document.createElement('div');
  container.innerHTML = buildMenuHTML(menuId, editorId);
  editorElement.parentElement.appendChild(container.firstElementChild);
  editorElement.parentElement.appendChild(container.lastElementChild);

  const menuElement = document.getElementById(menuId);
  const searchBox = document.getElementById(`${menuId}-search`);
  const modalElement = document.getElementById(`${menuId}-modal`);

  return { menuElement, searchBox, modalElement };
}

/**
 * Build category HTML for rendering
 */
export function buildCategoryHTML(category, snippets, menuId, editorId) {
  const categoryKey = category.replace(/\s+/g, '-').toLowerCase();
  let html = `
    <div class="snippet-category">
      <div class="snippet-category-title" onclick="window._snippetUIManagers && window._snippetUIManagers['${editorId}'] && window._snippetUIManagers['${editorId}'].toggleCategory('${categoryKey}')">
        <span>${category}</span>
        <span id="${menuId}-${categoryKey}-arrow">▶</span>
      </div>
      <div class="snippet-items" id="${menuId}-${categoryKey}-items">
  `;

  for (const snippet of snippets) {
    html += `
      <div class="snippet-item" onclick="window._snippetUIManagers && window._snippetUIManagers['${editorId}'] && window._snippetUIManagers['${editorId}'].selectSnippet('${snippet.id}')">
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

  return html;
}

/**
 * Build search results HTML
 */
export function buildSearchResultsHTML(snippets, editorId) {
  let html = '';
  for (const snippet of snippets) {
    html += `
      <div class="snippet-item" onclick="window._snippetUIManagers && window._snippetUIManagers['${editorId}'] && window._snippetUIManagers['${editorId}'].selectSnippet('${snippet.id}')">
        <div>
          <div class="snippet-item-name">${snippet.name}</div>
          <div class="snippet-item-desc">${snippet.description}</div>
        </div>
      </div>
    `;
  }
  return html || '<div style="padding: 12px; color: #888;">No snippets found</div>';
}

/**
 * Build modal variable input HTML
 */
export function buildVariableInputsHTML(templateVars) {
  let html = '';
  for (const varDef of templateVars) {
    html += `
      <div class="snippet-var-group">
        <label class="snippet-var-label">${varDef.prompt}</label>
        <input type="text" class="snippet-var-input" data-var="${varDef.name}" placeholder="${varDef.name}">
      </div>
    `;
  }
  return html;
}
