import fs from 'fs';
import path from 'path';
import logger from '@sequentialos/sequential-logging';
import { nowISO } from '@sequentialos/sequential-utils/timestamps';

export async function startServices(servicesList, servicesDir, config) {
  logger.info('🚀 Starting Wrapped Services');
  logger.info(`📦 Runtime: ${config.runtime}`);
  logger.info(`🔧 Services: ${servicesList.map(s => s.name).join(', ')}`);
  logger.info(`📁 Services Dir: ${servicesDir}`);
  logger.info('');

  const processes = [];

  for (const service of servicesList) {
    logger.info(`⏳ Starting ${service.name} on port ${service.port}...`);

    const entryScript = path.join(service.path, 'index.ts');

    if (!fs.existsSync(entryScript)) {
      logger.warn(`⚠️  No entry point found for ${service.name}`);
      continue;
    }

    processes.push({
      name: service.name,
      port: service.port,
      url: `http://localhost:${service.port}`
    });
  }

  logger.info('\n✅ Services Ready');
  logger.info('─'.repeat(60));
  for (const proc of processes) {
    logger.info(`${proc.name.padEnd(25)} → ${proc.url}`);
  }
  logger.info('─'.repeat(60));

  const registryPath = path.join(process.cwd(), '.service-registry.json');
  fs.writeFileSync(registryPath, JSON.stringify({
    timestamp: nowISO(),
    servicesDir: servicesDir,
    services: processes
  }, null, 2));

  logger.info(`\n📝 Registry: ${registryPath}`);
  logger.info('\nPress Ctrl+C to stop all services\n');

  await new Promise(resolve => {
    process.on('SIGINT', () => {
      logger.info('\n\n👋 Stopping services...');
      process.exit(0);
    });
  });
}
