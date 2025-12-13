// Facade maintaining 100% backward compatibility with focused modules
import { BasicLayoutBuilders } from './layout-builders-basic.js';
import { CompositeLayoutBuilders } from './layout-builders-composite.js';

export class LayoutTemplates {
  constructor(theme) {
    this.basic = new BasicLayoutBuilders(theme);
    this.composite = new CompositeLayoutBuilders(theme);
  }

  createSidebar(options = {}) {
    return this.basic.createSidebar(options);
  }

  createTwoColumn(options = {}) {
    return this.basic.createTwoColumn(options);
  }

  createThreeColumn(options = {}) {
    return this.basic.createThreeColumn(options);
  }

  createHeader(options = {}) {
    return this.composite.createHeader(options);
  }

  createFooter(options = {}) {
    return this.composite.createFooter(options);
  }

  createSection(options = {}) {
    return this.composite.createSection(options);
  }

  createCard(options = {}) {
    return this.composite.createCard(options);
  }

  createPageLayout(options = {}) {
    return this.composite.createPageLayout(options);
  }
}
