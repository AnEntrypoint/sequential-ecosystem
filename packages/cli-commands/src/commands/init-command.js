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
    console.log('\n📦 Quick Commands:');
    console.log('  npx sequential-ecosystem create-task <name> [--runner flow|machine]');
    console.log('  npx sequential-ecosystem run <name> --input \'{}\'');
    console.log('  npx sequential-ecosystem gui');

    if (options.examples !== false) {
      console.log('\n📚 Example Tasks (./tasks/):');
      console.log('  - example-simple-flow: Sequential-JS with auto-pause');
      console.log('  - example-complex-flow: FlowState with explicit state machine');
      console.log('  - example-api-integration: HTTP client with retry logic');
      console.log('  - example-batch-processing: Concurrency control and batching');
      console.log('  - example-sequential-os: Container-based with layer management');

      console.log('\n🔧 Example Tools (./tools/):');
      console.log('  - database.js: Database operations (query, insert, update, delete)');
      console.log('  - api-client.js: HTTP client with retry and backoff');
      console.log('  - filesystem.js: File operations with safety checks');

      console.log('\n🔄 Example Flows (./tasks/flows/):');
      console.log('  - user-authentication.json: Authentication workflow');
      console.log('  - data-pipeline.json: ETL processing pipeline');
      console.log('  - order-processing.json: E-commerce order flow');

      console.log('\n🚀 Try it out:');
      console.log('  npx sequential-ecosystem run example-simple-flow --input \'{"message":"hello"}\'');
      console.log('  npx sequential-ecosystem gui  # Visual Desktop GUI');
      console.log('\n📖 Read: ./tasks/EXAMPLES.md for detailed documentation');
    }
  } catch (e) {
    console.error('Error:', e instanceof Error ? e.message : String(e));
    process.exit(1);
  }
}
