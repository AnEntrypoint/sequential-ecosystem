/**
 * element-renderers.js - Facade for component rendering
 *
 * Delegates to focused modules:
 * - layout-renderers: Box, container, grid, flex, card, section
 * - form-renderers: Button, input
 * - content-renderers: Heading, paragraph, image
 */

import * as layoutRenderers from './layout-renderers.js';
import * as formRenderers from './form-renderers.js';
import * as contentRenderers from './content-renderers.js';

/**
 * Exported functions maintain original API
 * Each renderer is bound to the calling context (this = renderer instance)
 */

export function renderBox(component, children) {
  return layoutRenderers.renderBox.call(this, component, children);
}

export function renderContainer(component, children) {
  return layoutRenderers.renderContainer.call(this, component, children);
}

export function renderButton(component, children) {
  return formRenderers.renderButton.call(this, component, children);
}

export function renderInput(component, children) {
  return formRenderers.renderInput.call(this, component, children);
}

export function renderHeading(component, children) {
  return contentRenderers.renderHeading.call(this, component, children);
}

export function renderParagraph(component, children) {
  return contentRenderers.renderParagraph.call(this, component, children);
}

export function renderImage(component, children) {
  return contentRenderers.renderImage.call(this, component, children);
}

export function renderGrid(component, children) {
  return layoutRenderers.renderGrid.call(this, component, children);
}

export function renderFlex(component, children) {
  return layoutRenderers.renderFlex.call(this, component, children);
}

export function renderCard(component, children) {
  return layoutRenderers.renderCard.call(this, component, children);
}

export function renderSection(component, children) {
  return layoutRenderers.renderSection.call(this, component, children);
}
