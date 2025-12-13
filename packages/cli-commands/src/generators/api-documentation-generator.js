/**
 * API Documentation Generator
 * Orchestrates documentation generation with multiple format support
 *
 * Delegates to:
 * - documentation-registry: Documentation storage and search
 * - documentation-markdown-formatter: Markdown documentation generation
 * - documentation-openapi-formatter: OpenAPI specification generation
 */

import { createDocumentationRegistry } from './documentation-registry.js';
import { createMarkdownFormatter } from './documentation-markdown-formatter.js';
import { createOpenAPIFormatter } from './documentation-openapi-formatter.js';

export function createDocumentationGenerator() {
  const registry = createDocumentationRegistry();
  const markdownFormatter = createMarkdownFormatter();
  const openAPIFormatter = createOpenAPIFormatter();

  return {
    register(resourceType, resourceName, documentation) {
      registry.register(resourceType, resourceName, documentation);
      return this;
    },

    getDocumentation(resourceType, resourceName) {
      return registry.get(resourceType, resourceName);
    },

    generateMarkdown(resourceType, resourceName) {
      const doc = this.getDocumentation(resourceType, resourceName);
      return markdownFormatter.format(doc);
    },

    generateOpenAPI(resourceType, resourceName) {
      const doc = this.getDocumentation(resourceType, resourceName);
      return openAPIFormatter.format(doc);
    },

    listAll() {
      return registry.listAll();
    },

    search(query) {
      return registry.search(query);
    }
  };
}
