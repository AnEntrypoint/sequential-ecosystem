#!/usr/bin/env node

import logger from '@sequentialos/sequential-logging';
import { nowISO } from '@sequentialos/timestamp-utilities';
import { SequentialMachineAdapter } from './lib/index.js';
import fs from 'fs';
import path from 'path';
import { loadServices, getService, getServiceNames } from './service-registry-loader.js';
import { callService, checkServiceHealth } from './service-http-client.js';
import { saveServiceResult, listServiceResults, getLayerServiceResults } from './service-result-manager.js';
import { handleCallCommand, handleBatchServicesCommand, handleHealthCommand, handleRestoreCheckpointCommand, printHelp } from './cli-command-handler.js';

/**
 * Facade maintaining 100% backward compatibility with ServiceClient
 */
class ServiceClient {
  constructor(machine, options = {}) {
    this.machine = machine;
    this.options = {
      servicesRegistry: '.service-registry.json',
      servicesDir: './services',
      basePort: 3100,
      timeout: 30000,
      ...options
    };
    const registryPath = path.resolve(this.options.servicesRegistry);
    this.services = loadServices(registryPath);
  }

  async callService(serviceName, method, params = {}) {
    const service = getService(this.services, serviceName);
    return await callService(service.url, method, params, this.options.timeout);
  }

  async executeServiceCall(serviceName, method, params = {}) {
    const instruction = `echo 'Calling ${serviceName}.${method}...' && node -e "
const fs = require('fs');
const path = require('path');

async function callService() {
  try {
    const response = await fetch('${this.services[serviceName]?.url}/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: '${method}',
        params: ${JSON.stringify(params)},
        timestamp: nowISO()
      })
    });

    if (!response.ok) {
      throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(\`Service error: \${result.error || 'Unknown error'}\`);
    }

    const resultFile = '${serviceName}-${method}-' + Date.now() + '.json';
    const resultPath = path.join(process.cwd(), resultFile);

    fs.writeFileSync(resultPath, JSON.stringify({
      service: '${serviceName}',
      method: '${method}',
      params: ${JSON.stringify(params)},
      result: result,
      timestamp: nowISO(),
      success: true
    }, null, 2));

    logger.info('💾 Service result written to: ' + resultFile);
  } catch (error) {
    logger.error('❌ Service call failed:', error.message);
    process.exit(1);
  }
}

callService();
"`;

    return await this.machine.execute(instruction);
  }

  async executeWithCheckpoint(instruction, serviceName = null, method = null, params = {}) {
    const result = await this.machine.execute(instruction);

    if (serviceName && method) {
      const serviceResult = await this.callService(serviceName, method, params);
      const checkpointFile = saveServiceResult(
        this.machine.options.workdir,
        serviceName,
        method,
        params,
        serviceResult,
        instruction,
        result.layer
      );

      const checkpointName = `after-${serviceName}-${method}`;
      await this.machine.checkpoint(checkpointName);
      logger.info(`🏁 Checkpoint created: ${checkpointName}`);

      return {
        ...result,
        serviceResult,
        checkpointFile,
        checkpointName
      };
    }

    return result;
  }

  async batchWithServices(instructions) {
    const results = [];

    for (const instruction of instructions) {
      let result;

      if (typeof instruction === 'string') {
        result = await this.machine.execute(instruction);
      } else if (instruction.service && instruction.method) {
        result = await this.executeWithCheckpoint(
          instruction.instruction || `service-call-${instruction.service}-${instruction.method}`,
          instruction.service,
          instruction.method,
          instruction.params
        );
      } else {
        throw new Error(`Invalid instruction format: ${JSON.stringify(instruction)}`);
      }

      results.push(result);
    }

    return results;
  }

  listServices() {
    logger.info('📋 Available Services:');
    logger.info('─'.repeat(50));

    const serviceNames = getServiceNames(this.services);
    if (serviceNames.length === 0) {
      logger.info('❌ No services loaded');
      return;
    }

    for (const name of serviceNames) {
      const service = this.services[name];
      logger.info(`${name.padEnd(20)} → ${service.url}`);
    }

    logger.info('─'.repeat(50));
  }

  async checkServiceHealth(serviceName = null) {
    if (serviceName) {
      const service = getService(this.services, serviceName);
      return await checkServiceHealth(service.url, serviceName);
    } else {
      logger.info('🏥 Checking Service Health:');
      logger.info('─'.repeat(40));

      const results = {};
      for (const name of getServiceNames(this.services)) {
        results[name] = await this.checkServiceHealth(name);
      }

      return results;
    }
  }

  listServiceResults() {
    listServiceResults(this.machine.options.workdir);
  }

  async restoreFromServiceCheckpoint(checkpointName) {
    const checkpoints = this.machine.listCheckpoints();
    const checkpointHash = checkpoints[checkpointName];

    if (!checkpointHash) {
      throw new Error(`Checkpoint not found: ${checkpointName}. Available: ${Object.keys(checkpoints).join(', ')}`);
    }

    await this.machine.restoreCheckpoint(checkpointName);
    logger.info(`🔄 Restored to checkpoint: ${checkpointName}`);
    getLayerServiceResults(this.machine.options.workdir);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];

  const machine = new SequentialMachineAdapter();
  await machine.initialize();

  const client = new ServiceClient(machine);

  try {
    switch (cmd) {
      case 'call':
        await handleCallCommand(args, client);
        break;

      case 'batch-services':
        await handleBatchServicesCommand(args, client);
        break;

      case 'services':
        client.listServices();
        break;

      case 'health':
        await handleHealthCommand(args, client);
        break;

      case 'results':
        client.listServiceResults();
        break;

      case 'restore-checkpoint':
        await handleRestoreCheckpointCommand(args, client);
        break;

      default:
        printHelp();
    }
  } catch (error) {
    exit(error.message);
  }
}

function exit(msg) {
  logger.error(msg);
  process.exit(1);
}

main().catch(err => {
  logger.error('❌ Error:', err.message);
  process.exit(1);
});
