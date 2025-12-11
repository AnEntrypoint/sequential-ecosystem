export function showGoToLine(editorInstance) {
  const input = prompt('Go to line (1-' + (editorInstance.editor.value.split('\n').length) + '):');
  if (!input) return;

  const lineNum = parseInt(input, 10);
  if (isNaN(lineNum)) return;

  const lines = editorInstance.editor.value.split('\n');
  let pos = 0;

  for (let i = 0; i < Math.min(lineNum - 1, lines.length); i++) {
    pos += lines[i].length + 1;
  }

  editorInstance.editor.focus();
  editorInstance.editor.setSelectionRange(pos, pos);

  const lineHeight = parseInt(window.getComputedStyle(editorInstance.editor).lineHeight);
  editorInstance.editor.scrollTop = Math.max(0, (lineNum - 5) * lineHeight);
}

export function toggleComment(editorInstance) {
  const start = editorInstance.editor.selectionStart;
  const end = editorInstance.editor.selectionEnd;
  const code = editorInstance.editor.value;

  const beforeStart = code.lastIndexOf('\n', start - 1) + 1;
  const afterEnd = code.indexOf('\n', end);
  const afterEndPos = afterEnd === -1 ? code.length : afterEnd;

  const selectedLines = code.substring(beforeStart, afterEndPos);
  const isCommented = selectedLines.split('\n').some(line =>
    line.trim().startsWith('//')
  );

  const newSelectedLines = selectedLines.split('\n').map(line => {
    if (isCommented) {
      return line.replace(/^\s*\/\/\s?/, '');
    } else {
      const match = line.match(/^(\s*)/);
      return (match ? match[1] : '') + '// ' + line.trim();
    }
  }).join('\n');

  const newCode = code.substring(0, beforeStart) +
                  newSelectedLines +
                  code.substring(afterEndPos);

  editorInstance.editor.value = newCode;
  editorInstance.editor.setSelectionRange(beforeStart, beforeStart + newSelectedLines.length);
}

export function showKeyboardHelp(editorInstance) {
  const getEditorLabel = () => {
    const labels = { task: 'Task', tool: 'Tool', flow: 'Tool' };
    return labels[editorInstance.editorType] || 'Editor';
  };

  const help = `
${getEditorLabel().toUpperCase()} EDITOR KEYBOARD SHORTCUTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ctrl+K        Command Palette
Ctrl+F        Find in Code
Ctrl+G        Go to Line
Ctrl+/        Toggle Comment
${editorInstance.editorType === 'task' ? 'Ctrl+Shift+T  Template Gallery' : ''}
F5            Run ${getEditorLabel()}
Ctrl+S        Save
${editorInstance.editorType === 'task' ? 'Ctrl+Shift+S  Insert Snippet' : ''}
Ctrl+Shift+F  Format Code
Ctrl+?        This Help
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `;
  alert(help);
}
