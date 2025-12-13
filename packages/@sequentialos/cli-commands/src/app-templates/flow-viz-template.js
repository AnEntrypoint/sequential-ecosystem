/**
 * Flow Visualizer App - HTML Template Module
 * DOM structure for the flow visualization interface
 */

export function createHtmlTemplate(appId, name) {
  return `<!DOCTYPE html>
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
      background: #f5f5f5;
      color: #333;
    }

    .app-container {
      width: 100%;
      height: 100vh;
      display: flex;
    }

    .sidebar {
      width: 300px;
      background: white;
      border-right: 1px solid #e0e0e0;
      padding: 16px;
      overflow-y: auto;
    }

    .sidebar h2 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 12px;
    }

    .flow-list {
      list-style: none;
    }

    .flow-item {
      padding: 10px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      margin-bottom: 8px;
      cursor: pointer;
      background: white;
      transition: all 0.2s ease;
    }

    .flow-item:hover {
      background: #f5f5f5;
      border-color: #0a66c2;
    }

    .flow-item.active {
      background: #e8f4f8;
      border-color: #0a66c2;
    }

    .flow-name {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .flow-states-count {
      font-size: 12px;
      color: #999;
    }

    .main {
      flex: 1;
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
    }

    .canvas {
      flex: 1;
      padding: 20px;
      overflow: auto;
      background: #f5f5f5;
    }

    .flow-diagram {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 20px;
      min-height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999;
    }

    .state-node {
      display: inline-block;
      padding: 12px 20px;
      background: white;
      border: 2px solid #0a66c2;
      border-radius: 6px;
      margin: 10px;
      font-weight: 500;
      text-align: center;
      min-width: 120px;
    }

    .state-node.initial {
      border-color: #31a24c;
      background: #f0fdf4;
    }

    .state-node.final {
      border-color: #ea580c;
      background: #fff7ed;
    }

    .state-node.error {
      border-color: #c41e3a;
      background: #fef2f2;
    }

    .arrow {
      display: inline-block;
      margin: 0 10px;
      color: #999;
      font-size: 20px;
    }

    .footer {
      background: white;
      border-top: 1px solid #e0e0e0;
      padding: 12px 20px;
      font-size: 12px;
      color: #999;
    }

    .loading {
      color: #999;
      text-align: center;
    }

    .error-msg {
      color: #c41e3a;
      padding: 16px;
      background: #fef2f2;
      border-radius: 4px;
      margin: 16px;
    }
  </style>
</head>
<body>
  <div class="app-container">
    <div class="sidebar">
      <h2>Flows</h2>
      <ul class="flow-list" id="flowList">
        <li class="loading">Loading flows...</li>
      </ul>
    </div>

    <div class="main">
      <div class="header">
        <h1>${name}</h1>
      </div>

      <div class="canvas">
        <div class="flow-diagram" id="diagram">
          <p class="loading">Select a flow to visualize</p>
        </div>
        <div class="error-msg" id="errorMsg" style="display: none;"></div>
      </div>

      <div class="footer">
        Sequential Ecosystem • ${appId}
      </div>
    </div>
  </div>

  <script type="module">
    let sdk = null;
    let allFlows = [];

    async function initApp() {
      try {
        // Load AppSDK from server
        const module = await import('/api/app-sdk.js');
        const { AppSDK } = module;

        sdk = new AppSDK({
          appId: '${appId}',
          baseUrl: window.location.origin,
          wsUrl: window.location.origin.replace('http', 'ws')
        });

        console.log('Flow Visualizer initialized:', '${appId}');
        await loadFlows();

      } catch (error) {
        document.getElementById('errorMsg').style.display = 'block';
        document.getElementById('errorMsg').textContent = \`Error initializing app: \${error.message}\`;
        console.error('Init error:', error);
      }
    }

    async function loadFlows() {
      try {
        const response = await fetch('/api/flows');
        const json = await response.json();

        allFlows = json.data?.flows || [];
        renderFlowList(allFlows);
      } catch (error) {
        document.getElementById('errorMsg').style.display = 'block';
        document.getElementById('errorMsg').textContent = \`Error loading flows: \${error.message}\`;
        console.error('Load error:', error);
      }
    }

    function renderFlowList(flows) {
      const list = document.getElementById('flowList');
      list.innerHTML = '';

      if (flows.length === 0) {
        list.innerHTML = '<li class="flow-item"><p style="color: #999">No flows found</p></li>';
        return;
      }

      flows.forEach((flow, index) => {
        const li = document.createElement('li');
        li.className = 'flow-item';
        if (index === 0) li.classList.add('active');

        const stateCount = flow.states ? Object.keys(flow.states).length : 0;

        li.innerHTML = \`
          <div class="flow-name">\${flow.name || flow.id}</div>
          <div class="flow-states-count">\${stateCount} states</div>
        \`;

        li.onclick = () => selectFlow(flow);
        list.appendChild(li);
      });

      if (flows.length > 0) {
        selectFlow(flows[0]);
      }
    }

    function selectFlow(flow) {
      document.querySelectorAll('.flow-item').forEach(item => {
        item.classList.remove('active');
      });
      event.currentTarget?.classList.add('active');

      visualizeFlow(flow);
    }

    function visualizeFlow(flow) {
      const diagram = document.getElementById('diagram');
      const states = flow.states || {};
      const stateNames = Object.keys(states);

      if (stateNames.length === 0) {
        diagram.innerHTML = '<p class="loading">No states in this flow</p>';
        return;
      }

      let html = '';
      stateNames.forEach((stateName, index) => {
        const state = states[stateName];
        const stateType = state.type === 'final' ? 'final' : (stateName === flow.initial ? 'initial' : 'normal');

        html += \`<div class="state-node \${stateType}">\${stateName}</div>\`;

        if (index < stateNames.length - 1) {
          html += '<div class="arrow">→</div>';
        }
      });

      diagram.innerHTML = html;
    }

    document.addEventListener('DOMContentLoaded', initApp);
  </script>
</body>
</html>`;
}
