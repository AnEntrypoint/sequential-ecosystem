export function getFlowVisualizerHtml(title, icon) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
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
      <h1>${icon} ${title}</h1>
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
}
