import path from 'path';
import { writeFileAtomicString } from '@sequential/file-operations';
import logger from '@sequential/sequential-logging';

export async function createExampleApps(appsDir) {
  const timestamp = new Date().toISOString();

  const apps = [
    {
      name: 'dashboard',
      title: 'Task Dashboard',
      icon: '📊',
      description: 'Monitor running tasks and flows'
    },
    {
      name: 'docs',
      title: 'Documentation',
      icon: '📖',
      description: 'Quick reference guide'
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
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${app.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h1 { color: #333; margin-bottom: 10px; }
    .subtitle { color: #666; font-size: 14px; margin-bottom: 20px; }
    .info-box { background: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 6px; padding: 15px; margin: 15px 0; }
    code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
    .timestamp { color: #999; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${app.icon} ${app.title}</h1>
    <p class="subtitle">${app.description}</p>
    <div class="info-box">
      <p>This is an example application created by <code>sequential-ecosystem init</code>.</p>
      <p>You can customize this app or replace it with your own implementation.</p>
    </div>
    <div class="info-box">
      <h3>About Sequential Ecosystem</h3>
      <p>Sequential ecosystem provides task execution with automatic suspend/resume capabilities. Tasks can be written in plain JavaScript and will automatically pause on fetch() calls.</p>
    </div>
    <div class="timestamp">Created: ${timestamp}</div>
  </div>
</body>
</html>`;

    await writeFileAtomicString(htmlPath, html);
    logger.info(`  ✓ ${app.title} (app-${app.name})`);
  }
}
