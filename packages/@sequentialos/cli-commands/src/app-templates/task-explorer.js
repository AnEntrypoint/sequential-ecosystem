import { createManifest } from './task-explorer-config.js';
import { createHtmlTemplate } from './task-explorer-template.js';

export function generateTaskExplorerAppTemplate(appId, name, appUUID, timestamp, description) {
  const manifest = createManifest(appId, name, appUUID, timestamp, description);
  const html = createHtmlTemplate(appId, name);

  return { manifest: JSON.stringify(manifest, null, 2), html };
}
