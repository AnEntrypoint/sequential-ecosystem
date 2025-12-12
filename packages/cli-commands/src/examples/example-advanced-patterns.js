/**
 * Create Advanced Pattern Examples
 * Demonstrates retry, error handling, parallelization, and state management patterns
 *
 * Delegates to:
 * - advanced-pattern-templates: Template definitions for 4 advanced patterns
 * - advanced-pattern-writer: File writing and config generation
 */

import { ADVANCED_PATTERN_TEMPLATES } from './advanced-pattern-templates.js';
import { writeAdvancedPatternExamples } from './advanced-pattern-writer.js';

export async function createAdvancedPatternExamples(tasksDir) {
  await writeAdvancedPatternExamples(tasksDir, ADVANCED_PATTERN_TEMPLATES);
}
