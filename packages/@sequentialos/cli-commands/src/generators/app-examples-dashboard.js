export function generateDataDashboardExample() {
  return {
    name: 'Data Dashboard',
    description: 'Real-time data visualization with updates',
    html: `<!DOCTYPE html>
<html>
<head>
  <title>Data Dashboard</title>
  <style>
    body { font-family: system-ui; padding: 20px; background: #f5f5f5; }
    .dashboard { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
    .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .metric { font-size: 28px; font-weight: bold; color: #007bff; }
    .label { font-size: 12px; color: #666; margin-top: 8px; }
    button { background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
    button:hover { background: #0056b3; }
  </style>
</head>
<body>
  <h1>📊 Data Dashboard</h1>
  <div class="dashboard">
    <div class="card">
      <div class="metric" id="users">0</div>
      <div class="label">Active Users</div>
    </div>
    <div class="card">
      <div class="metric" id="tasks">0</div>
      <div class="label">Tasks Completed</div>
    </div>
    <div class="card">
      <div class="metric" id="uptime">100%</div>
      <div class="label">System Uptime</div>
    </div>
  </div>
  <div style="margin-top: 20px;">
    <button onclick="refreshData()">Refresh Data</button>
  </div>

  <script type="module">
    let sdk = null;

    async function initSDK() {
      const module = await import('/api/app-sdk.js');
      const { AppSDK } = module;
      sdk = new AppSDK({ appId: 'data-dashboard' });
      await sdk.initStorage();
      refreshData();
    }

    async function refreshData() {
      if (!sdk) return;
      try {
        const data = await sdk.callTask('fetch-metrics', {});
        document.getElementById('users').textContent = data.users || 0;
        document.getElementById('tasks').textContent = data.tasks || 0;
        document.getElementById('uptime').textContent = (data.uptime || 100) + '%';
      } catch (e) {
        console.error('Error fetching data:', e);
      }
    }

    window.refreshData = refreshData;
    initSDK();
  </script>
</body>
</html>`
  };
}
