/**
 * Task Input Validator
 * Creates validators for task input validation
 *
 * Delegates to:
 * - task-input-validator-factory: Validator factory with schema registration
 * - task-input-validator-template: Template code generation
 */

import { createTaskInputValidator } from './task-input-validator-factory.js';
import { generateTaskInputValidatorTemplate } from './task-input-validator-template.js';

export { createTaskInputValidator, generateTaskInputValidatorTemplate };
