/**
 * task-editor-ui.js - Task editor UI components and validation
 *
 * Pure logic validator and schema input UI for task editor
 */

export class TaskEditorUI {
  constructor(appSDK) {
    this.appSDK = appSDK;
  }

  attachPureLogicValidator() {
    const codeEditor = document.querySelector('textarea');
    if (!codeEditor) return;

    const warningDiv = document.createElement('div');
    warningDiv.id = 'pure-logic-warning';
    warningDiv.style.cssText = 'background: #3a3a2a; color: #ffb366; padding: 12px; border-radius: 6px; margin-bottom: 16px; font-size: 13px; border: 1px solid #666633; display: none;';
    warningDiv.innerHTML = '⚠️ Tasks should be pure logic functions with no imports';

    codeEditor.parentElement.insertBefore(warningDiv, codeEditor);

    codeEditor.addEventListener('blur', () => {
      const code = codeEditor.value;
      const hasImports = /^\s*import\s+|^\s*require\s*\(/m.test(code);

      if (hasImports) {
        warningDiv.style.display = 'block';
      } else {
        warningDiv.style.display = 'none';
      }
    });
  }

  attachInputOutputSchema() {
    const schemaSection = document.createElement('div');
    schemaSection.className = 'form-group';
    schemaSection.innerHTML = `
      <label>Input Schema (JSON)</label>
      <textarea id="input-schema" placeholder='{"field": "description"}' style="font-family: 'Courier New', monospace; height: 100px;"></textarea>
      <label style="margin-top: 16px;">Output Schema (JSON)</label>
      <textarea id="output-schema" placeholder='{"field": "description"}' style="font-family: 'Courier New', monospace; height: 100px;"></textarea>
    `;

    const content = document.querySelector('.content');
    if (content) {
      content.appendChild(schemaSection);
    }
  }
}
