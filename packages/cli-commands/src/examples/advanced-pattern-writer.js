/**
 * Advanced Pattern Example Writer
 * Writes example templates to files
 */

import path from 'path';
import { randomUUID } from 'crypto';
import { writeFileAtomicString } from '@sequentialos/file-operations';
import logger from '@sequentialos/sequential-logging';
import { nowISO } from '@sequentialos/timestamp-utilities';

export async function writeAdvancedPatternExamples(tasksDir, examples) {
  for (const example of examples) {
    const taskFile = path.join(tasksDir, example.name, 'code.js');
    const configFile = path.join(tasksDir, example.name, 'config.json');

    await writeFileAtomicString(taskFile, example.code);
    logger.info('  ✓ Created ' + example.name + '/code.js');

    const config = {
      id: randomUUID(),
      name: example.name,
      description: example.description,
      runner: 'sequential-flow',
      created: nowISO()
    };
    await writeFileAtomicString(configFile, JSON.stringify(config, null, 2));
  }
}
