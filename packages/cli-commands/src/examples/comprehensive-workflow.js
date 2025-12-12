/**
 * Create Comprehensive Workflow Examples
 * Demonstrates task/tool composition, helper tasks, and API integration
 *
 * Delegates to:
 * - comprehensive-workflow-templates: Template definitions for 5 workflow examples
 * - comprehensive-workflow-writer: File writing and config generation
 */

import { COMPREHENSIVE_WORKFLOW_TEMPLATES } from './comprehensive-workflow-templates.js';
import { writeComprehensiveWorkflowExamples } from './comprehensive-workflow-writer.js';

export async function createComprehensiveWorkflowExample(tasksDir) {
  await writeComprehensiveWorkflowExamples(tasksDir, COMPREHENSIVE_WORKFLOW_TEMPLATES);
}
