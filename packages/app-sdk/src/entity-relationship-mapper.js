import { createRelationshipIndex } from './relationship-index.js';
import { createRelationshipQuerier } from './relationship-querier.js';
import { createRelationshipAnalyzer } from './relationship-analyzer.js';
import { createRelationshipSummarizer } from './relationship-summarizer.js';

/**
 * entity-relationship-mapper.js - Facade for entity relationship mapping
 *
 * Delegates to focused modules:
 * - relationship-index: Core indexing with bidirectional tracking
 * - relationship-querier: Query operations on relationships
 * - relationship-analyzer: Graph analysis and transitive dependencies
 * - relationship-summarizer: Summary generation and statistics
 */

export function createEntityRelationshipMapper() {
  const index = createRelationshipIndex();
  const querier = createRelationshipQuerier(index);
  const analyzer = createRelationshipAnalyzer(index, querier);
  const summarizer = createRelationshipSummarizer(index);

  return {
    indexEntity(entityName, entityType, dependencies = [], metadata = {}) {
      return index.indexEntity(entityName, entityType, dependencies, metadata);
    },

    getDependencies(entityName) {
      return querier.getDependencies(entityName);
    },

    getConsumers(entityName) {
      return querier.getConsumers(entityName);
    },

    getGraph(entityName) {
      return analyzer.getGraph(entityName);
    },

    getRelationshipPath(from, to) {
      return analyzer.getRelationshipPath(from, to);
    },

    findByType(entityType) {
      return querier.findByType(entityType);
    },

    getEntitySummary(entityName) {
      return querier.getEntitySummary(entityName);
    },

    getAllRelationships() {
      return summarizer.getAllRelationships();
    },

    clearIndex() {
      return index.clearIndex();
    }
  };
}
