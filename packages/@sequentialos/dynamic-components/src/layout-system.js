// Facade maintaining 100% backward compatibility
import { LayoutPrimitives } from './layout-primitives.js';
import { LayoutTemplates } from './layout-templates.js';
import { LayoutAdvanced } from './layout-advanced.js';

export class LayoutSystem {
  constructor(themeEngine) {
    this.theme = themeEngine;
    this.primitives = new LayoutPrimitives(themeEngine);
    this.templates = new LayoutTemplates(themeEngine);
    this.advanced = new LayoutAdvanced(themeEngine);
  }

  // Primitive methods
  createGrid(options) {
    return this.primitives.createGrid(options);
  }

  createFlex(options) {
    return this.primitives.createFlex(options);
  }

  createStack(options) {
    return this.primitives.createStack(options);
  }

  createAspectRatio(options) {
    return this.primitives.createAspectRatio(options);
  }

  createCenter(options) {
    return this.primitives.createCenter(options);
  }

  createBox(options) {
    return this.primitives.createBox(options);
  }

  createContainer(options) {
    return this.primitives.createContainer(options);
  }

  // Template methods
  createSidebar(options) {
    return this.templates.createSidebar(options);
  }

  createTwoColumn(options) {
    return this.templates.createTwoColumn(options);
  }

  createThreeColumn(options) {
    return this.templates.createThreeColumn(options);
  }

  createHeader(options) {
    return this.templates.createHeader(options);
  }

  createFooter(options) {
    return this.templates.createFooter(options);
  }

  createSection(options) {
    return this.templates.createSection(options);
  }

  createCard(options) {
    return this.templates.createCard(options);
  }

  createPageLayout(options) {
    return this.templates.createPageLayout(options);
  }

  // Advanced methods
  createResponsiveGrid(options) {
    return this.advanced.createResponsiveGrid(options);
  }

  createGallery(options) {
    return this.advanced.createGallery(options);
  }

  createMasonry(options) {
    return this.advanced.createMasonry(options);
  }

  createAccordion(options) {
    return this.advanced.createAccordion(options);
  }

  createTabs(options) {
    return this.advanced.createTabs(options);
  }

  createBreadcrumbs(options) {
    return this.advanced.createBreadcrumbs(options);
  }
}

export const createLayoutSystem = (themeEngine) => new LayoutSystem(themeEngine);

export default LayoutSystem;
