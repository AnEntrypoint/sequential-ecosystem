export function updateList(snippets, query, onSelect) {
  const list = document.getElementById('snippetList');
  if (!list) return;

  const filtered = query
    ? snippets.filter(s =>
      s.label.toLowerCase().includes(query.toLowerCase()) ||
        s.trigger.toLowerCase().includes(query.toLowerCase()) ||
        s.category.toLowerCase().includes(query.toLowerCase())
    )
    : snippets;

  list.innerHTML = filtered.map(snippet => `
    <div class="snippet-item" data-id="${snippet.id}" style="
      padding: 16px;
      border-bottom: 1px solid #3a3a3a;
      cursor: pointer;
      transition: background 0.15s;
    ">
      <div style="display: flex; gap: 12px; align-items: flex-start;">
        <div style="flex: 1;">
          <div style="color: #e0e0e0; font-weight: 600; margin-bottom: 4px;">
            ${snippet.label}
          </div>
          <div style="color: #666; font-size: 12px; margin-bottom: 8px;">
            Trigger: <code style="background: #3a3a3a; padding: 2px 6px; border-radius: 3px;">${snippet.trigger}</code>
            · Category: ${snippet.category}
          </div>
          <pre style="
            background: #1a1a1a;
            color: #4ade80;
            padding: 8px;
            border-radius: 4px;
            font-size: 11px;
            overflow-x: auto;
            margin: 0;
          "><code>${escapeHtml(snippet.code)}</code></pre>
        </div>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('.snippet-item').forEach(item => {
    item.addEventListener('click', () => {
      const snippetId = item.dataset.id;
      const snippet = snippets.find(s => s.id === snippetId);
      if (snippet) {
        onSelect(snippet);
      }
    });
    item.addEventListener('mouseover', () => {
      item.style.background = '#3a3a3a';
    });
    item.addEventListener('mouseout', () => {
      item.style.background = 'transparent';
    });
  });
}

export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
