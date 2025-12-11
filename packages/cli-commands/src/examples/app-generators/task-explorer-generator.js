export function getTaskExplorerHtml(title, icon, description) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
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
      <h1>${icon} ${title}</h1>
      <p>${description}</p>
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
