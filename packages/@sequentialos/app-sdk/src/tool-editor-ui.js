/**
 * tool-editor-ui.js - Tool editor UI management
 *
 * Create import section and manage import input elements
 */

export class ToolEditorUI {
  constructor(appSDK) {
    this.appSDK = appSDK;
    this.importUI = null;
  }

  createImportSection() {
    const importSection = document.createElement('div');
    importSection.className = 'form-group';
    importSection.innerHTML = `
      <label>Tool Dependencies (imports)</label>
      <div id="import-list" style="background: #2a2a2a; border: 1px solid #3a3a3a; border-radius: 6px; padding: 12px;">
        <div id="imports-container"></div>
        <button type="button" id="add-import-btn" style="margin-top: 10px; padding: 8px 12px; background: #3a3a3a; border: none; color: #e0e0e0; border-radius: 4px; cursor: pointer; font-size: 12px;">+ Add Import</button>
      </div>
      <p style="font-size: 11px; color: #888; margin-top: 8px;">List npm packages your tool imports (e.g., axios, lodash, node-cache)</p>
    `;

    const codeSection = document.querySelector('.form-group textarea')?.parentElement;
    if (codeSection) {
      codeSection.parentElement.insertBefore(importSection, codeSection.nextSibling);
    }

    this.importUI = importSection;
    this.attachImportHandlers();
  }

  attachImportHandlers() {
    const addBtn = document.getElementById('add-import-btn');
    if (!addBtn) return;

    addBtn.addEventListener('click', () => this.addImportInput());
  }

  addImportInput() {
    const container = document.getElementById('imports-container');
    const input = document.createElement('div');
    input.style.cssText = 'display: flex; gap: 8px; margin-bottom: 8px; align-items: center;';
    input.innerHTML = `
      <input type="text" class="import-input" placeholder="e.g., axios" style="flex: 1; background: #1a1a1a; border: 1px solid #3a3a3a; color: #e0e0e0; padding: 8px 12px; border-radius: 4px; font-size: 13px;">
      <button type="button" class="remove-import" style="padding: 6px 10px; background: #8b3333; border: none; color: #e0e0e0; border-radius: 4px; cursor: pointer; font-size: 12px;">Remove</button>
    `;

    container.appendChild(input);

    input.querySelector('.remove-import').addEventListener('click', () => {
      input.remove();
    });
  }

  getImports() {
    const inputs = document.querySelectorAll('.import-input');
    return Array.from(inputs).map(inp => inp.value).filter(v => v.trim());
  }

  showValidationError(validation) {
    let message = '';
    if (validation.missing.length > 0) {
      message += `Missing imports: ${validation.missing.join(', ')}. `;
    }
    if (validation.unused.length > 0) {
      message += `Unused imports: ${validation.unused.join(', ')}.`;
    }

    const errorDiv = document.getElementById('validation-error') || document.createElement('div');
    errorDiv.id = 'validation-error';
    errorDiv.style.cssText = 'background: #4a2a2a; color: #ff6b6b; padding: 12px; border-radius: 6px; margin-bottom: 16px; font-size: 13px; border: 1px solid #8b3333;';
    errorDiv.textContent = message;

    const content = document.querySelector('.content');
    if (content && !document.getElementById('validation-error')) {
      content.insertBefore(errorDiv, content.firstChild);
    }
  }

  clearValidationError() {
    const errorDiv = document.getElementById('validation-error');
    if (errorDiv) {
      errorDiv.remove();
    }
  }
}
