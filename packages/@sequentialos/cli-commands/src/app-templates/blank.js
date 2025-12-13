export function generateBlankAppTemplate(appId, name, appUUID, timestamp, description) {
  const manifest = {
    id: appId,
    name,
    version: '1.0.0',
    description: description || `App: ${name}`,
    icon: '📦',
    entry: 'dist/index.html',
    capabilities: ['sequential-os', 'realtime'],
    window: {
      defaultWidth: 1200,
      defaultHeight: 800,
      minWidth: 600,
      minHeight: 400,
      resizable: true,
      maximizable: true
    },
    metadata: {
      appUUID,
      created: timestamp,
      author: 'user',
      template: 'blank'
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
      background: #f5f5f5;
      color: #333;
    }

    .app-container {
      width: 100%;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .header {
      background: #fff;
      border-bottom: 1px solid #e0e0e0;
      padding: 16px 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .header h1 {
      font-size: 24px;
      font-weight: 600;
    }

    .header p {
      font-size: 14px;
      color: #666;
      margin-top: 4px;
    }

    .content {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
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
      <p>${description || 'App created from blank template'}</p>
    </div>

    <div class="content">
      <p>Welcome to your new app! Edit this HTML to build your UI.</p>
      <p>Access the AppSDK in your JavaScript:</p>
      <code>const sdk = AppSDK.getInstance();</code>
    </div>

    <div class="footer">
      Sequential Ecosystem • ${appId}
    </div>
  </div>

  <script type="module">
    let sdk = null;

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

        console.log('App initialized:', '${appId}');

        // Example: Use storage
        // const data = await sdk.storage('get', 'myKey');
        // await sdk.storage('set', 'myKey', { value: 'data' });

        // Example: Use realtime
        // const realtime = sdk.realtime('connect', 'room-id');
        // realtime.on('message', (data) => console.log('Received:', data));
        // realtime.send('message', { text: 'Hello' });

        // Example: Register and use tools
        // sdk.tool('myTool', async (input) => input * 2, 'Double a number');
        // await sdk.initTools();
        // const result = await sdk.tools('invoke', 'myTool', 42);

      } catch (error) {
        console.error('App initialization failed:', error);
        document.body.innerHTML = '<p style="padding: 20px; color: red;">Error initializing app: ' + error.message + '</p>';
      }
    }

    document.addEventListener('DOMContentLoaded', initApp);
  </script>
</body>
</html>
`;

  return { manifest: JSON.stringify(manifest, null, 2), html };
}
