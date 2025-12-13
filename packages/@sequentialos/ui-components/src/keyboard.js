/**
 * keyboard.js - Facade for keyboard UI components
 *
 * Delegates to focused modules:
 * - keyboard-registry: Shortcut registration and event handling
 * - help-modal: Keyboard shortcuts help modal
 * - command-palette: Command search and execution
 */

import { KeyboardShortcuts } from './keyboard-registry.js';
import { createHelpModal } from './help-modal.js';
import { createCommandPalette } from './command-palette.js';

// Re-export for backward compatibility
export { KeyboardShortcuts };

// Create extended KeyboardShortcuts with help modal integration
const originalShowHelpModal = KeyboardShortcuts.prototype.showHelpModal;
KeyboardShortcuts.prototype.showHelpModal = function() {
  originalShowHelpModal.call(this);
  if (this.helpVisible) {
    const helpModal = createHelpModal(this);
    helpModal.show();
  } else {
    const modal = document.getElementById('keyboard-help-modal');
    if (modal) modal.remove();
  }
};

export { createCommandPalette };
