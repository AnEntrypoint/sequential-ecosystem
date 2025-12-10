import path from 'path';
import { randomUUID } from 'crypto';
import { existsSync } from 'fs';
import { ensureDirectory, writeFileAtomicString } from '@sequentialos/file-operations';
import { generateBlankAppTemplate } from './app-templates/blank.js';
import { generateDashboardAppTemplate } from './app-templates/dashboard.js';
import { generateTaskExplorerAppTemplate } from './app-templates/task-explorer.js';
import { generateFlowVizAppTemplate } from './app-templates/flow-viz.js';
import { generateReactAppTemplate } from './app-templates/react.js';
import { generateAppPackageJson } from './generators/app-package-generator.js';
import logger from '@sequentialos/sequential-logging';
import { nowISO } from '@sequentialos/timestamp-utilities';

const VALID_TEMPLATES = ['blank', 'dashboard', 'task-explorer', 'flow-viz', 'react'];

export async function createApp(options) {
  const { name, template = 'blank', description = '' } = options;

  if (!VALID_TEMPLATES.includes(template)) {
    throw new Error(`Invalid template: ${template}. Choose from: ${VALID_TEMPLATES.join(', ')}`);
  }

  const appsDir = path.resolve(process.cwd(), 'apps');
  const appId = name.toLowerCase().replace(/\s+/g, '-');
  const appDir = path.join(appsDir, appId);

  if (existsSync(appDir)) {
    throw new Error(`App '${appId}' already exists at ${appDir}`);
  }

  await ensureDirectory(appDir);
  await ensureDirectory(path.join(appDir, 'dist'));
  await ensureDirectory(path.join(appDir, 'src'));

  const timestamp = nowISO();
  const appUUID = randomUUID();

  let manifest;
  let html;

  switch (template) {
    case 'blank':
      { const result = generateBlankAppTemplate(appId, name, appUUID, timestamp, description);
      manifest = result.manifest;
      html = result.html;
      }
      break;
    case 'dashboard':
      { const result = generateDashboardAppTemplate(appId, name, appUUID, timestamp, description);
      manifest = result.manifest;
      html = result.html;
      }
      break;
    case 'task-explorer':
      { const result = generateTaskExplorerAppTemplate(appId, name, appUUID, timestamp, description);
      manifest = result.manifest;
      html = result.html;
      }
      break;
    case 'flow-viz':
      { const result = generateFlowVizAppTemplate(appId, name, appUUID, timestamp, description);
      manifest = result.manifest;
      html = result.html;
      }
      break;
    case 'react':
      { const result = generateReactAppTemplate(appId, name, appUUID, timestamp, description);
      manifest = result.manifest;
      html = result.html;
      }
      break;
  }

  const packageJson = generateAppPackageJson(appId, name, description);

  await writeFileAtomicString(path.join(appDir, 'manifest.json'), manifest);
  await writeFileAtomicString(path.join(appDir, 'dist/index.html'), html);
  await writeFileAtomicString(path.join(appDir, 'package.json'), JSON.stringify(packageJson, null, 2));

  logger.info(`✓ App '${name}' created at ${appDir}`);
  logger.info(`  - App ID: ${appId}`);
  logger.info(`  - Template: ${template}`);
  logger.info(`  - View at: http://localhost:3001/?app=${appId}`);
  logger.info(`  - Dev: npm run dev (enables hot reload)`);
  logger.info(`  - Edit dist/index.html to customize UI`);
  logger.info(`  - See package.json for npm scripts`);
}
