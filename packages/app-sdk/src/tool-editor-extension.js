/**
 * tool-editor-extension.js - Tool Editor Extension Facade
 *
 * Delegates to focused modules:
 * - tool-editor-ui: UI creation and import input management
 * - tool-import-validator: Import validation and analysis
 * - tool-dependency-manager: Dependency tracking and save integration
 */

import { ToolEditorUI } from './tool-editor-ui.js';
import { ToolImportValidator } from './tool-import-validator.js';
import { ToolDependencyManager } from './tool-dependency-manager.js';

export class ToolEditorExtension {
  constructor(appSDK) {
    this.appSDK = appSDK;
    this.ui = new ToolEditorUI(appSDK);
    this.validator = new ToolImportValidator(appSDK);
    this.depMgr = new ToolDependencyManager(appSDK, this.ui, this.validator);
  }

  initializeUI() {
    this.ui.createImportSection();
    this.attachValidation();
    this.depMgr.attachDependencyManager();
  }

  attachValidation() {
    const codeEditor = document.querySelector('textarea');
    if (!codeEditor) return;

    codeEditor.addEventListener('blur', () => {
      this.validateToolCode();
    });
  }

  validateToolCode() {
    const codeEditor = document.querySelector('textarea');
    const imports = this.ui.getImports();
    const code = codeEditor?.value || '';

    const validation = this.validator.validateToolCode(code, imports);

    if (!validation.valid) {
      this.ui.showValidationError(validation);
    } else {
      this.ui.clearValidationError();
    }

    return validation;
  }

  getDependencies() {
    return this.depMgr.getDependencies();
  }
}

export function initializeToolEditorExtension(appSDK) {
  const extension = new ToolEditorExtension(appSDK);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => extension.initializeUI());
  } else {
    extension.initializeUI();
  }
  return extension;
}
