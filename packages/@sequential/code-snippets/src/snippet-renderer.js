import { buildCategoryHTML, buildSearchResultsHTML } from './snippet-dom-builder.js';

/**
 * Render categories and snippets in menu
 */
export function renderCategories(editorId, menuElement, snippetManager) {
  const menuId = menuElement.id;
  const categoriesContainer = menuElement.querySelector(`[id$="-categories"]`);

  if (!categoriesContainer) return;

  const categories = snippetManager.getAllCategories();
  let html = '';

  for (const category of categories) {
    const snippets = snippetManager.getSnippetsByCategory(category);
    html += buildCategoryHTML(category, snippets, menuId, editorId);
  }

  categoriesContainer.innerHTML = html;
}

/**
 * Filter and display search results
 */
export function filterSnippets(editorId, menuElement, snippetManager, query) {
  if (!query) {
    renderCategories(editorId, menuElement, snippetManager);
    return;
  }

  const results = snippetManager.searchSnippets(query);
  const categoriesContainer = menuElement.querySelector(`[id$="-categories"]`);

  if (categoriesContainer) {
    categoriesContainer.innerHTML = buildSearchResultsHTML(results, editorId);
  }
}

/**
 * Populate modal with snippet details and variables
 */
export function populateSnippetModal(editorId, modalElement, snippet) {
  const menuId = modalElement.id.replace('-modal', '');
  const modalTitle = modalElement.querySelector(`[id$="-modal-title"]`);
  const modalVars = modalElement.querySelector(`[id$="-modal-vars"]`);

  if (!modalTitle || !modalVars) return;

  modalTitle.textContent = snippet.name;

  if (snippet.templateVars.length === 0) {
    modalVars.innerHTML = '<p style="color: #888;">No variables to configure</p>';
    return false; // Don't auto-insert
  }

  const { buildVariableInputsHTML } = await import('./snippet-dom-builder.js');
  const varsHTML = buildVariableInputsHTML(snippet.templateVars);
  modalVars.innerHTML = varsHTML;

  const firstInput = modalVars.querySelector('input');
  if (firstInput) {
    firstInput.focus();
  }

  return true; // Need variable input
}

/**
 * Toggle category expanded/collapsed state
 */
export function toggleCategoryExpanded(menuId, categoryKey) {
  const itemsDiv = document.getElementById(`${menuId}-${categoryKey}-items`);
  const arrowSpan = document.getElementById(`${menuId}-${categoryKey}-arrow`);

  if (itemsDiv) {
    itemsDiv.classList.toggle('expanded');
    if (arrowSpan) {
      arrowSpan.textContent = itemsDiv.classList.contains('expanded') ? '▼' : '▶';
    }
  }
}
