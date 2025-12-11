/**
 * form-renderers.js
 *
 * Form component renderers (button, input)
 */

import { getDefaultStyles } from './styles.js';

export function renderButton(component, children) {
  const element = document.createElement('button');
  element.className = 'pattern-button';
  element.setAttribute('data-pattern-id', component.id);

  element.textContent = component.props?.content || 'Button';

  this.applyStyles(element, {
    ...getDefaultStyles('button'),
    ...component.style
  });

  this.applyAttributes(element, component.props);

  if (component.props?.onclick) {
    element.addEventListener('click', () => {
      try {
        eval(component.props.onclick);
      } catch (e) {
        console.error('Button click handler error:', e);
      }
    });
  }

  return element;
}

export function renderInput(component, children) {
  const element = document.createElement('input');
  element.className = 'pattern-input';
  element.setAttribute('data-pattern-id', component.id);
  element.type = component.props?.type || 'text';
  element.placeholder = component.props?.placeholder || '';

  this.applyStyles(element, {
    ...getDefaultStyles('input'),
    ...component.style
  });

  this.applyAttributes(element, component.props);

  if (component.props?.onChange) {
    element.addEventListener('change', (e) => {
      try {
        eval(component.props.onChange);
      } catch (e) {
        console.error('Input change handler error:', e);
      }
    });
  }

  return element;
}
