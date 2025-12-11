import { createReactManifest } from './react-manifest.js';
import { createReactHtmlTemplate } from './react-template.js';

export function generateReactAppTemplate(appId, name, appUUID, timestamp, description) {
  const manifest = createReactManifest(appId, name, appUUID, timestamp, description);
  const html = createReactHtmlTemplate(appId, name);

  return { manifest: JSON.stringify(manifest, null, 2), html };
}
