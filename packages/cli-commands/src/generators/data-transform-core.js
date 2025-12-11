import { DataResult, wrapResult, wrapError } from './data-result.js';
import { createDataExtractors } from './data-extractors.js';
import { compose, chain, pipeline, parallel, aggregate, combineResults } from './data-combiners.js';
import { createDataTransform } from './data-wrapper.js';

/**
 * data-transform-core.js - Facade for data transformation utilities
 *
 * Delegates to focused modules:
 * - data-result: DataResult monad and basic operations
 * - data-extractors: Path extraction and field selection
 * - data-combiners: Composition and combination utilities
 * - data-wrapper: Function decoration with transformations
 */

// Re-export DataResult with extracted methods
const extractors = createDataExtractors();

// Extend DataResult prototype with extractor methods
DataResult.prototype.extract = function(path) {
  return extractors.extract(this, path);
};

DataResult.prototype.extractMultiple = function(paths) {
  return extractors.extractMultiple(this, paths);
};

DataResult.prototype.select = function(fields) {
  return extractors.select(this, fields);
};

DataResult.prototype.reject = function(fields) {
  return extractors.reject(this, fields);
};

export { DataResult, wrapResult, wrapError };
export { compose, chain, pipeline, parallel, aggregate, combineResults };
export { createDataTransform };
