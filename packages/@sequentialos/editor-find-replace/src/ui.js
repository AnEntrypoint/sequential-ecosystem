export function createFindReplaceUI(editor, searchEngine) {
  function createPanel(onFind, onReplace, onReplaceAll, onClose) {
    let panel = document.getElementById('findReplacePanel');
    if (panel) return panel;

    panel = document.createElement('div');
    panel.id = 'findReplacePanel';
    panel.style.cssText = `
      position: absolute; top: 0; left: 0; right: 0; background: #2a2a2a;
      border-bottom: 1px solid #3a3a3a; padding: 12px 16px; display: flex;
      gap: 12px; align-items: center; z-index: 1000; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
    `;

    const findContainer = document.createElement('div');
    findContainer.style.cssText = 'display: flex; gap: 8px; align-items: center; flex: 1;';
    findContainer.innerHTML = `
      <input id="findInput" type="text" placeholder="Find" style="
        background: #3a3a3a; border: 1px solid #4a4a4a; color: #e0e0e0;
        padding: 8px 12px; border-radius: 4px; font-size: 13px; width: 200px;
      " />
      <div id="matchCount" style="color: #999; font-size: 12px; white-space: nowrap;">0 of 0</div>
      <button id="prevMatch" style="background: #3a3a3a; border: 1px solid #4a4a4a; color: #e0e0e0; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 13px;">↑</button>
      <button id="nextMatch" style="background: #3a3a3a; border: 1px solid #4a4a4a; color: #e0e0e0; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 13px;">↓</button>
    `;

    const replaceContainer = document.createElement('div');
    replaceContainer.style.cssText = 'display: flex; gap: 8px; align-items: center; flex: 1; border-left: 1px solid #3a3a3a; padding-left: 12px;';
    replaceContainer.innerHTML = `
      <input id="replaceInput" type="text" placeholder="Replace" style="
        background: #3a3a3a; border: 1px solid #4a4a4a; color: #e0e0e0;
        padding: 8px 12px; border-radius: 4px; font-size: 13px; width: 200px;
      " />
      <button id="replaceOne" style="background: #3a3a3a; border: 1px solid #4a4a4a; color: #e0e0e0; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 13px;">Replace</button>
      <button id="replaceAll" style="background: #4ade80; border: 1px solid #4ade80; color: #1a1a1a; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: 600;">Replace All</button>
    `;

    const closeButton = document.createElement('button');
    closeButton.textContent = '✕';
    closeButton.style.cssText = 'background: transparent; border: none; color: #999; cursor: pointer; font-size: 18px; padding: 4px 8px; margin-left: auto;';
    closeButton.onclick = onClose;

    panel.appendChild(findContainer);
    panel.appendChild(replaceContainer);
    panel.appendChild(closeButton);

    const editorContainer = editor.parentElement;
    if (editorContainer) {
      editorContainer.style.position = 'relative';
      editorContainer.insertBefore(panel, editor);
    }

    document.getElementById('findInput').addEventListener('input', onFind);
    document.getElementById('findInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') onFind();
      if (e.key === 'Escape') onClose();
    });
    document.getElementById('replaceInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') onReplace();
      if (e.key === 'Escape') onClose();
    });
    document.getElementById('nextMatch').addEventListener('click', onFind);
    document.getElementById('prevMatch').addEventListener('click', onFind);
    document.getElementById('replaceOne').addEventListener('click', onReplace);
    document.getElementById('replaceAll').addEventListener('click', onReplaceAll);

    return panel;
  }

  function closePanel() {
    const panel = document.getElementById('findReplacePanel');
    if (panel) {
      panel.remove();
    }
  }

  function updateMatchCount(current, total) {
    const matchCount = document.getElementById('matchCount');
    if (!matchCount) return;
    if (total === 0) {
      matchCount.textContent = '0 of 0';
    } else {
      matchCount.textContent = `${current + 1} of ${total}`;
    }
  }

  return {
    createPanel,
    closePanel,
    updateMatchCount,
    getInputs: () => ({
      find: document.getElementById('findInput')?.value || '',
      replace: document.getElementById('replaceInput')?.value || ''
    })
  };
}
