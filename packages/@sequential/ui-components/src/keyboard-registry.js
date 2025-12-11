/**
 * keyboard-registry.js
 *
 * Keyboard shortcut registration and event handling
 */

export class KeyboardShortcuts {
  constructor() {
    this.shortcuts = new Map();
    this.helpVisible = false;
  }

  register(key, description, handler) {
    this.shortcuts.set(key, { description, handler });
  }

  init() {
    document.addEventListener('keydown', (e) => this.handleKeydown(e));
  }

  handleKeydown(e) {
    const key = this.getKeyCombo(e);
    const shortcut = this.shortcuts.get(key);

    if (key === 'ctrl+shift+?' || key === 'ctrl+?') {
      e.preventDefault();
      this.showHelpModal();
      return;
    }

    if (shortcut && !this.isTextInputFocused()) {
      e.preventDefault();
      shortcut.handler();
    }
  }

  getKeyCombo(e) {
    const parts = [];
    if (e.ctrlKey || e.metaKey) parts.push('ctrl');
    if (e.shiftKey) parts.push('shift');
    if (e.altKey) parts.push('alt');
    parts.push(e.key.toLowerCase());
    return parts.join('+');
  }

  isTextInputFocused() {
    const el = document.activeElement;
    return el && (
      el.tagName === 'TEXTAREA' ||
      el.tagName === 'INPUT' ||
      el.contentEditable === 'true'
    );
  }

  showHelpModal() {
    this.helpVisible = !this.helpVisible;
  }

  getShortcuts() {
    return this.shortcuts;
  }
}
