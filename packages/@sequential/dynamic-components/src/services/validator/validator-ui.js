// Facade maintaining 100% backward compatibility with validator UI builders
import { buildEmptyState } from './validator-empty-state.js';
import { buildComplianceHeader, buildLevelSelector } from './validator-headers.js';
import { buildResultsSummary, buildCategoryResults } from './validator-results.js';

export class ValidatorUI {
  constructor(core) {
    this.core = core;
  }

  buildValidatorUI(results = null) {
    if (!results) {
      return buildEmptyState();
    }

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px',
        backgroundColor: '#f9f9f9',
        borderRadius: '6px'
      },
      children: [
        this.buildComplianceHeader(results),
        this.buildLevelSelector(),
        this.buildResultsSummary(results),
        this.buildCategoryResults(results)
      ]
    };
  }

  buildComplianceHeader(results) {
    return buildComplianceHeader(this.core, results);
  }

  buildLevelSelector() {
    return buildLevelSelector(this.core);
  }

  buildResultsSummary(results) {
    return buildResultsSummary(results);
  }

  buildCategoryResults(results) {
    return buildCategoryResults(results);
  }
}
