import path from 'path';
import { createCLICommand } from '@sequential/cli-handler';
import { existsSync } from 'fs';
import { ensureDirectory, writeFileAtomicJson, writeFileAtomicString } from 'file-operations';
import { generateGitignore, generateSequentialrc } from '../templates.js';
import { generateTechnicalDocumentation } from '../generators/documentation-generator.js';
import { generateQuickstart } from '../generators/quickstart-generator.js';
import logger from '@sequential/sequential-logging';

export const initCommand = createCLICommand(async (options) => {
  const paths = [path.join(process.cwd(), 'tasks'), path.join(process.cwd(), 'tools')];
  for (const p of paths) {
    if (!existsSync(p)) {
      await ensureDirectory(p);
      logger.info(`✓ Created ${p}`);
    }
  }

  const configFile = path.join(process.cwd(), '.sequentialrc.json');
  if (!existsSync(configFile)) {
    await writeFileAtomicJson(configFile, { adaptor: 'folder', defaults: {} });
    logger.info(`✓ Created ${configFile}`);
  }

  const docContent = generateTechnicalDocumentation();
  const docFiles = ['README.md', 'CLAUDE.md', 'AGENTS.md', 'GEMINI.md'];
  for (const fileName of docFiles) {
    const docPath = path.join(process.cwd(), fileName);
    await writeFileAtomicString(docPath, docContent);
    logger.info(`✓ Created ${docPath}`);
  }

  const quickstartContent = generateQuickstart();
  const quickstartPath = path.join(process.cwd(), 'QUICKSTART.md');
  await writeFileAtomicString(quickstartPath, quickstartContent);
  logger.info(`✓ Created ${quickstartPath}`);

  const gitignorePath = path.join(process.cwd(), '.gitignore');
  await writeFileAtomicString(gitignorePath, generateGitignore());
  logger.info(`✓ Created ${gitignorePath}`);

  const sequentialrcPath = path.join(process.cwd(), '.sequentialrc.json');
  await writeFileAtomicJson(sequentialrcPath, generateSequentialrc());
  logger.info(`✓ Created ${sequentialrcPath}`);

  if (options.examples !== false) {
    const { createExamples } = await import('../create-examples.js');
    const { createExampleApps } = await import('../examples/create-apps.js');
    await createExamples();
    const appsDir = path.join(process.cwd(), '.sequential', 'apps');
    await ensureDirectory(appsDir);
    logger.info('\n📱 Creating example apps:');
    await createExampleApps(appsDir);
  }

  logger.info('\n✅ Initialized sequential-ecosystem');
  logger.info('\n🎯 START HERE:');
  logger.info('  📖 Read: QUICKSTART.md (2-minute guide to GUI)');
  logger.info('  🚀 Run:  npx sequential-ecosystem gui');
  logger.info('  🌐 Open: http://localhost:3001');

  logger.info('\n📦 Available Commands:');
  logger.info('  npx sequential-ecosystem gui            # Launch visual desktop (recommended)');
  logger.info('  npx sequential-ecosystem server         # API server only');
  logger.info('  npx sequential-ecosystem create-task    # New task from template');
  logger.info('  npx sequential-ecosystem list           # Show all tasks');

  if (options.examples !== false) {
    logger.info('\n📚 What\'s Included:');
    logger.info('  ✓ 5 example tasks in ./tasks/');
    logger.info('    - example-simple-flow');
    logger.info('    - example-api-integration');
    logger.info('    - example-batch-processing');
    logger.info('    - example-payment-flow');
    logger.info('    - example-resumable-task');
    logger.info('  ✓ 3 example tools in ./tools/');
    logger.info('  ✓ 7 pre-built components in visual builder');
    logger.info('  ✓ Example apps in ./.sequential/apps/');
  }

  logger.info('\n📖 Documentation Files:');
  logger.info('  - QUICKSTART.md: Start here! (GUI-focused guide)');
  logger.info('  - README.md: Full technical reference (all patterns & API)');
  logger.info('  - CLAUDE.md: Claude Code & AI integration');
  logger.info('  - AGENTS.md: Agent and LLM patterns');
  logger.info('  - GEMINI.md: Google AI integration');

  logger.info('\n💡 Pro Tips:');
  logger.info('  - GUI is the main interface - everything is visual');
  logger.info('  - Click "Task Explorer" to run examples');
  logger.info('  - Click "Component Builder" to drag-drop UI');
  logger.info('  - Click "Debugger" to see execution flow in real-time');
  logger.info('  - All changes auto-save to your project');
});
