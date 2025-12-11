export function setupKeyboardShortcuts(editorInstance) {
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'k') {
        e.preventDefault();
        editorInstance.showCommandPalette();
      } else if (e.key === 'f') {
        e.preventDefault();
        editorInstance.toggleFind();
      } else if (e.key === 'g') {
        e.preventDefault();
        editorInstance.showGoToLine();
      } else if (e.key === '/') {
        e.preventDefault();
        editorInstance.toggleComment();
      } else if (e.shiftKey && e.key === 'T') {
        e.preventDefault();
        const templateCmd = editorInstance.editorType === 'flow' ? 'showFlowTemplateGallery' : 'showTemplateGallery';
        window[templateCmd]?.();
      }
    }
  });
}
