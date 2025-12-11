export function createPalette(onExecute) {
  let palette = document.getElementById('commandPalette');
  if (palette) return;

  palette = document.createElement('div');
  palette.id = 'commandPalette';
  palette.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #2a2a2a;
    border: 1px solid #3a3a3a;
    border-radius: 8px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.6);
    z-index: 10000;
    width: 90%;
    max-width: 600px;
    max-height: 70vh;
    display: flex;
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
  `;

  const input = document.createElement('input');
  input.id = 'commandPaletteInput';
  input.type = 'text';
  input.placeholder = 'Type command name...';
  input.style.cssText = `
    background: #2a2a2a;
    border: none;
    border-bottom: 1px solid #3a3a3a;
    color: #e0e0e0;
    padding: 16px;
    font-size: 16px;
    outline: none;
  `;

  input.addEventListener('input', (e) => {
    onExecute('filter', e.target.value);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      onExecute('close');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      onExecute('nav-down');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      onExecute('nav-up');
    } else if (e.key === 'Enter') {
      e.preventDefault();
      onExecute('execute-selected');
    }
  });

  const list = document.createElement('div');
  list.id = 'commandList';
  list.style.cssText = `
    overflow-y: auto;
    flex: 1;
    min-height: 100px;
  `;

  palette.appendChild(input);
  palette.appendChild(list);
  document.body.appendChild(palette);

  return { palette, input, list };
}

export function renderCommandList(commands, selectedIndex, onSelect, onHover) {
  const list = document.getElementById('commandList');
  if (!list) return;

  list.innerHTML = commands.map((cmd, idx) => `
    <div class="command-item" data-index="${idx}" style="
      padding: 12px 16px;
      border-bottom: 1px solid #3a3a3a;
      cursor: pointer;
      background: ${idx === selectedIndex ? '#3a3a3a' : 'transparent'};
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: background 0.15s;
    ">
      <div style="display: flex; gap: 12px; align-items: center; flex: 1;">
        <span style="font-size: 18px;">${cmd.icon}</span>
        <div>
          <div style="color: #e0e0e0; font-weight: 500;">${cmd.label}</div>
          <div style="color: #666; font-size: 11px;">${cmd.category}</div>
        </div>
      </div>
      ${cmd.hotkey ? `<div style="color: #666; font-size: 11px; font-family: monospace; margin-left: 16px;">${cmd.hotkey}</div>` : ''}
    </div>
  `).join('');

  list.querySelectorAll('.command-item').forEach((item, idx) => {
    item.addEventListener('click', () => onSelect(idx));
    item.addEventListener('mouseover', () => onHover(idx));
  });

  const selected = list.querySelector(`[data-index="${selectedIndex}"]`);
  if (selected) {
    selected.scrollIntoView({ block: 'nearest' });
  }
}

export function closePalette() {
  const palette = document.getElementById('commandPalette');
  if (palette) {
    palette.remove();
  }
}
