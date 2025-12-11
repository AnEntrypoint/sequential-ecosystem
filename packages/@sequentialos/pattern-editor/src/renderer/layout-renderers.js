/**
 * layout-renderers.js
 *
 * Layout component renderers (box, container, grid, flex, card, section)
 */

import { getDefaultStyles } from './styles.js';

export function renderBox(component, children) {
  const element = document.createElement('div');
  element.className = `pattern-box pattern-${component.id}`;
  element.setAttribute('data-pattern-id', component.id);
  element.setAttribute('data-pattern-type', component.type);

  this.applyStyles(element, component.style);
  this.applyAttributes(element, component.props);

  if (children) {
    const childContent = this.renderChildren(children);
    element.appendChild(childContent);
  }

  return element;
}

export function renderContainer(component, children) {
  return renderBox.call(this, component, children);
}

export function renderGrid(component, children) {
  const element = document.createElement('div');
  element.className = 'pattern-grid';
  element.setAttribute('data-pattern-id', component.id);

  this.applyStyles(element, {
    display: 'grid',
    gridTemplateColumns: component.props?.columns || 'repeat(2, 1fr)',
    gap: component.props?.gap || '16px',
    ...component.style
  });

  if (children) {
    const childContent = this.renderChildren(children);
    element.appendChild(childContent);
  }

  return element;
}

export function renderFlex(component, children) {
  const element = document.createElement('div');
  element.className = 'pattern-flex';
  element.setAttribute('data-pattern-id', component.id);

  this.applyStyles(element, {
    display: 'flex',
    flexDirection: component.props?.direction || 'row',
    gap: component.props?.gap || '12px',
    alignItems: component.props?.alignItems || 'flex-start',
    justifyContent: component.props?.justifyContent || 'flex-start',
    ...component.style
  });

  if (children) {
    const childContent = this.renderChildren(children);
    element.appendChild(childContent);
  }

  return element;
}

export function renderCard(component, children) {
  const element = document.createElement('div');
  element.className = 'pattern-card';
  element.setAttribute('data-pattern-id', component.id);

  this.applyStyles(element, {
    ...getDefaultStyles('card'),
    ...component.style
  });

  if (children) {
    const childContent = this.renderChildren(children);
    element.appendChild(childContent);
  }

  return element;
}

export function renderSection(component, children) {
  const element = document.createElement('section');
  element.className = 'pattern-section';
  element.setAttribute('data-pattern-id', component.id);

  this.applyStyles(element, component.style);

  if (children) {
    const childContent = this.renderChildren(children);
    element.appendChild(childContent);
  }

  return element;
}
