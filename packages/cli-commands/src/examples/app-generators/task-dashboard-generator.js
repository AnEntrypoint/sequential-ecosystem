export function getTaskDashboardHtml(title, icon, description) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 1200px; margin: 0 auto; }
    header { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h1 { color: #333; margin-bottom: 5px; }
    .subtitle { color: #666; font-size: 14px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
    .card { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .card h3 { color: #333; margin-bottom: 10px; }
    .task-item { background: #f9f9f9; padding: 15px; border-radius: 6px; margin: 10px 0; border-left: 4px solid #4CAF50; }
    .task-item .name { font-weight: bold; color: #333; }
    .task-item .status { color: #666; font-size: 12px; margin-top: 5px; }
    button { background: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 14px; }
    button:hover { background: #45a049; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>${icon} ${title}</h1>
      <p class="subtitle">${description}</p>
    </header>
    <div class="grid">
      <div class="card">
        <h3>Running Tasks</h3>
        <div class="task-item">
          <div class="name">example-simple-flow</div>
          <div class="status">Ready to run</div>
        </div>
        <div class="task-item">
          <div class="name">example-api-integration</div>
          <div class="status">Ready to run</div>
        </div>
        <button onclick="alert('Task execution coming soon')">Run Task</button>
      </div>
      <div class="card">
        <h3>Available Flows</h3>
        <div class="task-item">
          <div class="name">example-flow-calls-task</div>
          <div class="status">Ready to run</div>
        </div>
        <div class="task-item">
          <div class="name">example-flow-orchestration</div>
          <div class="status">Ready to run</div>
        </div>
        <button onclick="alert('Flow execution coming soon')">Run Flow</button>
      </div>
      <div class="card">
        <h3>System Status</h3>
        <div class="task-item">
          <div class="name">Server</div>
          <div class="status">✅ Connected</div>
        </div>
        <div class="task-item">
          <div class="name">Database</div>
          <div class="status">✅ Ready</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}
