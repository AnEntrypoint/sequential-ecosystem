/**
 * Flow Documentation Storage
 * Manages documentation storage and retrieval
 */

export function createFlowDocumentationStorage() {
  const flowDocs = new Map();

  return {
    store(flowName, doc) {
      flowDocs.set(flowName, doc);
    },

    get(flowName) {
      return flowDocs.get(flowName);
    },

    has(flowName) {
      return flowDocs.has(flowName);
    },

    all() {
      return Array.from(flowDocs.entries());
    }
  };
}
