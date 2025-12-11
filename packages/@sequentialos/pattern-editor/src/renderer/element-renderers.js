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
