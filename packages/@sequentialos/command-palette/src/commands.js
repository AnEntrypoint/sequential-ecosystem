export function initCommands(appType) {
  const baseCommands = [
    {
      id: 'save',
      label: 'Save',
      category: 'File',
      hotkey: 'Ctrl+S',
      action: 'save',
      icon: '💾'
    },
    {
      id: 'find',
      label: 'Find',
      category: 'Edit',
      hotkey: 'Ctrl+F',
      action: 'find',
      icon: '🔍'
    },
    {
      id: 'replace',
      label: 'Find & Replace',
      category: 'Edit',
      hotkey: 'Ctrl+H',
      action: 'replace',
      icon: '🔄'
    },
    {
      id: 'goto-line',
      label: 'Go to Line',
      category: 'Navigate',
      hotkey: 'Ctrl+G',
      action: 'goto-line',
      icon: '↗'
    },
    {
      id: 'format',
      label: 'Format Code',
      category: 'Code',
      action: 'format',
      icon: '✨'
    },
    {
      id: 'select-all',
      label: 'Select All',
      category: 'Edit',
      hotkey: 'Ctrl+A',
      action: 'select-all',
      icon: '✓'
    },
    {
      id: 'copy-selection',
      label: 'Copy Selection',
      category: 'Edit',
      action: 'copy-selection',
      icon: '📋'
    },
    {
      id: 'clear-editor',
      label: 'Clear Editor',
      category: 'Edit',
      action: 'clear-editor',
      icon: '🗑'
    },
    {
      id: 'undo',
      label: 'Undo',
      category: 'Edit',
      hotkey: 'Ctrl+Z',
      action: 'undo',
      icon: '↶'
    },
    {
      id: 'redo',
      label: 'Redo',
      category: 'Edit',
      hotkey: 'Ctrl+Y',
      action: 'redo',
      icon: '↷'
    }
  ];

  if (appType === 'task') {
    baseCommands.push(
      {
        id: 'run-task',
        label: 'Run Task',
        category: 'Task',
        action: 'run-task',
        icon: '▶'
      },
      {
        id: 'show-templates',
        label: 'Show Templates',
        category: 'Task',
        hotkey: 'Ctrl+Shift+T',
        action: 'show-templates',
        icon: '📝'
      }
    );
  } else if (appType === 'tool') {
    baseCommands.push(
      {
        id: 'test-tool',
        label: 'Test Tool',
        category: 'Tool',
        action: 'test-tool',
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
      action: 'help',
      icon: '❓'
    }
  );

  return baseCommands;
}
