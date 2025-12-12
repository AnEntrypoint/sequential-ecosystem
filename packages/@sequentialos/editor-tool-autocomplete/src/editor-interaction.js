/**
 * editor-interaction.js - Editor input and keyboard handling
 *
 * Manages editor events and keyboard interactions for autocomplete
 */

export class EditorInteraction {
  constructor(editor) {
    this.editor = editor;
    this.dropdownVisible = false;
    this.selectedIndex = 0;
  }

  setupEventListeners(inputHandler, keydownHandler) {
    if (!this.editor) return;

    this.editor.addEventListener('input', (e) => inputHandler(e));
    this.editor.addEventListener('keydown', (e) => keydownHandler(e));
    document.addEventListener('click', (e) => {
      if (e.target !== this.editor && !e.target.closest('#tool-autocomplete-dropdown')) {
        this.closeDropdown();
      }
    });
  }

  handleKeyDown(e, callbacks) {
    if (!this.dropdownVisible) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      this.closeDropdown();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.selectedIndex = Math.min(this.selectedIndex + 1, callbacks.matchCount - 1);
      callbacks.onUpdateSelection();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
      callbacks.onUpdateSelection();
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      if (callbacks.currentMatch && callbacks.currentMatch[this.selectedIndex]) {
        callbacks.onSelectTool(callbacks.currentMatch[this.selectedIndex]);
      }
    }
  }

  getEditorState() {
    return {
      value: this.editor.value,
      cursorPos: this.editor.selectionStart
    };
  }

  setEditorValue(newCode) {
    this.editor.value = newCode;
  }

  setSelection(start, end) {
    this.editor.setSelectionRange(start, end);
  }

  setCursorPosition(pos) {
    this.editor.setSelectionRange(pos, pos);
  }

  dispatchInputEvent() {
    const event = new Event('input', { bubbles: true });
    this.editor.dispatchEvent(event);
  }

  setDropdownVisible(visible) {
    this.dropdownVisible = visible;
  }

  closeDropdown() {
    this.dropdownVisible = false;
    this.selectedIndex = 0;
  }

  getSelectedIndex() {
    return this.selectedIndex;
  }

  setSelectedIndex(index) {
    this.selectedIndex = index;
  }

  isDropdownVisible() {
    return this.dropdownVisible;
  }
}
