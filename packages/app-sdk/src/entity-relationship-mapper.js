export function createEntityRelationshipMapper() {
  const relationships = new Map();
  const dependencyGraph = new Map();

  return {
    indexEntity(entityName, entityType, dependencies = [], metadata = {}) {
      const entity = {
        name: entityName,
        type: entityType,
        dependencies: dependencies,
        metadata: metadata,
        consumers: []
      };

      relationships.set(entityName, entity);

      for (const dep of dependencies) {
        if (!dependencyGraph.has(dep)) {
          dependencyGraph.set(dep, []);
        }
        const consumers = dependencyGraph.get(dep);
        if (!consumers.includes(entityName)) {
          consumers.push(entityName);
        }
      }

      return entity;
    },

    getDependencies(entityName) {
      const entity = relationships.get(entityName);
      if (!entity) {
        return null;
      }

      const deps = entity.dependencies.map(function(depName) {
        const depEntity = relationships.get(depName);
        return {
          name: depName,
          type: depEntity ? depEntity.type : 'unknown',
          metadata: depEntity ? depEntity.metadata : {}
        };
      });

      return {
        entity: entityName,
        dependencies: deps,
        dependencyCount: deps.length
      };
    },

    getConsumers(entityName) {
      const consumers = dependencyGraph.get(entityName) || [];
      const consumerDetails = consumers.map(function(consumerName) {
        const consumerEntity = relationships.get(consumerName);
        return {
          name: consumerName,
          type: consumerEntity ? consumerEntity.type : 'unknown',
          metadata: consumerEntity ? consumerEntity.metadata : {}
        };
      });

      return {
        entity: entityName,
        consumers: consumerDetails,
        consumerCount: consumerDetails.length
      };
    },

    getGraph(entityName) {
      const directDeps = this.getDependencies(entityName);
      const directConsumers = this.getConsumers(entityName);

      const transitiveConsumers = new Set();
      const queue = [entityName];
      const visited = new Set();

      while (queue.length > 0) {
        const current = queue.shift();
        if (visited.has(current)) continue;
        visited.add(current);

        const currentConsumers = dependencyGraph.get(current) || [];
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
          const entity = relationships.get(name);
          return { name: name, type: entity ? entity.type : 'unknown' };
        }),
        totalImpact: transitiveConsumers.size
      };
    },

    getRelationshipPath(from, to) {
      if (!relationships.has(from) || !relationships.has(to)) {
        return null;
      }

      const queue = [{ current: from, path: [from] }];
      const visited = new Set([from]);

      while (queue.length > 0) {
        const item = queue.shift();
        if (item.current === to) {
          return item.path;
        }

        const entity = relationships.get(item.current);
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
    },

    findByType(entityType) {
      const result = [];
      for (const entity of relationships.values()) {
        if (entity.type === entityType) {
          result.push({
            name: entity.name,
            dependencyCount: entity.dependencies.length,
            consumerCount: (dependencyGraph.get(entity.name) || []).length
          });
        }
      }
      return result;
    },

    getEntitySummary(entityName) {
      const entity = relationships.get(entityName);
      if (!entity) {
        return null;
      }

      const consumers = dependencyGraph.get(entityName) || [];

      return {
        name: entityName,
        type: entity.type,
        dependencies: entity.dependencies.length,
        consumers: consumers.length,
        metadata: entity.metadata,
        impactIfRemoved: consumers.length
      };
    },

    getAllRelationships() {
      const summary = {
        totalEntities: relationships.size,
        byType: {},
        highestImpact: [],
        orphaned: []
      };

      for (const entity of relationships.values()) {
        if (!summary.byType[entity.type]) {
          summary.byType[entity.type] = 0;
        }
        summary.byType[entity.type]++;

        const consumers = dependencyGraph.get(entity.name) || [];
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
    },

    clearIndex() {
      relationships.clear();
      dependencyGraph.clear();
    }
  };
}
