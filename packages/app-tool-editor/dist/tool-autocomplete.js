
// Consolidated from @sequentialos/editor-tool-autocomplete

function fuzzyMatch(tools, query) {
  if (!query) return tools.slice(0, 10);

  const scored = tools.map(tool => ({
    tool,
    score: calculateScore(query, tool.name)
  })).filter(item => item.score > 0)
   .sort((a, b) => b.score - a.score)
   .slice(0, 10);

  return scored.map(item => item.tool);
}

function calculateScore(query, name) {
  if (!query) return 1;

  const lowerName = name.toLowerCase();
  const lowerQuery = query.toLowerCase();

  if (lowerName === lowerQuery) return 100;
  if (lowerName.startsWith(lowerQuery)) return 50;
  if (lowerName.includes(lowerQuery)) return 25;

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

function highlightMatch(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<span style="background: #4ade80; color: #1a1a1a; font-weight: 700;">$1</span>');
}




function showDropdown(editor, tools, currentMatch, onSelect) {
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

  const editorRect = editor.getBoundingClientRect();
  const scrollTop = editor.scrollTop;
  const lineHeight = parseInt(window.getComputedStyle(editor).lineHeight);
  const cursorLine = (editor.value.substring(0, editor.selectionStart).match(/\n/g) || []).length;

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
      <div style="color: #4ade80; font-weight: 600; font-size: 13px;">${highlightMatch(tool.name, currentMatch.partial)}</div>
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
      onSelect(tools[parseInt(e.currentTarget.dataset.index)]);
    });
  });

  return dropdown;
}

function updateDropdownSelection(dropdown, selectedIndex) {
  if (!dropdown) return;

  dropdown.querySelectorAll('.autocomplete-item').forEach((item, idx) => {
    if (idx === selectedIndex) {
      item.style.background = '#3a3a3a';
      item.scrollIntoView({ block: 'nearest' });
    } else {
      item.style.background = 'transparent';
    }
  });
}

function closeDropdown() {
  const dropdown = document.getElementById('tool-autocomplete-dropdown');
  if (dropdown) {
    dropdown.remove();
  }
}





class ToolAutocomplete {
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

function initToolAutocomplete(editorId = 'codeEditor') {
  const autocomplete = new ToolAutocomplete(editorId);
  window.toolAutocomplete = autocomplete;
  autocomplete.init();
  return autocomplete;
}

if (typeof window !== 'undefined') {
  window.initToolAutocomplete = initToolAutocomplete;
}


if (typeof window !== 'undefined') {
  window.ToolAutocomplete = ToolAutocomplete;
}

export { ToolAutocomplete };
