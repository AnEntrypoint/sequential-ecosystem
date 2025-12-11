/**
 * Dashboard App - Configuration Module
 * Manifest and metadata configuration
 */

export function createManifest(appId, name, appUUID, timestamp, description) {
  return {
    id: appId,
    name,
    version: '1.0.0',
    description: description || `Dashboard app: ${name}`,
    icon: '📊',
    entry: 'dist/index.html',
    capabilities: ['sequential-os', 'realtime'],
    window: {
      defaultWidth: 1400,
      defaultHeight: 900,
      minWidth: 800,
      minHeight: 600,
      resizable: true,
      maximizable: true
    },
    metadata: {
      appUUID,
      created: timestamp,
      author: 'user',
      template: 'dashboard'
    }
  };
}
