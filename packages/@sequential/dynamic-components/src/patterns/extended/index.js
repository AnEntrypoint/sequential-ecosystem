import { PatternLibraryBase } from '@sequentialos/pattern-core';
import { ecommercePatterns } from './ecommerce-patterns.js';
import { saasPatterns } from './saas-patterns.js';
import { adminPatterns } from './admin-patterns.js';
import { dashboardPatterns } from './dashboard-patterns.js';
import { marketingPatterns } from './marketing-patterns.js';

export class ExtendedPatternLibrary extends PatternLibraryBase {
  constructor() {
    super('extended');
    this.registerAllPatterns();
  }

  registerAllPatterns() {
    const allPatterns = [
      ...Object.values(ecommercePatterns),
      ...Object.values(saasPatterns),
      ...Object.values(adminPatterns),
      ...Object.values(dashboardPatterns),
      ...Object.values(marketingPatterns)
    ];

    allPatterns.forEach(pattern => {
      this.registerPattern(pattern.id, pattern);
    });
  }
}

export const createExtendedPatternLibrary = () => new ExtendedPatternLibrary();

export { ecommercePatterns, saasPatterns, adminPatterns, dashboardPatterns, marketingPatterns };
