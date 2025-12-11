/**
 * User interactions and snippet insertion
 */
export function collectTemplateVariables(modalElement) {
  const templateVars = {};
  const inputs = modalElement.querySelectorAll('.snippet-var-input');

  for (const input of inputs) {
    const varName = input.getAttribute('data-var');
    templateVars[varName] = input.value || varName;
  }

  return templateVars;
}

/**
 * Insert snippet at cursor position with template variables
 */
export function insertSnippetAtCursor(editorElement, snippetManager, snippet, templateVars) {
  snippetManager.insertSnippetAtCursor(editorElement, snippet, templateVars);

  // Trigger change events
  if (editorElement.onchange) {
    editorElement.onchange();
  }
  if (editorElement.oninput) {
    editorElement.oninput();
  }

  // Show success notification if available
  if (typeof showSuccess !== 'undefined') {
    showSuccess(`✓ Inserted snippet: ${snippet.name}`);
  }
}

/**
 * Setup keyboard shortcuts for snippet menu
 */
export function setupKeyboardShortcuts(editorId, toggleMenuFn) {
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'S') {
      e.preventDefault();
      toggleMenuFn();
    }
  });
}

/**
 * Setup search input listener
 */
export function setupSearchListener(searchBox, filterFn) {
  searchBox.addEventListener('input', (e) => {
    filterFn(e.target.value);
  });
}

/**
 * Clear search box
 */
export function clearSearchBox(searchBox) {
  searchBox.value = '';
}
