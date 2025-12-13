import fs from 'fs';
import path from 'path';
import logger from '@sequentialos/sequential-logging';
import { boilerplateServices } from './boilerplate-services.js';

export function createBoilerplateServices() {
  const servicesDir = path.join(process.cwd(), 'services');

  if (fs.existsSync(servicesDir)) {
    return servicesDir;
  }

  logger.info('📦 Creating boilerplate services directory...\n');

  fs.mkdirSync(servicesDir, { recursive: true });

  for (const [serviceName, files] of Object.entries(boilerplateServices)) {
    const serviceDir = path.join(servicesDir, serviceName);
    fs.mkdirSync(serviceDir, { recursive: true });

    for (const [fileName, content] of Object.entries(files)) {
      const filePath = path.join(serviceDir, fileName);
      fs.writeFileSync(filePath, content);
    }

    logger.info(`✅ Created service: ${serviceName}`);
  }

  logger.info(`\n📁 Services created at: ${servicesDir}\n`);
  logger.info('Each service has:');
  logger.info('  - /health endpoint for health checks');
  logger.info('  - /call endpoint for service calls');
  logger.info('  - Deno-compatible TypeScript implementation\n');

  return servicesDir;
}
