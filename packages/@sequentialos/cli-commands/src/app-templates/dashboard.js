import { createManifest } from './dashboard-config.js';
import { createHtmlTemplate } from './dashboard-template.js';

export function generateDashboardAppTemplate(appId, name, appUUID, timestamp, description) {
  const manifest = createManifest(appId, name, appUUID, timestamp, description);
  const html = createHtmlTemplate(appId, name);

  return { manifest: JSON.stringify(manifest, null, 2), html };
}
