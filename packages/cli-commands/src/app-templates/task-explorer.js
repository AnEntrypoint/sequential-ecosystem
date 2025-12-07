export function generateTaskExplorerAppTemplate(appId, name, appUUID, timestamp, description) {
  const manifest = {
    id: appId,
    name,
    version: '1.0.0',
    description: description || `Task explorer app: ${name}`,
    icon: '🔍',
    entry: 'dist/index.html',
    capabilities: ['sequential-os', 'realtime'],
    window: {
      defaultWidth: 1200,
      defaultHeight: 800,
      minWidth: 700,
      minHeight: 500,
      resizable: true,
      maximizable: true
    },
    metadata: {
      appUUID,
      created: timestamp,
      author: 'user',
      template: 'task-explorer'
    }
  };

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #fff;
      color: #333;
    }

    .app-container {
      width: 100%;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .header {
      background: white;
      border-bottom: 1px solid #e0e0e0;
      padding: 16px 20px;
    }

    .header h1 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 12px;
    }

    .search-box {
      display: flex;
      gap: 8px;
      max-width: 400px;
    }

    .search-box input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .search-box button {
      padding: 8px 16px;
      background: #0a66c2;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }

    .search-box button:hover {
      background: #054494;
    }

    .content {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
    }

    .loading {
      text-align: center;
      color: #999;
      padding: 40px 20px;
    }

    .task-list {
      list-style: none;
    }

    .task-item {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      padding: 16px;
      margin-bottom: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .task-item:hover {
      border-color: #0a66c2;
      box-shadow: 0 2px 8px rgba(10, 102, 194, 0.1);
    }

    .task-name {
      font-weight: 600;
      font-size: 16px;
      color: #0a66c2;
      margin-bottom: 4px;
    }

    .task-description {
      font-size: 14px;
      color: #666;
      margin-bottom: 8px;
    }

    .task-meta {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: #999;
    }

    .badge {
      display: inline-block;
      padding: 2px 8px;
      background: #f0f2f5;
      border-radius: 3px;
      font-size: 11px;
      margin-right: 8px;
    }

    .error {
      background: #fee;
      border: 1px solid #fcc;
      border-radius: 4px;
      padding: 16px;
      color: #c33;
      margin: 20px;
    }

    .footer {
      background: #fafafa;
      border-top: 1px solid #e0e0e0;
      padding: 12px 20px;
      font-size: 12px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="app-container">
    <div class="header">
      <h1>${name}</h1>
      <div class="search-box">
        <input type="text" id="searchInput" placeholder="Search tasks...">
        <button onclick="refreshTasks()">Refresh</button>
      </div>
    </div>

    <div class="content">
      <div class="loading" id="loading">Loading tasks...</div>
      <ul class="task-list" id="taskList"></ul>
      <div class="error" id="errorDiv" style="display: none;"></div>
    </div>

    <div class="footer">
      Sequential Ecosystem • ${appId}
    </div>
  </div>

  <script>
    window.appId = '${appId}';
    let allTasks = [];

    async function loadTasks() {
      try {
        const response = await fetch('/api/tasks');
        const json = await response.json();

        allTasks = json.data?.tasks || [];
        renderTasks(allTasks);

        document.getElementById('loading').style.display = 'none';
        document.getElementById('errorDiv').style.display = 'none';
      } catch (error) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('errorDiv').style.display = 'block';
        document.getElementById('errorDiv').textContent = \`Error loading tasks: \${error.message}\`;
        console.error('Load error:', error);
      }
    }

    function renderTasks(tasks) {
      const list = document.getElementById('taskList');
      list.innerHTML = '';

      if (tasks.length === 0) {
        list.innerHTML = '<li class="task-item"><p class="task-description">No tasks found</p></li>';
        return;
      }

      tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.innerHTML = \`
          <div class="task-name">\${task.name}</div>
          <div class="task-description">\${task.description || 'No description'}</div>
          <div class="task-meta">
            <span class="badge">ID: \${task.id.substring(0, 8)}</span>
            <span>Created: \${new Date(task.created).toLocaleDateString()}</span>
          </div>
        \`;
        list.appendChild(li);
      });
    }

    function filterTasks() {
      const query = document.getElementById('searchInput').value.toLowerCase();
      const filtered = allTasks.filter(t =>
        t.name.toLowerCase().includes(query) ||
        (t.description && t.description.toLowerCase().includes(query))
      );
      renderTasks(filtered);
    }

    function refreshTasks() {
      document.getElementById('loading').style.display = 'block';
      document.getElementById('taskList').innerHTML = '';
      loadTasks();
    }

    document.getElementById('searchInput')?.addEventListener('input', filterTasks);

    document.addEventListener('DOMContentLoaded', loadTasks);
  </script>
</body>
</html>
`;

  return { manifest: JSON.stringify(manifest, null, 2), html };
}
