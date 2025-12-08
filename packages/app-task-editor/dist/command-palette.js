export class CommandPalette {
  constructor(editorId = 'codeEditor', appType = 'task') {
    this.editor = document.getElementById(editorId);
    this.appType = appType;
    this.isVisible = false;
    this.filterValue = '';
    this.selectedIndex = 0;
    this.commands = this.initCommands();
  }

  initCommands() {
    const baseCommands = [
      {
        id: 'save',
        label: 'Save',
        category: 'File',
        hotkey: 'Ctrl+S',
        action: () => this.save(),
        icon: '💾'
      },
      {
        id: 'find',
        label: 'Find',
        category: 'Edit',
        hotkey: 'Ctrl+F',
        action: () => window.editorFeatures?.toggleFind?.(),
        icon: '🔍'
      },
      {
        id: 'replace',
        label: 'Find & Replace',
        category: 'Edit',
        hotkey: 'Ctrl+H',
        action: () => window.findReplace?.toggle?.(),
        icon: '🔄'
      },
      {
        id: 'goto-line',
        label: 'Go to Line',
        category: 'Navigate',
        hotkey: 'Ctrl+G',
        action: () => window.editorFeatures?.showGoToLine?.(),
        icon: '↗'
      },
      {
        id: 'format',
        label: 'Format Code',
        category: 'Code',
        action: () => this.formatCode(),
        icon: '✨'
      },
      {
        id: 'select-all',
        label: 'Select All',
        category: 'Edit',
        hotkey: 'Ctrl+A',
        action: () => this.selectAll(),
        icon: '✓'
      },
      {
        id: 'copy-selection',
        label: 'Copy Selection',
        category: 'Edit',
        action: () => this.copySelection(),
        icon: '📋'
      },
      {
        id: 'clear-editor',
        label: 'Clear Editor',
        category: 'Edit',
        action: () => this.clearEditor(),
        icon: '🗑'
      },
      {
        id: 'undo',
        label: 'Undo',
        category: 'Edit',
        hotkey: 'Ctrl+Z',
        action: () => document.execCommand('undo'),
        icon: '↶'
      },
      {
        id: 'redo',
        label: 'Redo',
        category: 'Edit',
        hotkey: 'Ctrl+Y',
        action: () => document.execCommand('redo'),
        icon: '↷'
      }
    ];

    if (this.appType === 'task') {
      baseCommands.push(
        {
          id: 'run-task',
          label: 'Run Task',
          category: 'Task',
          action: () => {
            const btn = document.querySelector('[onclick*="runTask"]');
            if (btn) btn.click();
          },
          icon: '▶'
        },
        {
          id: 'show-templates',
          label: 'Show Templates',
          category: 'Task',
          hotkey: 'Ctrl+Shift+T',
          action: () => window.showTemplateGallery?.(),
          icon: '📝'
        }
      );
    } else if (this.appType === 'tool') {
      baseCommands.push(
        {
          id: 'test-tool',
          label: 'Test Tool',
          category: 'Tool',
          action: () => {
            const btn = document.querySelector('[onclick*="testTool"]');
            if (btn) btn.click();
          },
          icon: '✓'
        }
      );
    }

    baseCommands.push(
      {
        id: 'help',
        label: 'Keyboard Shortcuts',
        category: 'Help',
        hotkey: 'Ctrl+?',
        action: () => window.editorFeatures?.showHelp?.(),
        icon: '❓'
      }
    );

    return baseCommands;
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
    this.createPalette();
    this.isVisible = true;
    const input = document.getElementById('commandPaletteInput');
    if (input) {
      input.focus();
    }
  }

  close() {
    const palette = document.getElementById('commandPalette');
    if (palette) {
      palette.remove();
    }
    this.isVisible = false;
    this.filterValue = '';
    this.selectedIndex = 0;
  }

  createPalette() {
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
      this.filterValue = e.target.value;
      this.selectedIndex = 0;
      this.updateCommandList();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.close();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.getFilteredCommands().length - 1);
        this.updateCommandList();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
        this.updateCommandList();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const filtered = this.getFilteredCommands();
        if (filtered[this.selectedIndex]) {
          this.executeCommand(filtered[this.selectedIndex]);
        }
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

    this.updateCommandList();
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
    const list = document.getElementById('commandList');
    if (!list) return;

    const filtered = this.getFilteredCommands();
    list.innerHTML = filtered.map((cmd, idx) => `
      <div class="command-item" data-index="${idx}" style="
        padding: 12px 16px;
        border-bottom: 1px solid #3a3a3a;
        cursor: pointer;
        background: ${idx === this.selectedIndex ? '#3a3a3a' : 'transparent'};
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
      item.addEventListener('click', () => {
        const filtered = this.getFilteredCommands();
        if (filtered[idx]) {
          this.executeCommand(filtered[idx]);
        }
      });
      item.addEventListener('mouseover', () => {
        this.selectedIndex = idx;
        this.updateCommandList();
      });
    });

    const selected = list.querySelector(`[data-index="${this.selectedIndex}"]`);
    if (selected) {
      selected.scrollIntoView({ block: 'nearest' });
    }
  }

  executeCommand(cmd) {
    this.close();
    try {
      cmd.action();
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

  save() {
    const btn = document.querySelector('[onclick*="saveTask"]') ||
                document.querySelector('[onclick*="saveTool"]') ||
                document.querySelector('button:has-text("Save")');
    if (btn) btn.click();
  }

  formatCode() {
    if (!this.editor) return;
    try {
      const code = this.editor.value;
      const formatted = this.formatJavaScript(code);
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

  formatJavaScript(code) {
    let formatted = code
      .replace(/;(?=\S)/g, ';\n')
      .replace(/\{(?=\S)/g, ' {\n')
      .replace(/\}(?=\S)/g, '}\n')
      .split('\n')
      .map(line => {
        const trimmed = line.trim();
        if (!trimmed) return '';
        const indent = (line.match(/^(\s*)/)[1].length / 2) * 2;
        return ' '.repeat(Math.max(0, indent)) + trimmed;
      })
      .join('\n');

    return formatted;
  }

  selectAll() {
    if (this.editor) {
      this.editor.select();
    }
  }

  copySelection() {
    if (this.editor) {
      const selected = this.editor.value.substring(
        this.editor.selectionStart,
        this.editor.selectionEnd
      );
      if (selected) {
        navigator.clipboard.writeText(selected);
        if (window.showSuccess) {
          window.showSuccess('✓ Copied to clipboard');
        }
      }
    }
  }

  clearEditor() {
    if (this.editor && confirm('Clear all code? This cannot be undone.')) {
      this.editor.value = '';
      this.editor.dispatchEvent(new Event('input', { bubbles: true }));
      if (window.showSuccess) {
        window.showSuccess('✓ Editor cleared');
      }
    }
  }
}

window.initCommandPalette = function(editorId = 'codeEditor', appType = 'task') {
  const palette = new CommandPalette(editorId, appType);
  window.commandPalette = palette;
  palette.init();
};
