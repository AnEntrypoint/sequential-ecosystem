/**
 * action-handler.js
 *
 * Command action execution (save, format, undo, etc.)
 */

import {
  formatJavaScript,
  selectAll,
  copySelection,
  clearEditor,
  getSaveButton
} from './helpers.js';

export function createActionHandler(editor) {
  return {
    invokeAction(action) {
      switch (action) {
        case 'save':
          return this.save();
        case 'find':
          return window.editorFeatures?.toggleFind?.();
        case 'replace':
          return window.findReplace?.toggle?.();
        case 'goto-line':
          return window.editorFeatures?.showGoToLine?.();
        case 'format':
          return this.format();
        case 'select-all':
          return selectAll(editor);
        case 'copy-selection':
          return copySelection(editor);
        case 'clear-editor':
          return clearEditor(editor);
        case 'undo':
          return document.execCommand('undo');
        case 'redo':
          return document.execCommand('redo');
        case 'run-task': {
          const btn = document.querySelector('[onclick*="runTask"]');
          return btn?.click();
        }
        case 'show-templates':
          return window.showTemplateGallery?.();
        case 'test-tool': {
          const btn = document.querySelector('[onclick*="testTool"]');
          return btn?.click();
        }
        case 'help':
          return window.editorFeatures?.showHelp?.();
      }
    },

    save() {
      const btn = getSaveButton();
      return btn?.click();
    },

    format() {
      if (!editor) return;
      try {
        const code = editor.value;
        const formatted = formatJavaScript(code);
        editor.value = formatted;
        editor.dispatchEvent(new Event('input', { bubbles: true }));
        if (window.showSuccess) {
          window.showSuccess('✓ Code formatted');
        }
      } catch (err) {
        if (window.showError) {
          window.showError('Failed to format code');
        }
      }
    }
  };
}
