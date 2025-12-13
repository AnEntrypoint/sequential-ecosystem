/**
 * Data Extractors
 * Data extraction: paths, fields, properties
 *
 * Delegates to:
 * - path-extractor: Dot notation path extraction
 * - field-selector: Field selection and rejection
 */

import { createPathExtractor } from './path-extractor.js';
import { createFieldSelector } from './field-selector.js';

export function createDataExtractors() {
  const pathExtractor = createPathExtractor();
  const fieldSelector = createFieldSelector();

  return {
    extract: pathExtractor.extract.bind(pathExtractor),
    extractMultiple: pathExtractor.extractMultiple.bind(pathExtractor),
    select: fieldSelector.select.bind(fieldSelector),
    reject: fieldSelector.reject.bind(fieldSelector)
  };
}
