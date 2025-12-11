export function createHintsContainer(editor) {
  let container = document.getElementById('validation-hints-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'validation-hints-container';
    container.style.cssText = `
      position: absolute;
      top: 0;
      right: 0;
      width: 300px;
      max-height: 300px;
      overflow-y: auto;
      background: #2a2a2a;
      border-left: 1px solid #3a3a3a;
      padding: 0;
      z-index: 100;
      font-size: 12px;
    `;
    const editorContainer = editor.parentElement;
    if (editorContainer) {
      editorContainer.style.position = 'relative';
      editorContainer.appendChild(container);
    }
  }
  return container;
}

export function renderHints(hints) {
  const container = document.getElementById('validation-hints-container');
  if (!container) return;

  if (hints.length === 0) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';
  container.innerHTML = `
    <div style="padding: 12px; border-bottom: 1px solid #3a3a3a; background: #1a1a1a; font-weight: 600; color: #e0e0e0;">
      Hints & Warnings (${hints.length})
    </div>
    ${hints.map(hint => `
      <div style="
        padding: 12px;
        border-bottom: 1px solid #3a3a3a;
        border-left: 3px solid ${getSeverityColor(hint.severity)};
      ">
        <div style="color: ${getSeverityColor(hint.severity)}; font-weight: 600; margin-bottom: 4px;">
          Line ${hint.line}: ${hint.message}
        </div>
        <div style="color: #999; font-size: 11px;">
          ${hint.suggestion}
        </div>
      </div>
    `).join('')}
  `;
}

export function getSeverityColor(severity) {
  const colors = {
    error: '#ff5f56',
    warning: '#f59e0b',
    info: '#3b82f6'
  };
  return colors[severity] || '#999';
}
