import { fuzzyMatch } from './scoring.js';
import { showDropdown, updateDropdownSelection, closeDropdown } from './dropdown.js';
import { ToolFinder } from './tool-finder.js';
import { EditorInteraction } from './editor-interaction.js';

export class ToolAutocomplete {
  constructor(editorId = 'codeEditor') {
    this.editor = document.getElementById(editorId);
    this.tools = [];
    this.toolFinder = new ToolFinder([]);
    this.editorInteraction = new EditorInteraction(this.editor);
    this.currentMatch = null;
    this.currentMatches = [];
    this.fetchTools();
  }

  async fetchTools() {
    try {
      const response = await fetch('/api/tools');
      const { success, data } = await response.json();
      if (success && data.tools) {
        this.tools = data.tools;
        this.toolFinder.setTools(data.tools);
      }
    } catch (err) {
      console.error('Failed to fetch tools:', err);
    }
  }

  init() {
    if (!this.editor) return;
    this.editorInteraction.setupEventListeners(
      (e) => this.handleInput(e),
      (e) => this.handleKeyDown(e)
    );
  }

  handleInput(e) {
    const { value, cursorPos } = this.editorInteraction.getEditorState();

    const match = this.toolFinder.findToolCall(value, cursorPos);

    if (match) {
      this.currentMatch = match;
      const filtered = fuzzyMatch(this.tools, match.partial);
      if (filtered.length > 0) {
        this.showDropdown(filtered);
      } else {
        this.closeDropdown();
      }
    } else {
      this.closeDropdown();
    }
  }

  handleKeyDown(e) {
    if (!this.editorInteraction.isDropdownVisible()) return;

    this.editorInteraction.handleKeyDown(e, {
      matchCount: this.currentMatches.length,
      currentMatch: this.currentMatches,
      onUpdateSelection: () => this.updateSelection(),
      onSelectTool: (tool) => this.insertTool(tool)
    });
  }

  showDropdown(tools) {
    this.currentMatches = tools;
    this.editorInteraction.setSelectedIndex(0);

    const dropdown = showDropdown(this.editor, tools, this.currentMatch, (tool) => this.insertTool(tool));
    this.editorInteraction.setDropdownVisible(true);

    dropdown.querySelectorAll('.autocomplete-item').forEach(item => {
      item.addEventListener('mouseover', (e) => {
        this.editorInteraction.setSelectedIndex(parseInt(e.currentTarget.dataset.index));
        this.updateSelection();
      });
    });
  }

  updateSelection() {
    const dropdown = document.getElementById('tool-autocomplete-dropdown');
    updateDropdownSelection(dropdown, this.editorInteraction.getSelectedIndex());
  }

  insertTool(tool) {
    if (!this.currentMatch) return;

    const { start, end } = this.currentMatch;
    const code = this.editor.value;

    const newCode = code.substring(0, start) + tool.name + code.substring(end);
    this.editorInteraction.setEditorValue(newCode);

    const newPos = start + tool.name.length;
    this.editorInteraction.setCursorPosition(newPos);

    this.editorInteraction.dispatchInputEvent();

    this.closeDropdown();

    if (window.showSuccess) {
      window.showSuccess(`✓ Inserted tool: ${tool.name}`);
    }
  }

  closeDropdown() {
    closeDropdown();
    this.editorInteraction.closeDropdown();
    this.currentMatches = [];
  }
}

export function initToolAutocomplete(editorId = 'codeEditor') {
  const autocomplete = new ToolAutocomplete(editorId);
  window.toolAutocomplete = autocomplete;
  autocomplete.init();
  return autocomplete;
}

if (typeof window !== 'undefined') {
  window.initToolAutocomplete = initToolAutocomplete;
}
