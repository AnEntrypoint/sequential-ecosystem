/**
 * API Documentation Factory
 * Documentation generator factory and template generation
 *
 * Delegates to:
 * - api-documentation-generator: Factory for documentation creation and formatting
 * - api-documentation-template: Template code generation
 */

import { createDocumentationGenerator } from './api-documentation-generator.js';
import { generateDocumentationTemplate } from './api-documentation-template.js';

export { createDocumentationGenerator, generateDocumentationTemplate };
