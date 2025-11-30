import fs from 'fs';
import path from 'path';

export async function initCommand(options) {
  try {
    const paths = [
      path.join(process.cwd(), 'tasks'),
      path.join(process.cwd(), 'tools')
    ];

    for (const p of paths) {
      if (!fs.existsSync(p)) {
        fs.mkdirSync(p, { recursive: true });
        console.log(`✓ Created ${p}`);
      }
    }

    const configFile = path.join(process.cwd(), '.sequentialrc.json');
    if (!fs.existsSync(configFile)) {
      fs.writeFileSync(configFile, JSON.stringify({
        adaptor: 'default',
        defaults: {}
      }, null, 2));
      console.log(`✓ Created ${configFile}`);
    }

    if (options.examples !== false) {
      const { createExamples } = await import('../create-examples.js');
      await createExamples();
    }

    console.log('\n✓ Initialized sequential-ecosystem');
    console.log('Create a task: npx sequential-ecosystem create-task <name> [--runner flow|machine]');
    console.log('Run a task: npx sequential-ecosystem run <name> --input \'{}\'');
    if (options.examples !== false) {
      console.log('\n📚 Example tasks created in ./tasks/:');
      console.log('  - example-simple-flow: Basic async operations');
      console.log('  - example-complex-flow: State machine with error handling');
      console.log('  - example-api-integration: Service integration patterns');
      console.log('  - example-batch-processing: Retry and batch patterns');
      console.log('\nRun examples: npx sequential-ecosystem run example-simple-flow --input \'{"message":"hello"}\'');
    }
  } catch (e) {
    console.error('Error:', e instanceof Error ? e.message : String(e));
    process.exit(1);
  }
}
