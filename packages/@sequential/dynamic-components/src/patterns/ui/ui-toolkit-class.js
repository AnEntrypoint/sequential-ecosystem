import * as builders from './component-builders.js';
import { uiToolkitDefaultTheme } from './theme-defaults.js';

class UIToolkit {
  constructor(options = {}) {
    this.theme = options.theme || { ...uiToolkitDefaultTheme };
    this.components = new Map();
    this.patterns = new Map();
    this.initializeComponents();
  }

  initializeComponents() {
    this.register('button', (opts) => builders.createButton(this.theme, opts));
    this.register('card', (opts) => builders.createCard(this.theme, opts));
    this.register('input', (opts) => builders.createInput(this.theme, opts));
    this.register('select', (opts) => builders.createSelect(this.theme, opts));
    this.register('checkbox', (opts) => builders.createCheckbox(this.theme, opts));
    this.register('radio', (opts) => builders.createRadio(this.theme, opts));
    this.register('badge', (opts) => builders.createBadge(this.theme, opts));
    this.register('alert', (opts) => builders.createAlert(this.theme, opts));
    this.register('modal', (opts) => builders.createModal(this.theme, opts));
    this.register('tooltip', (opts) => builders.createTooltip(this.theme, opts));
    this.register('tabs', (opts) => builders.createTabs(this.theme, opts));
    this.register('accordion', (opts) => builders.createAccordion(this.theme, opts));
    this.register('dropdown', (opts) => builders.createDropdown(this.theme, opts));
    this.register('pagination', (opts) => builders.createPagination(this.theme, opts));
    this.register('breadcrumb', (opts) => builders.createBreadcrumb(this.theme, opts));
    this.register('progress', (opts) => builders.createProgress(this.theme, opts));
    this.register('spinner', (opts) => builders.createSpinner(this.theme, opts));
    this.register('avatar', (opts) => builders.createAvatar(this.theme, opts));
    this.register('hero', (opts) => builders.createHero(this.theme, opts));
    this.register('footer', (opts) => builders.createFooter(this.theme, opts));
  }

  register(name, renderer) {
    this.components.set(name, renderer);
    return this;
  }

  create(componentName, options = {}) {
    const renderer = this.components.get(componentName);
    if (!renderer) {
      throw new Error(`Unknown component: ${componentName}`);
    }
    return renderer(options);
  }

  getAvailableComponents() {
    return Array.from(this.components.keys());
  }

  setTheme(theme) {
    this.theme = { ...uiToolkitDefaultTheme, ...theme };
    return this;
  }
}

function createUIToolkit(options = {}) {
  return new UIToolkit(options);
}

export { UIToolkit, createUIToolkit };
