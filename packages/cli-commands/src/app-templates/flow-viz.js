import { createManifest } from './flow-viz-config.js';
import { createHtmlTemplate } from './flow-viz-template.js';

export function generateFlowVizAppTemplate(appId, name, appUUID, timestamp, description) {
  const manifest = createManifest(appId, name, appUUID, timestamp, description);
  const html = createHtmlTemplate(appId, name);

  return { manifest: JSON.stringify(manifest, null, 2), html };
}
