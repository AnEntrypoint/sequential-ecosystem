/**
 * content-renderers.js
 *
 * Content component renderers (heading, paragraph, image)
 */

import { getDefaultStyles } from './styles.js';

export function renderHeading(component, children) {
  const level = component.props?.level || 2;
  const element = document.createElement(`h${Math.min(Math.max(level, 1), 6)}`);
  element.className = 'pattern-heading';
  element.setAttribute('data-pattern-id', component.id);

  element.textContent = component.props?.content || component.content || 'Heading';

  this.applyStyles(element, {
    ...getDefaultStyles('heading'),
    ...component.style
  });

  this.applyAttributes(element, component.props);

  return element;
}

export function renderParagraph(component, children) {
  const element = document.createElement('p');
  element.className = 'pattern-paragraph';
  element.setAttribute('data-pattern-id', component.id);

  element.textContent = component.props?.content || component.content || '';

  this.applyStyles(element, {
    ...getDefaultStyles('paragraph'),
    ...component.style
  });

  this.applyAttributes(element, component.props);

  return element;
}

export function renderImage(component, children) {
  const element = document.createElement('img');
  element.className = 'pattern-image';
  element.setAttribute('data-pattern-id', component.id);
  element.src = component.props?.src || '';
  element.alt = component.props?.alt || '';

  this.applyStyles(element, {
    ...getDefaultStyles('image'),
    ...component.style
  });

  this.applyAttributes(element, component.props);

  return element;
}
