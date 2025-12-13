/**
 * relationship-summarizer.js
 *
 * Generate relationship summaries and statistics
 */

export function createRelationshipSummarizer(index) {
  return {
    getAllRelationships() {
      const summary = {
        totalEntities: index.relationships.size,
        byType: {},
        highestImpact: [],
        orphaned: []
      };

      for (const entity of index.relationships.values()) {
        if (!summary.byType[entity.type]) {
          summary.byType[entity.type] = 0;
        }
        summary.byType[entity.type]++;

        const consumers = index.dependencyGraph.get(entity.name) || [];
        if (consumers.length > 0) {
          summary.highestImpact.push({
            name: entity.name,
            impactCount: consumers.length,
            type: entity.type
          });
        } else if (entity.dependencies.length === 0) {
          summary.orphaned.push({ name: entity.name, type: entity.type });
        }
      }

      summary.highestImpact.sort(function(a, b) { return b.impactCount - a.impactCount; });
      summary.highestImpact = summary.highestImpact.slice(0, 10);

      return summary;
    }
  };
}
