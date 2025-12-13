import { PatternLibraryBase } from '../../pattern-library-base.js';
import { basicCharts } from './basic-charts.js';
import { statisticalCharts } from './statistical-charts.js';
import { specializedCharts } from './specialized-charts.js';

class ChartPatternLibrary extends PatternLibraryBase {
  constructor() {
    super(null);
    this.registerAllPatterns();
  }

  registerAllPatterns() {
    [...basicCharts, ...statisticalCharts, ...specializedCharts].forEach(pattern => {
      this.registerPattern(pattern.id, pattern);
    });
  }
}

function createChartPatternLibrary() {
  return new ChartPatternLibrary();
}

export { ChartPatternLibrary, createChartPatternLibrary };
