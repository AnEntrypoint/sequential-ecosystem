/**
 * flow-docs-render.js - Flow Documentation Facade
 *
 * Delegates to focused modules:
 * - diagram-builder: Generate ASCII flow diagrams
 * - markdown-generator: Generate markdown documentation
 * - template-scaffolder: Generate template examples
 */

export { generateFlowDiagram } from './diagram-builder.js';
export { generateFlowMarkdown } from './markdown-generator.js';
export { generateFlowDocsTemplate } from './template-scaffolder.js';
