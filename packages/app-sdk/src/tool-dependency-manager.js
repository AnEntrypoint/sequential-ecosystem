/**
 * tool-dependency-manager.js - Tool dependency management
 *
 * Integrate validation with save workflow and emit deployment events
 */

import { nowISO } from '@sequentialos/timestamp-utilities';

export class ToolDependencyManager {
  constructor(appSDK, ui, validator) {
    this.appSDK = appSDK;
    this.ui = ui;
    this.validator = validator;
  }

  attachDependencyManager() {
    const saveBtn = document.querySelector('button.primary');
    if (!saveBtn) return;

    const origClickHandler = saveBtn.onclick;
    saveBtn.onclick = async (e) => {
      const codeEditor = document.querySelector('textarea');
      const code = codeEditor?.value || '';
      const imports = this.ui.getImports();

      const validation = this.validator.validateToolCode(code, imports);
      if (!validation.valid) {
        alert(`Validation failed: ${validation.missing.join(', ')}`);
        return;
      }

      if (origClickHandler) {
        await origClickHandler.call(saveBtn, e);
      }

      if (imports.length > 0) {
        await this.appSDK.emit('tool:deploy', {
          imports,
          timestamp: nowISO()
        });
      }
    };
  }

  getDependencies() {
    const codeEditor = document.querySelector('textarea');
    const code = codeEditor?.value || '';
    const imports = this.ui.getImports();

    return {
      declared: imports,
      validated: this.validator.validateToolCode(code, imports)
    };
  }
}
