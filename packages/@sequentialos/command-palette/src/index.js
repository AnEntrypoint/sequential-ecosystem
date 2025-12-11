import { initCommands } from './commands.js';
import { createPalette, renderCommandList, closePalette } from './ui.js';
import {
  formatJavaScript,
  selectAll,
  copySelection,
  clearEditor,
  getSaveButton
} from './helpers.js';

export class CommandPalette {
  constructor(editorId = 'codeEditor', appType = 'task') {
    this.editor = document.getElementById(editorId);
    this.appType = appType;
    this.isVisible = false;
    this.filterValue = '';
    this.selectedIndex = 0;
    this.commands = initCommands(appType);
    this.allCommands = this.commands;
  }

  init() {
    if (!this.editor) return;
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  toggle() {
    if (this.isVisible) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    createPalette((action, payload) => this.handleUIAction(action, payload));
    this.isVisible = true;
    const input = document.getElementById('commandPaletteInput');
    if (input) {
      input.focus();
    }
    this.updateCommandList();
  }

  close() {
    closePalette();
    this.isVisible = false;
    this.filterValue = '';
    this.selectedIndex = 0;
  }

  handleUIAction(action, payload) {
    switch (action) {
      case 'filter':
        this.filterValue = payload;
        this.selectedIndex = 0;
        this.updateCommandList();
        break;
      case 'close':
        this.close();
        break;
      case 'nav-down':
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.getFilteredCommands().length - 1);
        this.updateCommandList();
        break;
      case 'nav-up':
        this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
        this.updateCommandList();
        break;
      case 'execute-selected': {
        const filtered = this.getFilteredCommands();
        if (filtered[this.selectedIndex]) {
          this.executeCommand(filtered[this.selectedIndex]);
        }
        break;
      }
    }
  }

  getFilteredCommands() {
    if (!this.filterValue) {
      return this.commands;
    }
    const lowerFilter = this.filterValue.toLowerCase();
    return this.commands.filter(cmd =>
      cmd.label.toLowerCase().includes(lowerFilter) ||
      cmd.category.toLowerCase().includes(lowerFilter)
    );
  }

  updateCommandList() {
    const filtered = this.getFilteredCommands();
    renderCommandList(
      filtered,
      this.selectedIndex,
      (idx) => {
        if (filtered[idx]) {
          this.executeCommand(filtered[idx]);
        }
      },
      (idx) => {
        this.selectedIndex = idx;
        this.updateCommandList();
      }
    );
  }

  executeCommand(cmd) {
    this.close();
    try {
      this.invokeAction(cmd.action);
      if (window.showSuccess) {
        window.showSuccess(`✓ ${cmd.label}`);
      }
    } catch (err) {
      console.error('Command error:', err);
      if (window.showError) {
        window.showError(`Error executing: ${cmd.label}`);
      }
    }
  }

  invokeAction(action) {
    switch (action) {
      case 'save':
        this.save();
        break;
      case 'find':
        window.editorFeatures?.toggleFind?.();
        break;
      case 'replace':
        window.findReplace?.toggle?.();
        break;
      case 'goto-line':
        window.editorFeatures?.showGoToLine?.();
        break;
      case 'format':
        this.format();
        break;
      case 'select-all':
        selectAll(this.editor);
        break;
      case 'copy-selection':
        copySelection(this.editor);
        break;
      case 'clear-editor':
        clearEditor(this.editor);
        break;
      case 'undo':
        document.execCommand('undo');
        break;
      case 'redo':
        document.execCommand('redo');
        break;
      case 'run-task': {
        const btn = document.querySelector('[onclick*="runTask"]');
        if (btn) btn.click();
        break;
      }
      case 'show-templates':
        window.showTemplateGallery?.();
        break;
      case 'test-tool': {
        const btn = document.querySelector('[onclick*="testTool"]');
        if (btn) btn.click();
        break;
      }
      case 'help':
        window.editorFeatures?.showHelp?.();
        break;
    }
  }

  save() {
    const btn = getSaveButton();
    if (btn) btn.click();
  }

  format() {
    if (!this.editor) return;
    try {
      const code = this.editor.value;
      const formatted = formatJavaScript(code);
      this.editor.value = formatted;
      this.editor.dispatchEvent(new Event('input', { bubbles: true }));
      if (window.showSuccess) {
        window.showSuccess('✓ Code formatted');
      }
    } catch (err) {
      if (window.showError) {
        window.showError('Failed to format code');
      }
    }
  }
}

export function initCommandPalette(editorId = 'codeEditor', appType = 'task') {
  const palette = new CommandPalette(editorId, appType);
  window.commandPalette = palette;
  palette.init();
  return palette;
}
