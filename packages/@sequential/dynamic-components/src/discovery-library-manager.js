// Pattern library management and initialization
import { FormPatternLibrary } from './patterns/forms/index.js';
import { ListPatternLibrary } from './patterns/lists/index.js';
import { ChartPatternLibrary } from './patterns/charts/index.js';
import { TablePatternLibrary } from './patterns/tables/index.js';
import { ModalPatternLibrary } from './patterns/modals/index.js';
import { GridPatternLibrary } from './patterns/grids/index.js';

export class DiscoveryLibraryManager {
  constructor() {
    this.libraries = new Map();
    this.allPatterns = [];
  }

  initializeLibraries(includeExtended = true) {
    const formLib = new FormPatternLibrary();
    const listLib = new ListPatternLibrary();
    const chartLib = new ChartPatternLibrary();
    const tableLib = new TablePatternLibrary();
    const modalLib = new ModalPatternLibrary();
    const gridLib = new GridPatternLibrary();

    this.libraries.set('form', formLib);
    this.libraries.set('list', listLib);
    this.libraries.set('chart', chartLib);
    this.libraries.set('table', tableLib);
    this.libraries.set('modal', modalLib);
    this.libraries.set('grid', gridLib);

    this.allPatterns = [
      ...formLib.getAllPatterns(),
      ...listLib.getAllPatterns(),
      ...chartLib.getAllPatterns(),
      ...tableLib.getAllPatterns(),
      ...modalLib.getAllPatterns(),
      ...gridLib.getAllPatterns()
    ];

    if (includeExtended) {
      this.loadExtendedPatterns();
    }
  }

  loadExtendedPatterns() {
    try {
      const ExtendedPatternIntegration = require('./extended-pattern-integration.js').ExtendedPatternIntegration;
      const extLib = new ExtendedPatternIntegration();
      this.libraries.set('extended', extLib);
      this.allPatterns.push(...extLib.getAllPatterns());
    } catch (e) {
      // Extended patterns not available
    }
  }

  getAllPatterns() {
    return this.allPatterns;
  }

  getLibraries() {
    return this.libraries;
  }
}
