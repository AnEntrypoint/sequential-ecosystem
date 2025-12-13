export function createReactManifest(appId, name, appUUID, timestamp, description) {
  return {
    id: appId,
    name,
    version: '1.0.0',
    description: description || `React App: ${name}`,
    icon: '⚛️',
    entry: 'dist/index.html',
    capabilities: ['sequential-os', 'realtime', 'storage'],
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
      template: 'react',
      framework: 'react'
    }
  };
}
