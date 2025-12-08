export class ToolAutocomplete {
  constructor(editorId = 'codeEditor') {
    this.editor = document.getElementById(editorId);
    this.tools = [];
    this.dropdownVisible = false;
    this.selectedIndex = 0;
    this.currentMatch = null;
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

    // Find the current word being typed (after __callHostTool__)
    const match = this.findToolCall(code, cursorPos);

    if (match) {
      this.currentMatch = match;
      const filtered = this.fuzzyMatch(match.partial);
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
      this.updateDropdownSelection();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
      this.updateDropdownSelection();
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      if (this.currentMatches[this.selectedIndex]) {
        this.insertTool(this.currentMatches[this.selectedIndex]);
      }
    }
  }

  findToolCall(code, cursorPos) {
    // Look for pattern: __callHostTool__('app', '...')
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

  fuzzyMatch(query) {
    if (!query) return this.tools.slice(0, 10);

    const scored = this.tools.map(tool => ({
      tool,
      score: this.calculateScore(query, tool.name)
    })).filter(item => item.score > 0)
     .sort((a, b) => b.score - a.score)
     .slice(0, 10);

    return scored.map(item => item.tool);
  }

  calculateScore(query, name) {
    if (!query) return 1;

    const lowerName = name.toLowerCase();
    const lowerQuery = query.toLowerCase();

    // Exact match
    if (lowerName === lowerQuery) return 100;

    // Starts with
    if (lowerName.startsWith(lowerQuery)) return 50;

    // Contains
    if (lowerName.includes(lowerQuery)) return 25;

    // Fuzzy match
    let score = 0;
    let queryIdx = 0;
    for (let i = 0; i < lowerName.length && queryIdx < lowerQuery.length; i++) {
      if (lowerName[i] === lowerQuery[queryIdx]) {
        score += 1;
        queryIdx++;
      }
    }

    return queryIdx === lowerQuery.length ? score : 0;
  }

  showDropdown(tools) {
    this.currentMatches = tools;
    this.selectedIndex = 0;

    let dropdown = document.getElementById('tool-autocomplete-dropdown');
    if (!dropdown) {
      dropdown = document.createElement('div');
      dropdown.id = 'tool-autocomplete-dropdown';
      document.body.appendChild(dropdown);
    }

    dropdown.style.cssText = `
      position: fixed;
      background: #2a2a2a;
      border: 1px solid #3a3a3a;
      border-radius: 6px;
      max-width: 500px;
      max-height: 300px;
      overflow-y: auto;
      z-index: 10000;
      box-shadow: 0 8px 16px rgba(0,0,0,0.3);
    `;

    const editorRect = this.editor.getBoundingClientRect();
    const scrollTop = this.editor.scrollTop;
    const lineHeight = parseInt(window.getComputedStyle(this.editor).lineHeight);
    const cursorLine = (this.editor.value.substring(0, this.editor.selectionStart).match(/\n/g) || []).length;

    dropdown.style.left = editorRect.left + 'px';
    dropdown.style.top = (editorRect.top + (cursorLine + 1) * lineHeight - scrollTop) + 'px';

    dropdown.innerHTML = tools.map((tool, idx) => `
      <div class="autocomplete-item" data-index="${idx}" style="
        padding: 12px 16px;
        cursor: pointer;
        border-bottom: 1px solid #3a3a3a;
        transition: background 0.2s;
        background: ${idx === 0 ? '#3a3a3a' : 'transparent'};
      ">
        <div style="color: #4ade80; font-weight: 600; font-size: 13px;">${this.highlightMatch(tool.name, this.currentMatch.partial)}</div>
        <div style="color: #999; font-size: 11px; margin-top: 4px;">
          ${tool.description || 'No description'}
        </div>
        ${tool.parameters ? `
          <div style="color: #64b5f6; font-size: 11px; margin-top: 6px; font-family: monospace;">
            ${tool.parameters.slice(0, 3).join(', ')}${tool.parameters.length > 3 ? '...' : ''}
          </div>
        ` : ''}
      </div>
    `).join('');

    dropdown.querySelectorAll('.autocomplete-item').forEach(item => {
      item.addEventListener('click', (e) => {
        this.insertTool(tools[parseInt(e.currentTarget.dataset.index)]);
      });
      item.addEventListener('mouseover', (e) => {
        this.selectedIndex = parseInt(e.currentTarget.dataset.index);
        this.updateDropdownSelection();
      });
    });

    this.dropdownVisible = true;
  }

  updateDropdownSelection() {
    const dropdown = document.getElementById('tool-autocomplete-dropdown');
    if (!dropdown) return;

    dropdown.querySelectorAll('.autocomplete-item').forEach((item, idx) => {
      if (idx === this.selectedIndex) {
        item.style.background = '#3a3a3a';
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.style.background = 'transparent';
      }
    });
  }

  highlightMatch(text, query) {
    if (!query) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span style="background: #4ade80; color: #1a1a1a; font-weight: 700;">$1</span>');
  }

  insertTool(tool) {
    if (!this.currentMatch) return;

    const { start, end } = this.currentMatch;
    const code = this.editor.value;

    // Replace the partial tool name with the full tool name
    const newCode = code.substring(0, start) + tool.name + code.substring(end);
    this.editor.value = newCode;

    const newPos = start + tool.name.length;
    this.editor.setSelectionRange(newPos, newPos);

    // Trigger input event for syntax highlighting
    const event = new Event('input', { bubbles: true });
    this.editor.dispatchEvent(event);

    this.closeDropdown();

    if (window.showSuccess) {
      window.showSuccess(`✓ Inserted tool: ${tool.name}`);
    }
  }

  closeDropdown() {
    const dropdown = document.getElementById('tool-autocomplete-dropdown');
    if (dropdown) {
      dropdown.remove();
    }
    this.dropdownVisible = false;
    this.currentMatches = [];
  }
}

window.initToolAutocomplete = function(editorId = 'codeEditor') {
  const autocomplete = new ToolAutocomplete(editorId);
  window.toolAutocomplete = autocomplete;
  autocomplete.init();
};
