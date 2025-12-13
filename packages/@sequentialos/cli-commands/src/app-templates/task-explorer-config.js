/**
 * Task Explorer App - Configuration Module
 * Manifest and metadata configuration
 */

export function createManifest(appId, name, appUUID, timestamp, description) {
  return {
    id: appId,
    name,
    version: '1.0.0',
    description: description || `Task explorer app: ${name}`,
    icon: '🔍',
    entry: 'dist/index.html',
    capabilities: ['sequential-os', 'realtime'],
    window: {
      defaultWidth: 1200,
      defaultHeight: 800,
      minWidth: 700,
      minHeight: 500,
      resizable: true,
      maximizable: true
    },
    metadata: {
      appUUID,
      created: timestamp,
      author: 'user',
      template: 'task-explorer'
    }
  };
}
