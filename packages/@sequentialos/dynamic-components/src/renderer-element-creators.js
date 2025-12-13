// Facade maintaining 100% backward compatibility with element creation
import * as semanticElements from './renderer-semantic-elements.js';
import * as formElements from './renderer-form-elements.js';
import * as layoutElements from './renderer-layout-elements.js';

export class RendererElementCreators {
  createBox(def, children, applyCommonProps) {
    return semanticElements.createBox(def, children, applyCommonProps);
  }

  createButton(def, children, applyCommonProps, applyEventListeners) {
    return formElements.createButton(def, children, applyCommonProps, applyEventListeners);
  }

  createInput(def, children, applyCommonProps, applyEventListeners) {
    return formElements.createInput(def, children, applyCommonProps, applyEventListeners);
  }

  createTextarea(def, children, applyCommonProps, applyEventListeners) {
    return formElements.createTextarea(def, children, applyCommonProps, applyEventListeners);
  }

  createSelect(def, children, applyCommonProps, applyEventListeners) {
    return formElements.createSelect(def, children, applyCommonProps, applyEventListeners);
  }

  createHeading(def, children, applyCommonProps, level) {
    return semanticElements.createHeading(def, children, applyCommonProps, level);
  }

  createParagraph(def, children, applyCommonProps) {
    return semanticElements.createParagraph(def, children, applyCommonProps);
  }

  createText(def) {
    return semanticElements.createText(def);
  }

  createImage(def, children, applyCommonProps) {
    return semanticElements.createImage(def, children, applyCommonProps);
  }

  createLink(def, children, applyCommonProps) {
    return semanticElements.createLink(def, children, applyCommonProps);
  }

  createGrid(def, children, applyStyles) {
    return layoutElements.createGrid(def, children, applyStyles);
  }

  createFlex(def, children, applyStyles) {
    return layoutElements.createFlex(def, children, applyStyles);
  }

  createCard(def, children, applyStyles) {
    return layoutElements.createCard(def, children, applyStyles);
  }

  createSection(def, children, applyCommonProps) {
    return semanticElements.createSection(def, children, applyCommonProps);
  }

  createHeader(def, children, applyCommonProps) {
    return semanticElements.createHeader(def, children, applyCommonProps);
  }

  createFooter(def, children, applyCommonProps) {
    return semanticElements.createFooter(def, children, applyCommonProps);
  }

  createNav(def, children, applyCommonProps) {
    return semanticElements.createNav(def, children, applyCommonProps);
  }

  createList(def, children, applyCommonProps, ordered) {
    return semanticElements.createList(def, children, applyCommonProps, ordered);
  }

  createListItem(def, children, applyCommonProps) {
    return semanticElements.createListItem(def, children, applyCommonProps);
  }

  createTable(def, children, applyCommonProps) {
    return semanticElements.createTable(def, children, applyCommonProps);
  }

  createForm(def, children, applyCommonProps, applyEventListeners) {
    return formElements.createForm(def, children, applyCommonProps, applyEventListeners);
  }
}
