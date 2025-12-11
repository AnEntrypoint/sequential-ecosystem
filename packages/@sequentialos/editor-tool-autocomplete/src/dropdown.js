import { highlightMatch } from './scoring.js';

export function showDropdown(editor, tools, currentMatch, onSelect) {
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

export function updateDropdownSelection(dropdown, selectedIndex) {
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

export function closeDropdown() {
  const dropdown = document.getElementById('tool-autocomplete-dropdown');
  if (dropdown) {
    dropdown.remove();
  }
}
