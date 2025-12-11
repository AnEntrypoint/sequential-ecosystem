import { checkMissingAwait, checkMissingErrorHandling, checkUnusedVariables, checkCommonMistakes, checkMissingReturns } from './checks.js';
import { createHintsContainer, renderHints } from './ui.js';

export class ValidationHints {
  constructor(editorId = 'codeEditor') {
    this.editor = document.getElementById(editorId);
    this.hints = [];
    this.checkInterval = null;
  }

  init() {
    if (!this.editor) return;

    createHintsContainer(this.editor);

    this.checkInterval = setInterval(() => {
      this.analyzeCode();
    }, 1000);

    this.editor.addEventListener('input', () => {
      clearInterval(this.checkInterval);
      this.checkInterval = setInterval(() => {
        this.analyzeCode();
      }, 1000);
    });
  }

  analyzeCode() {
    const code = this.editor.value;
    this.hints = [];

    checkMissingAwait(code, this.hints);
    checkMissingErrorHandling(code, this.hints);
    checkUnusedVariables(code, this.hints);
    checkCommonMistakes(code, this.hints);
    checkMissingReturns(code, this.hints);

    renderHints(this.hints);
  }

  destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }
}

export function initValidationHints(editorId = 'codeEditor') {
  const hints = new ValidationHints(editorId);
  window.validationHints = hints;
  hints.init();
  return hints;
}

if (typeof window !== 'undefined') {
  window.initValidationHints = initValidationHints;
}
