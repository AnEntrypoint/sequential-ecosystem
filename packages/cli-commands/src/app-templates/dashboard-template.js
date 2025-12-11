/**
 * Dashboard App - HTML Template Module
 * DOM structure with CSS and JavaScript for dashboard interface
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
      background: #f0f2f5;
      color: #1c1e21;
    }

    .app-container {
      width: 100%;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 24px 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }

    .header h1 {
      font-size: 28px;
      font-weight: 700;
    }

    .header p {
      font-size: 14px;
      opacity: 0.9;
      margin-top: 4px;
    }

    .content {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .card {
      background: white;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      border: 1px solid #e0e0e0;
      transition: all 0.3s ease;
    }

    .card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
      border-color: #667eea;
    }

    .card h3 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 12px;
      color: #1c1e21;
    }

    .card-value {
      font-size: 32px;
      font-weight: 700;
      color: #667eea;
      margin: 16px 0;
    }

    .card-label {
      font-size: 13px;
      color: #65676b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .card-description {
      font-size: 14px;
      color: #65676b;
      margin-top: 8px;
      line-height: 1.5;
    }

    .footer {
      background: white;
      border-top: 1px solid #e0e0e0;
      padding: 12px 20px;
      font-size: 12px;
      color: #999;
    }

    .status {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #31a24c;
      margin-right: 6px;
    }
  </style>
</head>
<body>
  <div class="app-container">
    <div class="header">
      <h1>${name}</h1>
      <p>Dashboard view with metrics and real-time updates</p>
    </div>

    <div class="content">
      <div class="grid">
        <div class="card">
          <h3>Tasks Executed</h3>
          <div class="card-value">0</div>
          <div class="card-label">
            <span class="status"></span>Active
          </div>
          <div class="card-description">Total tasks run in this session</div>
        </div>

        <div class="card">
          <h3>Success Rate</h3>
          <div class="card-value">0%</div>
          <div class="card-label">Performance</div>
          <div class="card-description">Percentage of successful executions</div>
        </div>

        <div class="card">
          <h3>Avg Duration</h3>
          <div class="card-value">--</div>
          <div class="card-label">Performance</div>
          <div class="card-description">Average task execution time</div>
        </div>

        <div class="card">
          <h3>Tools Available</h3>
          <div class="card-value">0</div>
          <div class="card-label">Registry</div>
          <div class="card-description">Registered tools ready to use</div>
        </div>

        <div class="card">
          <h3>API Health</h3>
          <div class="card-value">OK</div>
          <div class="card-label">
            <span class="status"></span>Connected
          </div>
          <div class="card-description">Sequential server status</div>
        </div>

        <div class="card">
          <h3>Last Activity</h3>
          <div class="card-value">--</div>
          <div class="card-label">Timestamp</div>
          <div class="card-description">Latest task execution</div>
        </div>
      </div>
    </div>

    <div class="footer">
      Sequential Ecosystem • ${appId}
    </div>
  </div>

  <script type="module">
    let sdk = null;
    let metrics = {
      tasksExecuted: 0,
      successRate: 0,
      avgDuration: 0,
      toolsAvailable: 0
    };

    async function initApp() {
      try {
        const module = await import('/api/app-sdk.js');
        const { AppSDK } = module;

        sdk = new AppSDK({
          appId: '${appId}',
          baseUrl: window.location.origin,
          wsUrl: window.location.origin.replace('http', 'ws')
        });

        console.log('Dashboard initialized:', '${appId}');
        await loadMetrics();

        if (sdk.realtime) {
          try {
            const realtime = sdk.realtime('connect', 'dashboard-metrics');
            realtime.on('metrics', (data) => {
              Object.assign(metrics, data);
              updateMetrics();
            });
          } catch (error) {
            console.log('Real-time metrics unavailable:', error.message);
          }
        }

        setInterval(loadMetrics, 30000);

      } catch (error) {
        console.error('Dashboard initialization failed:', error);
        document.body.innerHTML = '<p style="padding: 20px; color: red;">Error initializing dashboard: ' + error.message + '</p>';
      }
    }

    async function loadMetrics() {
      try {
        updateMetrics();
      } catch (error) {
        console.error('Failed to load metrics:', error);
      }
    }

    function updateMetrics() {
      document.querySelectorAll('.card-value').forEach((el, i) => {
        const value = Object.values(metrics)[i];
        if (typeof value === 'number') {
          el.textContent = value === 0 ? '0' : value.toFixed(1);
        }
      });
    }

    document.addEventListener('DOMContentLoaded', initApp);
  </script>
</body>
</html>`;
}
