import path from 'path';
import { existsSync } from 'fs';
import { ensureDirectory, writeFileAtomicJson, writeFileAtomicString } from '@sequential/file-operations';
import { generateGitignore, generateSequentialrc } from '../templates.js';
import { generateTechnicalDocumentation } from '../generators/documentation-generator.js';

export async function initCommand(options) {
  try {
    const paths = [
      path.join(process.cwd(), 'tasks'),
      path.join(process.cwd(), 'tools')
    ];

    for (const p of paths) {
      if (!existsSync(p)) {
        await ensureDirectory(p);
        console.log(`✓ Created ${p}`);
      }
    }

    const configFile = path.join(process.cwd(), '.sequentialrc.json');
    if (!existsSync(configFile)) {
      await writeFileAtomicJson(configFile, {
        adaptor: 'folder',
        defaults: {}
      });
      console.log(`✓ Created ${configFile}`);
    }

    const docContent = generateTechnicalDocumentation();
    const docFiles = ['README.md', 'CLAUDE.md', 'AGENTS.md', 'GEMINI.md'];
    for (const fileName of docFiles) {
      const docPath = path.join(process.cwd(), fileName);
      await writeFileAtomicString(docPath, docContent);
      console.log(`✓ Created ${docPath}`);
    }

    const gitignorePath = path.join(process.cwd(), '.gitignore');
    const gitignoreContent = generateGitignore();
    await writeFileAtomicString(gitignorePath, gitignoreContent);
    console.log(`✓ Created ${gitignorePath}`);

    const sequentialrcPath = path.join(process.cwd(), '.sequentialrc.json');
    const sequentialrcConfig = generateSequentialrc();
    await writeFileAtomicJson(sequentialrcPath, sequentialrcConfig);
    console.log(`✓ Created ${sequentialrcPath}`);

    if (options.examples !== false) {
      const { createExamples } = await import('../create-examples.js');
      const { createExampleApps } = await import('../examples/create-apps.js');

      await createExamples();

      const appsDir = path.join(process.cwd(), '.sequential', 'apps');
      await ensureDirectory(appsDir);
      console.log('\n📱 Creating example apps:');
      await createExampleApps(appsDir);
    }

    console.log('\n✅ Initialized sequential-ecosystem');
    console.log('\n📦 Quick Commands:');
    console.log('  npx sequential-ecosystem create-task <name>');
    console.log('  npx sequential-ecosystem run <name> --input \'{}\'');
    console.log('  npx sequential-ecosystem gui');

    if (options.examples !== false) {
      console.log('\n📚 Example Tasks (./tasks/):');
      console.log('  - example-simple-flow: Sequential-JS with auto-pause');
      console.log('  - example-api-integration: HTTP client with retry logic');
      console.log('  - example-batch-processing: Batch with progress tracking');
      console.log('  - example-payment-flow: Complex state machine');
      console.log('  - example-resumable-task: Checkpointing & resumption');

      console.log('\n🔧 Example Tools (./tools/):');
      console.log('  - database.js: Database operations');
      console.log('  - api-client.js: HTTP client with backoff');
      console.log('  - filesystem.js: File operations');

      console.log('\n📱 Example Apps (./.sequential/apps/):');
      console.log('  - dashboard: Task monitoring interface');
      console.log('  - docs: Quick reference guide');

      console.log('\n🚀 Try it out:');
      console.log('  npx sequential-ecosystem run example-simple-flow --input \'{}\'');
      console.log('  npx sequential-ecosystem gui  # Visual Desktop GUI with example apps');
    }

    console.log('\n📖 Documentation:');
    console.log('  - README.md: Quick start guide');
    console.log('  - CLAUDE.md: For Claude Code integration');
    console.log('  - AGENTS.md: Agent patterns');
    console.log('  - GEMINI.md: AI integration examples');
  } catch (e) {
    console.error('Error:', e instanceof Error ? e.message : String(e));
    process.exit(1);
  }
}
