import fs from 'fs';
import path from 'path';
import logger from '@sequentialos/sequential-logging';
import { createBoilerplateServices } from './service-creation.js';

export function findServicesDir() {
  let current = process.cwd();
  const root = path.parse(current).root;

  while (current !== root) {
    const servicesPath = path.join(current, 'services');
    if (fs.existsSync(servicesPath) && fs.statSync(servicesPath).isDirectory()) {
      return servicesPath;
    }
    current = path.dirname(current);
  }

  return null;
}

export function discoverServices() {
  let servicesDir = findServicesDir();

  if (!servicesDir) {
    logger.info('⚠️  No services directory found');
    servicesDir = createBoilerplateServices();
    logger.info('✅ Boilerplate created, discovering services...\n');
  }

  const services = {};
  const entries = fs.readdirSync(servicesDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const servicePath = path.join(servicesDir, entry.name);
    const hasIndex = fs.existsSync(path.join(servicePath, 'index.ts')) ||
                     fs.existsSync(path.join(servicePath, 'index.js'));

    if (hasIndex) {
      services[entry.name] = {
        path: servicePath,
        name: entry.name,
        port: null
      };
    }
  }

  return { services, servicesDir };
}
