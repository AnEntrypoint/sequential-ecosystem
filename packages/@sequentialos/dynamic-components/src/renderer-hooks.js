// Hook and renderer registration
export class RendererHooks {
  constructor(core) {
    this.core = core;
  }

  registerRenderer(type, renderer) {
    this.core.renderers.set(type, renderer);
    this.core.clearCache();
    return this;
  }

  registerHook(event, callback) {
    if (!this.core.hooks.has(event)) {
      this.core.hooks.set(event, []);
    }
    this.core.hooks.get(event).push(callback);
    return this;
  }

  executeHooks(event, data) {
    const callbacks = this.core.hooks.get(event) || [];
    callbacks.forEach(cb => {
      try {
        cb(data);
      } catch (e) {
        console.error(`Hook error (${event}):`, e);
      }
    });
  }

  initializeDefaultRenderers(elementCreators, propApplier) {
    const renderers = {
      box: (def, children) => elementCreators.createBox(def, children, (el, d) => propApplier.applyCommonProps(el, d)),
      div: (def, children) => elementCreators.createBox(def, children, (el, d) => propApplier.applyCommonProps(el, d)),
      container: (def, children) => elementCreators.createBox(def, children, (el, d) => propApplier.applyCommonProps(el, d)),
      button: (def, children) => elementCreators.createButton(def, children, (el, d) => propApplier.applyCommonProps(el, d), (el, d) => propApplier.applyEventListeners(el, d)),
      input: (def, children) => elementCreators.createInput(def, children, (el, d) => propApplier.applyCommonProps(el, d), (el, d) => propApplier.applyEventListeners(el, d)),
      textarea: (def, children) => elementCreators.createTextarea(def, children, (el, d) => propApplier.applyCommonProps(el, d), (el, d) => propApplier.applyEventListeners(el, d)),
      select: (def, children) => elementCreators.createSelect(def, children, (el, d) => propApplier.applyCommonProps(el, d), (el, d) => propApplier.applyEventListeners(el, d)),
      heading: (def, children) => elementCreators.createHeading(def, children, (el, d) => propApplier.applyCommonProps(el, d)),
      h1: (def, children) => elementCreators.createHeading(def, children, (el, d) => propApplier.applyCommonProps(el, d), 1),
      h2: (def, children) => elementCreators.createHeading(def, children, (el, d) => propApplier.applyCommonProps(el, d), 2),
      h3: (def, children) => elementCreators.createHeading(def, children, (el, d) => propApplier.applyCommonProps(el, d), 3),
      h4: (def, children) => elementCreators.createHeading(def, children, (el, d) => propApplier.applyCommonProps(el, d), 4),
      h5: (def, children) => elementCreators.createHeading(def, children, (el, d) => propApplier.applyCommonProps(el, d), 5),
      h6: (def, children) => elementCreators.createHeading(def, children, (el, d) => propApplier.applyCommonProps(el, d), 6),
      paragraph: (def, children) => elementCreators.createParagraph(def, children, (el, d) => propApplier.applyCommonProps(el, d)),
      p: (def, children) => elementCreators.createParagraph(def, children, (el, d) => propApplier.applyCommonProps(el, d)),
      text: (def, children) => elementCreators.createText(def),
      image: (def, children) => elementCreators.createImage(def, children, (el, d) => propApplier.applyCommonProps(el, d)),
      img: (def, children) => elementCreators.createImage(def, children, (el, d) => propApplier.applyCommonProps(el, d)),
      link: (def, children) => elementCreators.createLink(def, children, (el, d) => propApplier.applyCommonProps(el, d)),
      a: (def, children) => elementCreators.createLink(def, children, (el, d) => propApplier.applyCommonProps(el, d)),
      grid: (def, children) => elementCreators.createGrid(def, children, (el, styles) => propApplier.applyStyles(el, styles)),
      flex: (def, children) => elementCreators.createFlex(def, children, (el, styles) => propApplier.applyStyles(el, styles)),
      card: (def, children) => elementCreators.createCard(def, children, (el, styles) => propApplier.applyStyles(el, styles)),
      section: (def, children) => elementCreators.createSection(def, children, (el, d) => propApplier.applyCommonProps(el, d)),
      header: (def, children) => elementCreators.createHeader(def, children, (el, d) => propApplier.applyCommonProps(el, d)),
      footer: (def, children) => elementCreators.createFooter(def, children, (el, d) => propApplier.applyCommonProps(el, d)),
      nav: (def, children) => elementCreators.createNav(def, children, (el, d) => propApplier.applyCommonProps(el, d)),
      list: (def, children) => elementCreators.createList(def, children, (el, d) => propApplier.applyCommonProps(el, d)),
      ul: (def, children) => elementCreators.createList(def, children, (el, d) => propApplier.applyCommonProps(el, d)),
      ol: (def, children) => elementCreators.createList(def, children, (el, d) => propApplier.applyCommonProps(el, d), true),
      li: (def, children) => elementCreators.createListItem(def, children, (el, d) => propApplier.applyCommonProps(el, d)),
      table: (def, children) => elementCreators.createTable(def, children, (el, d) => propApplier.applyCommonProps(el, d)),
      form: (def, children) => elementCreators.createForm(def, children, (el, d) => propApplier.applyCommonProps(el, d), (el, d) => propApplier.applyEventListeners(el, d))
    };

    Object.entries(renderers).forEach(([type, renderer]) => {
      this.core.renderers.set(type, renderer);
    });
  }
}
