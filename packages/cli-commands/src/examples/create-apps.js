import path from 'path';
import { writeFileAtomicString } from 'file-operations';
import logger from '@sequential/sequential-logging';
import { nowISO } from '@sequential/timestamp-utilities';

export async function createExampleApps(appsDir) {
  const timestamp = nowISO();

  const apps = [
    {
      name: 'task-dashboard',
      title: 'Task Dashboard',
      icon: '📊',
      description: 'Monitor and execute tasks in real-time'
    },
    {
      name: 'flow-visualizer',
      title: 'Flow Visualizer',
      icon: '🔀',
      description: 'Visualize and debug flow execution'
    },
    {
      name: 'task-explorer',
      title: 'Task Explorer',
      icon: '🔍',
      description: 'Browse all available tasks and tools'
    }
  ];

  for (const app of apps) {
    const appDir = path.join(appsDir, app.name);
    const distDir = path.join(appDir, 'dist');

    const manifestPath = path.join(appDir, 'manifest.json');
    const manifest = {
      id: `app-${app.name}`,
      name: app.title,
      version: '1.0.0',
      description: app.description,
      icon: app.icon,
      entry: 'dist/index.html',
      window: {
        defaultWidth: 1024,
        defaultHeight: 768,
        minWidth: 600,
        minHeight: 400,
        resizable: true,
        maximizable: true
      }
    };

    await writeFileAtomicString(manifestPath, JSON.stringify(manifest, null, 2));

    const htmlPath = path.join(distDir, 'index.html');
    let html;

    if (app.name === 'task-dashboard') {
      html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${app.title}</title>
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
      <h1>${app.icon} ${app.title}</h1>
      <p class="subtitle">${app.description}</p>
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
    } else if (app.name === 'flow-visualizer') {
      html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${app.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 1400px; margin: 0 auto; }
    header { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h1 { color: #333; margin-bottom: 5px; }
    .content { display: grid; grid-template-columns: 1fr 2fr; gap: 20px; }
    .sidebar { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .canvas { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); min-height: 400px; border: 2px dashed #ddd; }
    .flow-list .flow { padding: 10px; margin: 10px 0; background: #f9f9f9; border-radius: 4px; cursor: pointer; border-left: 4px solid #2196F3; }
    .flow-list .flow:hover { background: #f0f0f0; }
    .flow-list .flow.active { border-left-color: #4CAF50; background: #e8f5e9; }
    .state { display: inline-block; margin: 20px; padding: 15px; background: #e3f2fd; border-radius: 6px; border: 2px solid #2196F3; min-width: 100px; text-align: center; }
    .state.error { background: #ffebee; border-color: #f44336; }
    .state.complete { background: #e8f5e9; border-color: #4CAF50; }
    .arrow { display: inline-block; margin: 0 10px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>${app.icon} ${app.title}</h1>
      <p>Select a flow to visualize its execution path</p>
    </header>
    <div class="content">
      <div class="sidebar">
        <h3>Available Flows</h3>
        <div class="flow-list">
          <div class="flow active" onclick="showFlow('task-flow')">
            📋 example-flow-calls-task
          </div>
          <div class="flow" onclick="showFlow('tool-flow')">
            🔧 example-flow-calls-tool
          </div>
          <div class="flow" onclick="showFlow('order-flow')">
            🛒 example-flow-orchestration
          </div>
        </div>
      </div>
      <div class="canvas" id="canvas">
        <div class="state">validate</div>
        <div class="arrow">→</div>
        <div class="state">check</div>
        <div class="arrow">→</div>
        <div class="state">fetch</div>
        <div class="arrow">→</div>
        <div class="state complete">complete</div>
      </div>
    </div>
  </div>
  <script>
    function showFlow(type) {
      const canvas = document.getElementById('canvas');
      if (type === 'task-flow') {
        canvas.innerHTML = '<div class="state">validate</div><div class="arrow">→</div><div class="state">check</div><div class="arrow">→</div><div class="state">fetch</div><div class="arrow">→</div><div class="state complete">complete</div>';
      } else if (type === 'tool-flow') {
        canvas.innerHTML = '<div class="state">fetchUser</div><div class="arrow">→</div><div class="state">processUser</div><div class="arrow">→</div><div class="state">logOperation</div><div class="arrow">→</div><div class="state complete">complete</div>';
      } else if (type === 'order-flow') {
        canvas.innerHTML = '<div class="state">validateOrder</div><div class="arrow">→</div><div class="state">inventory</div><div class="arrow">→</div><div class="state">payment</div><div class="arrow">→</div><div class="state">shipment</div><div class="arrow">→</div><div class="state complete">sent</div>';
      }
    }
  </script>
</body>
</html>`;
    } else {
      html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${app.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 1000px; margin: 0 auto; }
    header { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h1 { color: #333; margin-bottom: 5px; }
    .search { margin: 20px 0; }
    input { width: 100%; padding: 10px; font-size: 14px; border: 1px solid #ddd; border-radius: 4px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
    .item { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .item h3 { color: #333; margin-bottom: 5px; font-size: 16px; }
    .item .type { display: inline-block; background: #e3f2fd; color: #2196F3; padding: 4px 8px; border-radius: 3px; font-size: 12px; margin: 5px 0; }
    .item .desc { color: #666; font-size: 13px; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>${app.icon} ${app.title}</h1>
      <p>${app.description}</p>
    </header>
    <div class="search">
      <input type="text" placeholder="Search tasks, tools, and flows..." onkeyup="filterItems(this.value)">
    </div>
    <div class="grid" id="items">
      <div class="item">
        <h3>example-simple-flow</h3>
        <span class="type">Task</span>
        <div class="desc">Basic task with auto-pause on fetch</div>
      </div>
      <div class="item">
        <h3>example-api-integration</h3>
        <span class="type">Task</span>
        <div class="desc">Calling external APIs with retry logic</div>
      </div>
      <div class="item">
        <h3>example-task-calls-tool</h3>
        <span class="type">Task</span>
        <div class="desc">Task calling tools for database access</div>
      </div>
      <div class="item">
        <h3>example-flow-calls-task</h3>
        <span class="type">Flow</span>
        <div class="desc">Flow orchestrating multiple tasks</div>
      </div>
      <div class="item">
        <h3>example-flow-orchestration</h3>
        <span class="type">Flow</span>
        <div class="desc">Complex flow with error handling</div>
      </div>
      <div class="item">
        <h3>database</h3>
        <span class="type">Tool</span>
        <div class="desc">Database query execution</div>
      </div>
      <div class="item">
        <h3>api-client</h3>
        <span class="type">Tool</span>
        <div class="desc">HTTP client with exponential backoff</div>
      </div>
      <div class="item">
        <h3>filesystem</h3>
        <span class="type">Tool</span>
        <div class="desc">File operations and caching</div>
      </div>
    </div>
  </div>
  <script>
    function filterItems(query) {
      const items = document.querySelectorAll('.item');
      const q = query.toLowerCase();
      items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(q) ? '' : 'none';
      });
    }
  </script>
</body>
</html>`;
    }

    await writeFileAtomicString(htmlPath, html);
    logger.info(`  ✓ ${app.title} (app-${app.name})`);
  }
}
