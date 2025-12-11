export function showCommandPalette(editorInstance) {
  const commands = getCommands(editorInstance);
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    z-index: 10002;
    padding-top: 100px;
  `;

  const box = document.createElement('div');
  box.style.cssText = `
    background: #2a2a2a;
    color: #e0e0e0;
    border-radius: 8px;
    width: 90%;
    max-width: 600px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.6);
    overflow: hidden;
  `;

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Search commands...';
  input.style.cssText = `
    width: 100%;
    padding: 12px 16px;
    border: none;
    background: transparent;
    color: #e0e0e0;
    font-size: 16px;
    outline: none;
    border-bottom: 1px solid #3a3a3a;
    box-sizing: border-box;
  `;

  const list = document.createElement('div');
  list.style.cssText = `
    max-height: 400px;
    overflow-y: auto;
  `;

  const renderList = (filtered) => {
    list.innerHTML = filtered.map((cmd) => `
      <div style="
        padding: 12px 16px;
        cursor: pointer;
        border-bottom: 1px solid #3a3a3a;
        transition: background 0.2s;
      "
      onmouseover="this.style.background='#3a3a3a'"
      onmouseout="this.style.background='transparent'"
      onclick="window.editorFeaturesCallback('${cmd.id}')">
        <div style="font-weight: 600; color: #4ade80;">${cmd.name}</div>
        <div style="font-size: 12px; color: #999; margin-top: 4px;">${cmd.description}</div>
      </div>
    `).join('');
  };

  input.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = commands.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query)
    );
    renderList(filtered);
  });

  box.appendChild(input);
  box.appendChild(list);
  modal.appendChild(box);
  document.body.appendChild(modal);

  input.focus();
  renderList(commands);

  window.editorFeaturesCallback = (cmdId) => {
    modal.remove();
    editorInstance.executeCommand(cmdId);
  };

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') modal.remove();
  });
}

export function getCommands(editorInstance) {
  const getEditorLabel = () => {
    const labels = { task: 'Task', tool: 'Tool', flow: 'Tool' };
    return labels[editorInstance.editorType] || 'Editor';
  };

  const baseCommands = [
    { id: 'run', name: `▶ Run ${getEditorLabel()}`, description: `Execute the ${getEditorLabel().toLowerCase()} (F5)` },
    { id: 'save', name: '💾 Save', description: 'Save changes (Ctrl+S)' },
    { id: 'find', name: '🔍 Find', description: 'Find in code (Ctrl+F)' },
    { id: 'goto-line', name: '📍 Go to Line', description: 'Jump to line (Ctrl+G)' },
    { id: 'format', name: '🎨 Format Code', description: 'Format code (Ctrl+Shift+F)' }
  ];

  if (editorInstance.editorType === 'task') {
    baseCommands.push(
      { id: 'snippets', name: '📄 Insert Snippet', description: 'Insert code snippet (Ctrl+Shift+S)' },
      { id: 'templates', name: '📚 Template Gallery', description: 'Browse task templates (Ctrl+Shift+T)' }
    );
  }

  baseCommands.push({ id: 'help', name: '❓ Keyboard Help', description: 'Show keyboard shortcuts (Ctrl+?)' });
  return baseCommands.concat(editorInstance.extraCommands);
}

export function executeCommand(editorInstance, cmdId) {
  const handlers = {
    'run': () => {
      const runBtn = document.querySelector('button:contains("Run")') ||
                     document.querySelector('[data-action="run"]');
      if (runBtn) runBtn.click();
    },
    'save': () => window.saveTask && window.saveTask(),
    'find': () => editorInstance.toggleFind(),
    'goto-line': () => editorInstance.showGoToLine(),
    'format': () => window.formatCode && window.formatCode(),
    'snippets': () => window.showSnippetMenu && window.showSnippetMenu(),
    'templates': () => window.showTemplateGallery && window.showTemplateGallery(),
    'help': () => editorInstance.showKeyboardHelp()
  };

  const handler = handlers[cmdId];
  if (handler) handler();
}
