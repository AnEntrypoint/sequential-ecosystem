import { fuzzyMatch } from './scoring.js';
import { showDropdown, updateDropdownSelection, closeDropdown } from './dropdown.js';

export class ToolAutocomplete {
  constructor(editorId = 'codeEditor') {
    this.editor = document.getElementById(editorId);
    this.tools = [];
    this.dropdownVisible = false;
    this.selectedIndex = 0;
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
      }
    } catch (err) {
      console.error('Failed to fetch tools:', err);
    }
  }

  init() {
    if (!this.editor) return;

    this.editor.addEventListener('input', (e) => this.handleInput(e));
    this.editor.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('click', (e) => {
      if (e.target !== this.editor && !e.target.closest('#tool-autocomplete-dropdown')) {
        this.closeDropdown();
      }
    });
  }

  handleInput(e) {
    const code = this.editor.value;
    const cursorPos = this.editor.selectionStart;

    const match = this.findToolCall(code, cursorPos);

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
    if (!this.dropdownVisible) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      this.closeDropdown();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.selectedIndex = Math.min(this.selectedIndex + 1, this.currentMatches.length - 1);
      this.updateSelection();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
      this.updateSelection();
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      if (this.currentMatches[this.selectedIndex]) {
        this.insertTool(this.currentMatches[this.selectedIndex]);
      }
    }
  }

  findToolCall(code, cursorPos) {
    const beforeCursor = code.substring(0, cursorPos);
    const callPattern = /__callHostTool__\s*\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]*)/;
    const match = beforeCursor.match(callPattern);

    if (match) {
      return {
        appId: match[1],
        partial: match[2],
        start: beforeCursor.lastIndexOf(match[0]) + match[0].length - match[2].length,
        end: cursorPos
      };
    }

    return null;
  }

  showDropdown(tools) {
    this.currentMatches = tools;
    this.selectedIndex = 0;

    const dropdown = showDropdown(this.editor, tools, this.currentMatch, (tool) => this.insertTool(tool));
    this.dropdownVisible = true;

    dropdown.querySelectorAll('.autocomplete-item').forEach(item => {
      item.addEventListener('mouseover', (e) => {
        this.selectedIndex = parseInt(e.currentTarget.dataset.index);
        this.updateSelection();
      });
    });
  }

  updateSelection() {
    const dropdown = document.getElementById('tool-autocomplete-dropdown');
    updateDropdownSelection(dropdown, this.selectedIndex);
  }

  insertTool(tool) {
    if (!this.currentMatch) return;

    const { start, end } = this.currentMatch;
    const code = this.editor.value;

    const newCode = code.substring(0, start) + tool.name + code.substring(end);
    this.editor.value = newCode;

    const newPos = start + tool.name.length;
    this.editor.setSelectionRange(newPos, newPos);

    const event = new Event('input', { bubbles: true });
    this.editor.dispatchEvent(event);

    this.closeDropdown();

    if (window.showSuccess) {
      window.showSuccess(`✓ Inserted tool: ${tool.name}`);
    }
  }

  closeDropdown() {
    closeDropdown();
    this.dropdownVisible = false;
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
