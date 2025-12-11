import * as shortcuts from './editor-shortcuts.js';
import * as find from './editor-find.js';
import * as commands from './editor-commands.js';
import * as editing from './editor-editing.js';

export class EditorFeatures {
  constructor(editorId = 'codeEditor', options = {}) {
    this.editor = document.getElementById(editorId);
    this.shortcuts = new Map();
    this.findVisible = false;
    this.findIndex = -1;
    this.searchMatches = [];
    this.isFlowEditor = !this.editor;
    this.editorType = options.editorType || 'task';
    this.extraCommands = options.extraCommands || [];
  }

  init() {
    shortcuts.setupKeyboardShortcuts(this);
    if (!this.isFlowEditor) {
      find.injectFindUI(this);
    }
  }

  toggleFind() {
    find.toggleFind(this);
  }

  performSearch(query) {
    find.performSearch(this, query);
  }

  highlightMatch() {
    find.highlightMatch(this);
  }

  clearHighlights() {
    find.clearHighlights(this);
  }

  showCommandPalette() {
    commands.showCommandPalette(this);
  }

  executeCommand(cmdId) {
    commands.executeCommand(this, cmdId);
  }

  showGoToLine() {
    editing.showGoToLine(this);
  }

  toggleComment() {
    editing.toggleComment(this);
  }

  showKeyboardHelp() {
    editing.showKeyboardHelp(this);
  }
}
