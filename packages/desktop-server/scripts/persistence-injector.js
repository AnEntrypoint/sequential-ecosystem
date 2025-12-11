/**
 * persistence-injector.js
 *
 * Inject localStorage persistence code into app HTML files
 */

import fs from 'fs-extra';
import path from 'path';
import logger from '@sequentialos/sequential-logging';

export async function injectPersistence(appsDir, storageManagerCode, initHooks) {
  for (const [appName, initHook] of Object.entries(initHooks)) {
    const htmlPath = path.join(appsDir, appName, 'dist/index.html');

    if (!fs.existsSync(htmlPath)) {
      logger.info(`⚠️  Skipping ${appName} - HTML not found`);
      continue;
    }

    let content = fs.readFileSync(htmlPath, 'utf8');

    if (content.includes('[Storage-Manager-Injected]')) {
      logger.info(`✅ ${appName} - Already has persistence`);
      continue;
    }

    let scriptStartIdx = content.indexOf('<script>');
    let scriptTag = '<script>';
    if (scriptStartIdx === -1) {
      scriptStartIdx = content.indexOf('<script type="module">');
      scriptTag = '<script type="module">';
    }
    if (scriptStartIdx === -1) {
      logger.info(`⚠️  Skipping ${appName} - No script tag found`);
      continue;
    }

    const insertIdx = scriptStartIdx + scriptTag.length;
    const marker = '\n    // [Storage-Manager-Injected]\n';
    const injection = marker + storageManagerCode + '\n' + initHook + '\n';

    const updated = content.slice(0, insertIdx) + injection + content.slice(insertIdx);

    fs.writeFileSync(htmlPath, updated, 'utf8');
    logger.info(`✅ ${appName} - Persistence injected`);
  }

  logger.info('\n✨ localStorage persistence injected into all apps');
}
