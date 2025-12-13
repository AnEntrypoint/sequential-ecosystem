export function formatJavaScript(code) {
  const formatted = code
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

export function selectAll(editor) {
  if (editor) {
    editor.select();
  }
}

export function copySelection(editor) {
  if (editor) {
    const selected = editor.value.substring(
      editor.selectionStart,
      editor.selectionEnd
    );
    if (selected) {
      navigator.clipboard.writeText(selected);
      if (window.showSuccess) {
        window.showSuccess('✓ Copied to clipboard');
      }
    }
  }
}

export function clearEditor(editor) {
  if (editor && confirm('Clear all code? This cannot be undone.')) {
    editor.value = '';
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    if (window.showSuccess) {
      window.showSuccess('✓ Editor cleared');
    }
  }
}

export function getSaveButton() {
  return document.querySelector('[onclick*="saveTask"]') ||
         document.querySelector('[onclick*="saveTool"]') ||
         document.querySelector('button:has-text("Save")');
}
