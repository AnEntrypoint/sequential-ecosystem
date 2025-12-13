/**
 * Flow Documentation Query
 * Query and search flow documentation
 */

export function createFlowDocumentationQuery(storage) {
  return {
    getFlowSummary(flowName) {
      const doc = storage.get(flowName);
      if (!doc) return null;

      return {
        name: doc.name,
        description: doc.description,
        purpose: doc.purpose,
        stateCount: Object.keys(doc.states).length,
        complexity: doc.complexity.complexity,
        happyPath: doc.happyPath
      };
    },

    searchFlows(query) {
      const results = [];

      for (const [name, doc] of storage.all()) {
        const matchesName = name.toLowerCase().includes(query.toLowerCase());
        const matchesDescription = doc.description.toLowerCase().includes(query.toLowerCase());
        const matchesPurpose = doc.purpose.toLowerCase().includes(query.toLowerCase());
        const matchesTag = doc.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));

        if (matchesName || matchesDescription || matchesPurpose || matchesTag) {
          results.push({
            name,
            description: doc.description,
            purpose: doc.purpose,
            complexity: doc.complexity.complexity
          });
        }
      }

      return results;
    }
  };
}
