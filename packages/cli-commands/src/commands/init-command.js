import path from 'path';
import { createCLICommand } from '@sequential/cli-handler';
import { existsSync } from 'fs';
import { ensureDirectory, writeFileAtomicJson, writeFileAtomicString } from '@sequential/file-operations';
import { generateGitignore, generateSequentialrc } from '../templates.js';
import { generateTechnicalDocumentation } from '../generators/documentation-generator.js';
import logger from '@sequential/sequential-logging';
import { delay, withRetry } from '@sequential/async-patterns';

export async function initCommand(options) {
  try {
    const paths = [
      path.join(process.cwd(), 'tasks'),
      path.join(process.cwd(), 'tools')
    ];

    for (const p of paths) {
      if (!existsSync(p)) {
        await ensureDirectory(p);
        logger.info(`✓ Created ${p}`);
      }
    }

    const configFile = path.join(process.cwd(), '.sequentialrc.json');
    if (!existsSync(configFile)) {
      await writeFileAtomicJson(configFile, {
        adaptor: 'folder',
        defaults: {}
      });
      logger.info(`✓ Created ${configFile}`);
    }

    const docContent = generateTechnicalDocumentation();
    const docFiles = ['README.md', 'CLAUDE.md', 'AGENTS.md', 'GEMINI.md'];
    for (const fileName of docFiles) {
      const docPath = path.join(process.cwd(), fileName);
      await writeFileAtomicString(docPath, docContent);
      logger.info(`✓ Created ${docPath}`);
    }

    const gitignorePath = path.join(process.cwd(), '.gitignore');
    const gitignoreContent = generateGitignore();
    await writeFileAtomicString(gitignorePath, gitignoreContent);
    logger.info(`✓ Created ${gitignorePath}`);

    const sequentialrcPath = path.join(process.cwd(), '.sequentialrc.json');
    const sequentialrcConfig = generateSequentialrc();
    await writeFileAtomicJson(sequentialrcPath, sequentialrcConfig);
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
    logger.info('\n📦 Quick Commands:');
    logger.info('  npx sequential-ecosystem create-task <name>');
    logger.info('  npx sequential-ecosystem run <name> --input \'{}\'');
    logger.info('  npx sequential-ecosystem gui');

    if (options.examples !== false) {
      logger.info('\n📚 Example Tasks (./tasks/):');
      logger.info('  - example-simple-flow: Sequential-JS with auto-pause');
      logger.info('  - example-api-integration: HTTP client with retry logic');
      logger.info('  - example-batch-processing: Batch with progress tracking');
      logger.info('  - example-payment-flow: Complex state machine');
      logger.info('  - example-resumable-task: Checkpointing & resumption');

      logger.info('\n🔧 Example Tools (./tools/):');
      logger.info('  - database.js: Database operations');
      logger.info('  - api-client.js: HTTP client with backoff');
      logger.info('  - filesystem.js: File operations');

      logger.info('\n📱 Example Apps (./.sequential/apps/):');
      logger.info('  - dashboard: Task monitoring interface');
      logger.info('  - docs: Quick reference guide');

      logger.info('\n🚀 Try it out:');
      logger.info('  npx sequential-ecosystem run example-simple-flow --input \'{}\'');
      logger.info('  npx sequential-ecosystem gui  # Visual Desktop GUI with example apps');
    }

    logger.info('\n📖 Documentation:');
    logger.info('  - README.md: Quick start guide');
    logger.info('  - CLAUDE.md: For Claude Code integration');
    logger.info('  - AGENTS.md: Agent patterns');
    logger.info('  - GEMINI.md: AI integration examples');
  } catch (e) {
    logger.error('Error:', e instanceof Error ? e.message : String(e));
    process.exit(1);
  }
}
