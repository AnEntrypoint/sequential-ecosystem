/**
 * relationship-analyzer.js
 *
 * Analyze relationship graphs and transitive dependencies
 */

export function createRelationshipAnalyzer(index, querier) {
  return {
    getGraph(entityName) {
      const directDeps = querier.getDependencies(entityName);
      const directConsumers = querier.getConsumers(entityName);

      const transitiveConsumers = new Set();
      const queue = [entityName];
      const visited = new Set();

      while (queue.length > 0) {
        const current = queue.shift();
        if (visited.has(current)) continue;
        visited.add(current);

        const currentConsumers = index.dependencyGraph.get(current) || [];
        for (const consumer of currentConsumers) {
          transitiveConsumers.add(consumer);
          queue.push(consumer);
        }
      }

      return {
        entity: entityName,
        directDependencies: directDeps.dependencies,
        directConsumers: directConsumers.consumers,
        transitiveConsumers: Array.from(transitiveConsumers).map(function(name) {
          const entity = index.relationships.get(name);
          return { name: name, type: entity ? entity.type : 'unknown' };
        }),
        totalImpact: transitiveConsumers.size
      };
    },

    getRelationshipPath(from, to) {
      if (!index.relationships.has(from) || !index.relationships.has(to)) {
        return null;
      }

      const queue = [{ current: from, path: [from] }];
      const visited = new Set([from]);

      while (queue.length > 0) {
        const item = queue.shift();
        if (item.current === to) {
          return item.path;
        }

        const entity = index.relationships.get(item.current);
        if (entity) {
          for (const dep of entity.dependencies) {
            if (!visited.has(dep)) {
              visited.add(dep);
              queue.push({ current: dep, path: item.path.concat([dep]) });
            }
          }
        }
      }

      return null;
    }
  };
}
