/**
 * Tool Dependencies Manager
 * Manages tool dependencies parsing, validation, and code generation
 *
 * Delegates to:
 * - tool-dependency-parser: Parses and validates tool dependencies
 * - tool-dependency-generator: Generates tool code and package.json
 */

import { parseToolDependencies, validateToolDependencies } from './tool-dependency-parser.js';
import { generateToolWithDependencies, generateToolPackageJson } from './tool-dependency-generator.js';

export { parseToolDependencies, validateToolDependencies, generateToolWithDependencies, generateToolPackageJson };
