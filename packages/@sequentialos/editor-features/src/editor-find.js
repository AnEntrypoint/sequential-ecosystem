export function injectFindUI(editorInstance) {
  const container = document.createElement('div');
  container.id = 'find-container';
  container.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    background: #2a2a2a;
    border: 1px solid #3a3a3a;
    border-radius: 6px;
    padding: 10px;
    display: none;
    gap: 8px;
    z-index: 1000;
    min-width: 300px;
  `;

  container.innerHTML = `
    <input type="text" id="find-input" placeholder="Find in code..." style="
      flex: 1;
      background: #1a1a1a;
      border: 1px solid #3a3a3a;
      color: #e0e0e0;
      padding: 8px;
      border-radius: 4px;
      font-size: 13px;
    ">
    <div id="find-stats" style="font-size: 12px; color: #999;">0/0</div>
    <button id="find-prev" style="
      background: #3a3a3a;
      border: none;
      color: #e0e0e0;
      padding: 6px 12px;
      cursor: pointer;
      border-radius: 4px;
    ">↑</button>
    <button id="find-next" style="
      background: #3a3a3a;
      border: none;
      color: #e0e0e0;
      padding: 6px 12px;
      cursor: pointer;
      border-radius: 4px;
    ">↓</button>
    <button id="find-close" style="
      background: #3a3a3a;
      border: none;
      color: #e0e0e0;
      padding: 6px 12px;
      cursor: pointer;
      border-radius: 4px;
    ">✕</button>
  `;

  const editorContainer = editorInstance.editor?.parentElement;
  if (editorContainer) {
    editorContainer.style.position = 'relative';
    editorContainer.appendChild(container);
  }

  document.getElementById('find-input').addEventListener('input', (e) => {
    editorInstance.performSearch(e.target.value);
  });

  document.getElementById('find-prev').addEventListener('click', () => {
    editorInstance.findIndex = Math.max(0, editorInstance.findIndex - 1);
    editorInstance.highlightMatch();
  });

  document.getElementById('find-next').addEventListener('click', () => {
    editorInstance.findIndex = Math.min(editorInstance.searchMatches.length - 1, editorInstance.findIndex + 1);
    editorInstance.highlightMatch();
  });

  document.getElementById('find-close').addEventListener('click', () => {
    editorInstance.toggleFind();
  });
}

export function toggleFind(editorInstance) {
  const container = document.getElementById('find-container');
  if (!container) return;

  editorInstance.findVisible = !editorInstance.findVisible;
  container.style.display = editorInstance.findVisible ? 'flex' : 'none';

  if (editorInstance.findVisible) {
    document.getElementById('find-input').focus();
  } else {
    editorInstance.clearHighlights();
  }
}

export function performSearch(editorInstance, query) {
  if (!query) {
    editorInstance.searchMatches = [];
    editorInstance.findIndex = -1;
    editorInstance.clearHighlights();
    updateStats(editorInstance);
    return;
  }

  const code = editorInstance.editor.value;
  const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  editorInstance.searchMatches = [...code.matchAll(regex)];
  editorInstance.findIndex = 0;
  editorInstance.highlightMatch();
}

export function highlightMatch(editorInstance) {
  editorInstance.clearHighlights();
  if (editorInstance.searchMatches.length === 0) {
    updateStats(editorInstance);
    return;
  }

  const match = editorInstance.searchMatches[editorInstance.findIndex];
  if (!match) return;

  const before = editorInstance.editor.value.substring(0, match.index);
  const lineNum = before.split('\n').length - 1;
  editorInstance.editor.setSelectionRange(match.index, match.index + match[0].length);

  updateStats(editorInstance);
}

export function clearHighlights(editorInstance) {
  editorInstance.editor.setSelectionRange(0, 0);
}

export function updateStats(editorInstance) {
  const stats = document.getElementById('find-stats');
  if (stats) {
    const count = editorInstance.searchMatches.length;
    const current = editorInstance.findIndex >= 0 ? editorInstance.findIndex + 1 : 0;
    stats.textContent = `${current}/${count}`;
  }
}
