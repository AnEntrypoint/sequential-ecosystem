import path from 'path';
import { randomUUID } from 'crypto';
import { existsSync } from 'fs';
import { ensureDirectory, writeFileAtomicString } from 'file-operations';
import { generateDatabaseToolTemplate } from './tool-templates/database.js';
import { generateApiToolTemplate } from './tool-templates/api.js';
import { generateComputeToolTemplate } from './tool-templates/compute.js';
import { generateValidationToolTemplate } from './tool-templates/validation.js';
import logger from '@sequential/sequential-logging';
import { nowISO } from '@sequential/timestamp-utilities';

const VALID_TEMPLATES = ['database', 'api', 'compute', 'validation'];

export async function createTool(options) {
  const { name, template = 'compute', description = '', category = 'Custom' } = options;

  if (!VALID_TEMPLATES.includes(template)) {
    throw new Error(`Invalid template: ${template}. Choose from: ${VALID_TEMPLATES.join(', ')}`);
  }

  const toolsDir = path.resolve(process.cwd(), 'tools');
  const toolFile = path.join(toolsDir, `${name}.js`);

  if (existsSync(toolFile)) {
    throw new Error(`Tool '${name}' already exists at ${toolFile}`);
  }

  await ensureDirectory(toolsDir);

  const timestamp = nowISO();
  const toolId = randomUUID();

  let code;
  switch (template) {
    case 'database':
      code = generateDatabaseToolTemplate(name, toolId, timestamp, description, category);
      break;
    case 'api':
      code = generateApiToolTemplate(name, toolId, timestamp, description, category);
      break;
    case 'compute':
      code = generateComputeToolTemplate(name, toolId, timestamp, description, category);
      break;
    case 'validation':
      code = generateValidationToolTemplate(name, toolId, timestamp, description, category);
      break;
  }

  await writeFileAtomicString(toolFile, code);

  logger.info(`✓ Tool '${name}' created at ${toolFile}`);
  logger.info(`  - Template: ${template}`);
  logger.info(`  - Category: ${category}`);
  logger.info(`  - Edit ${toolFile} to implement tool logic`);
  logger.info(`  - Register with AppSDK: sdk.tool('${name}', ${name}, '${description}')`);
  logger.info(`  - Or via API: POST /api/tools with id='${toolId}'`);
}
