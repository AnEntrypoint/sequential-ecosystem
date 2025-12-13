/**
 * Advanced Tools Writer
 * Writes advanced tool templates to files
 */

import path from 'path';
import { writeFileAtomicString } from '@sequentialos/file-operations';
import logger from '@sequentialos/sequential-logging';

export async function writeAdvancedToolExamples(toolsDir, tools) {
  for (const tool of tools) {
    const filePath = path.join(toolsDir, tool.name);
    await writeFileAtomicString(filePath, tool.content);
    logger.info('  ✓ Created ' + tool.name);
  }
}
