import path from 'path';
import { writeFileAtomicString } from '@sequentialos/file-operations';
import logger from '@sequentialos/sequential-logging';
import { getTaskDashboardHtml } from './app-generators/task-dashboard-generator.js';
import { getFlowVisualizerHtml } from './app-generators/flow-visualizer-generator.js';
import { getTaskExplorerHtml } from './app-generators/task-explorer-generator.js';

const MANIFEST_TEMPLATE = {
  version: '1.0.0',
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

const APP_CONFIGS = [
  {
    name: 'task-dashboard',
    title: 'Task Dashboard',
    icon: '📊',
    description: 'Monitor and execute tasks in real-time',
    generator: getTaskDashboardHtml
  },
  {
    name: 'flow-visualizer',
    title: 'Flow Visualizer',
    icon: '🔀',
    description: 'Visualize and debug flow execution',
    generator: getFlowVisualizerHtml
  },
  {
    name: 'task-explorer',
    title: 'Task Explorer',
    icon: '🔍',
    description: 'Browse all available tasks and tools',
    generator: getTaskExplorerHtml
  }
];

export async function createExampleApps(appsDir) {
  for (const app of APP_CONFIGS) {
    const appDir = path.join(appsDir, app.name);
    const distDir = path.join(appDir, 'dist');
    const manifestPath = path.join(appDir, 'manifest.json');

    const manifest = {
      id: `app-${app.name}`,
      name: app.title,
      description: app.description,
      icon: app.icon,
      ...MANIFEST_TEMPLATE
    };

    await writeFileAtomicString(manifestPath, JSON.stringify(manifest, null, 2));

    const html = app.generator(app.title, app.icon, app.description);
    const htmlPath = path.join(distDir, 'index.html');
    await writeFileAtomicString(htmlPath, html);

    logger.info(`  ✓ ${app.title} (app-${app.name})`);
  }
}
