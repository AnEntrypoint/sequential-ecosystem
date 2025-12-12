// Advanced layout builders facade - delegates to specialized builders
import { GridLayoutBuilders } from './grid-layout-builders.js';
import { InteractiveLayoutBuilders } from './interactive-layout-builders.js';

export class LayoutAdvanced {
  constructor(theme) {
    this.theme = theme;
    this.gridBuilder = new GridLayoutBuilders(theme);
    this.interactiveBuilder = new InteractiveLayoutBuilders(theme);
  }

  createResponsiveGrid(options = {}) {
    return this.gridBuilder.createResponsiveGrid(options);
  }

  createGallery(options = {}) {
    return this.gridBuilder.createGallery(options);
  }

  createMasonry(options = {}) {
    return this.gridBuilder.createMasonry(options);
  }

  createAccordion(options = {}) {
    return this.interactiveBuilder.createAccordion(options);
  }

  createTabs(options = {}) {
    return this.interactiveBuilder.createTabs(options);
  }

  createBreadcrumbs(options = {}) {
    return this.interactiveBuilder.createBreadcrumbs(options);
  }
}
