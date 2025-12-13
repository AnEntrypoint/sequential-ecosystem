/**
 * Create Advanced Tool Examples
 * Demonstrates cache manager, validator helper, and rate limiter tools
 *
 * Delegates to:
 * - advanced-tools-templates: Template definitions for 3 advanced tools
 * - advanced-tools-writer: File writing
 */

import { ADVANCED_TOOLS_TEMPLATES } from './advanced-tools-templates.js';
import { writeAdvancedToolExamples } from './advanced-tools-writer.js';

export async function createAdvancedToolExamples(toolsDir) {
  await writeAdvancedToolExamples(toolsDir, ADVANCED_TOOLS_TEMPLATES);
}
