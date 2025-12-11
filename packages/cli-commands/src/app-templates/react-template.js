export function createReactHtmlTemplate(appId, name) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\${name}</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
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

    #root {
      width: 100%;
      height: 100vh;
    }

    .app-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .app-header {
      background: #fff;
      padding: 16px 24px;
      border-bottom: 1px solid #e0e0e0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .app-header h1 {
      font-size: 24px;
      font-weight: 600;
    }

    .app-content {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
    }

    .card {
      background: #fff;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .button {
      background: #007bff;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.2s;
    }

    .button:hover {
      background: #0056b3;
    }

    .button:active {
      background: #004085;
    }

    .status {
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      margin: 8px 0;
    }

    .status.success {
      background: #d4edda;
      color: #155724;
    }

    .status.error {
      background: #f8d7da;
      color: #721c24;
    }

    .status.loading {
      background: #d1ecf1;
      color: #0c5460;
    }
  </style>
</head>
<body>
  <div id="root"></div>

  <script type="module">
    const { useState, useEffect, useCallback } = React;
    const e = React.createElement;

    // App SDK Integration
    let sdk = null;
    const initSDK = async () => {
      try {
        const module = await import('/api/app-sdk.js');
        const { AppSDK } = module;
        sdk = new AppSDK({
          appId: '\${appId}',
          baseUrl: window.location.origin,
          wsUrl: window.location.origin.replace('http', 'ws')
        });
        await sdk.initStorage();
        return true;
      } catch (err) {
        console.error('Failed to initialize AppSDK:', err);
        return false;
      }
    };

    // Main React Component
    function App() {
      const [ready, setReady] = useState(false);
      const [data, setData] = useState(null);
      const [status, setStatus] = useState('');

      useEffect(() => {
        initSDK().then(ok => {
          if (ok) {
            setStatus('✓ App SDK connected');
            setReady(true);
          } else {
            setStatus('✗ Failed to connect App SDK');
          }
        });
      }, []);

      const handleFetchData = useCallback(async () => {
        if (!sdk) {
          setStatus('✗ SDK not initialized');
          return;
        }
        try {
          setStatus('Loading...');
          // Example: Call a task
          const result = await sdk.callTask('sample-task', { test: true });
          setData(result);
          setStatus('✓ Data loaded successfully');
        } catch (err) {
          setStatus('✗ Error: ' + err.message);
        }
      }, []);

      const handleSaveData = useCallback(async () => {
        if (!sdk) {
          setStatus('✗ SDK not initialized');
          return;
        }
        try {
          setStatus('Saving...');
          await sdk.setData('app-data', { timestamp: Date.now(), content: data });
          setStatus('✓ Data saved successfully');
        } catch (err) {
          setStatus('✗ Error: ' + err.message);
        }
      }, [data]);

      return e('div', { className: 'app-container' },
        e('header', { className: 'app-header' },
          e('h1', null, '\${name}'),
          e('p', null, 'React App with Sequential AppSDK')
        ),
        e('main', { className: 'app-content' },
          e('div', { className: 'card' },
            e('h2', null, '🎯 Getting Started'),
            e('p', null, 'Your React app is ready! Use the buttons below to interact with Sequential tasks and storage.'),
            e('div', null,
              e('button', { className: 'button', onClick: handleFetchData, disabled: !ready },
                'Fetch Data'
              ),
              e('button', { className: 'button', onClick: handleSaveData, disabled: !ready, style: { marginLeft: '8px' } },
                'Save Data'
              )
            ),
            e('div', { className: 'status ' + (status.includes('✓') ? 'success' : status.includes('✗') ? 'error' : 'loading') },
              status || 'Initializing...'
            )
          ),
          data && e('div', { className: 'card' },
            e('h3', null, '📊 Data'),
            e('pre', { style: { background: '#f0f0f0', padding: '12px', borderRadius: '4px', overflow: 'auto' } },
              JSON.stringify(data, null, 2)
            )
          ),
          e('div', { className: 'card' },
            e('h3', null, '💡 Tips'),
            e('ul', null,
              e('li', null, 'Edit this file at: apps/\${appId}/dist/index.html'),
              e('li', null, 'Changes reload automatically (hot reload)'),
              e('li', null, 'Use sdk.callTask(), sdk.callFlow(), sdk.callTool()'),
              e('li', null, 'Store data with sdk.setData() and retrieve with sdk.getData()'),
              e('li', null, 'Subscribe to real-time updates with sdk.subscribe()')
            )
          )
        )
      );
    }

    // Render app
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(e(App));
  </script>
</body>
</html>\`;
}
