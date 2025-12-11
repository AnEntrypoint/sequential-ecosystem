/**
 * index.js - CommandPalette Facade
 *
 * Delegates to focused modules:
 * - command-filter: Search and filter commands
 * - command-navigator: Selection and navigation
 * - action-handler: Execute command actions
 * - command-executor: Run commands with feedback
 */

import { initCommands } from './commands.js';
import { createPalette, renderCommandList, closePalette } from './ui.js';
import { createCommandFilter } from './command-filter.js';
import { createCommandNavigator } from './command-navigator.js';
import { createActionHandler } from './action-handler.js';
import { createCommandExecutor } from './command-executor.js';

export class CommandPalette {
  constructor(editorId = 'codeEditor', appType = 'task') {
    this.editor = document.getElementById(editorId);
    this.appType = appType;
    this.isVisible = false;
    this.commands = initCommands(appType);

    // Initialize modules
    this.filter = createCommandFilter(this.commands);
    this.navigator = createCommandNavigator(() => this.filter.filter(this.filter.filterValue));
    this.actionHandler = createActionHandler(this.editor);
    this.executor = createCommandExecutor(this.actionHandler);
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
    this.filter.setFilter('');
    this.navigator.resetSelection();
  }

  handleUIAction(action, payload) {
    switch (action) {
      case 'filter':
        this.filter.setFilter(payload);
        this.navigator.resetSelection();
        this.updateCommandList();
        break;
      case 'close':
        this.close();
        break;
      case 'nav-down':
        this.navigator.selectNext();
        this.updateCommandList();
        break;
      case 'nav-up':
        this.navigator.selectPrevious();
        this.updateCommandList();
        break;
      case 'execute-selected': {
        const selected = this.navigator.getSelectedCommand();
        if (selected) {
          this.executeCommand(selected);
        }
        break;
      }
    }
  }

  getFilteredCommands() {
    return this.filter.filter(this.filter.filterValue);
  }

  updateCommandList() {
    const filtered = this.getFilteredCommands();
    renderCommandList(
      filtered,
      this.navigator.selectedIndex,
      (idx) => {
        if (filtered[idx]) {
          this.executeCommand(filtered[idx]);
        }
      },
      (idx) => {
        this.navigator.selectByIndex(idx);
        this.updateCommandList();
      }
    );
  }

  executeCommand(cmd) {
    this.close();
    this.executor.execute(cmd);
  }
}

export function initCommandPalette(editorId = 'codeEditor', appType = 'task') {
  const palette = new CommandPalette(editorId, appType);
  window.commandPalette = palette;
  palette.init();
  return palette;
}
