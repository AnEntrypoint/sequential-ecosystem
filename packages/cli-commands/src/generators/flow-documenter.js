/**
 * Flow Documenter
 * Creates and manages flow documentation
 *
 * Delegates to:
 * - flow-documentation-storage: Documentation persistence
 * - flow-state-documenter: State documentation creation
 * - flow-documentation-query: Search and retrieval queries
 */

import { createFlowDocumentationStorage } from './flow-documentation-storage.js';
import { createFlowStateDocumenter } from './flow-state-documenter.js';
import { createFlowDocumentationQuery } from './flow-documentation-query.js';

export function createFlowDocumenter() {
  const storage = createFlowDocumentationStorage();
  const documenter = createFlowStateDocumenter();
  const query = createFlowDocumentationQuery(storage);

  return {
    documentFlow(flowName, graph, metadata = {}) {
      const doc = documenter.documentFlow(flowName, graph, metadata);
      storage.store(flowName, doc);
      return this;
    },

    getFlowDocumentation(flowName) {
      return storage.get(flowName);
    },

    getFlowSummary: query.getFlowSummary.bind(query),
    searchFlows: query.searchFlows.bind(query)
  };
}
