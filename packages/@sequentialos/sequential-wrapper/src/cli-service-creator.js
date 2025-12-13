import fs from 'fs';
import path from 'path';
import logger from '@sequentialos/sequential-logging';
import { generateServiceConfig } from './cli-config-gen.js';
import { generateServiceCode, generateDenoJson, generateReadme } from './cli-code-gen.js';

export async function createService(config) {
  const servicePath = path.join(config.outputDir, config.library);

  if (fs.existsSync(servicePath) && !config.force) {
    logger.error(`❌ Service directory already exists: ${servicePath}`);
    logger.error('   Use --force to overwrite');
    process.exit(1);
  }

  logger.info(`📁 Creating service directory: ${servicePath}`);
  fs.mkdirSync(servicePath, { recursive: true });

  try {
    const serviceConfig = generateServiceConfig(config.library, config.port);
    fs.writeFileSync(
      path.join(servicePath, 'config.json'),
      JSON.stringify(serviceConfig, null, 2)
    );
    logger.info('  ✅ config.json');

    const serviceCode = generateServiceCode(config.library);
    fs.writeFileSync(
      path.join(servicePath, 'index.ts'),
      serviceCode
    );
    logger.info('  ✅ index.ts');

    const denoJson = generateDenoJson(config.library);
    fs.writeFileSync(
      path.join(servicePath, 'deno.json'),
      JSON.stringify(denoJson, null, 2)
    );
    logger.info('  ✅ deno.json');

    const readme = generateReadme(config.library, config.port);
    fs.writeFileSync(
      path.join(servicePath, 'README.md'),
      readme
    );
    logger.info('  ✅ README.md');

    fs.writeFileSync(
      path.join(servicePath, '.gitignore'),
      'node_modules/\ndeno.lock\n.env\n'
    );
    logger.info('  ✅ .gitignore');

    logger.info('\n✅ Service created successfully!\n');
    logger.info('📝 Next steps:');
    logger.info('\n1. Edit credentials in config.json');
    logger.info('\n2. Start the service:');
    logger.info(`   cd ${servicePath}`);
    logger.info('   deno run --allow-all --allow-env index.ts\n');
    logger.info('3. Or use with tasker CLI:');
    logger.info(`   npx tasker --services ${config.library}\n`);
  } catch (error) {
    logger.error('❌ Failed to create service:', error.message);
    process.exit(1);
  }
}
