import path from 'path';
import { randomUUID } from 'crypto';
import { existsSync } from 'fs';
import { ensureDirectory, writeFileAtomicString } from '@sequential/file-operations';
import { generateFlowTemplate } from './flow-templates/basic.js';
import logger from '@sequential/sequential-logging';
import { nowISO } from '@sequential/timestamp-utilities';

export async function createFlow(options) {
  const { name, states = 3, description = '' } = options;

  const flowsDir = path.resolve(process.cwd(), 'flows');
  const flowFile = path.join(flowsDir, `${name}.js`);

  if (existsSync(flowFile)) {
    throw new Error(`Flow '${name}' already exists at ${flowFile}`);
  }

  await ensureDirectory(flowsDir);

  const timestamp = nowISO();
  const flowId = randomUUID();
  const stateCount = Math.max(1, Math.min(parseInt(states) || 3, 20));

  const code = generateFlowTemplate(name, flowId, timestamp, stateCount, description);

  await writeFileAtomicString(flowFile, code);

  logger.info(`✓ Flow '${name}' created at ${flowFile}`);
  logger.info(`  - Flow ID: ${flowId}`);
  logger.info(`  - States: ${stateCount}`);
  logger.info(`  - Edit ${flowFile} to implement state handlers`);
  logger.info(`  - Run with: npx sequential-ecosystem run ${name} --input '{}'`);
}
