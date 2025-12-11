// Element creation methods
export class RendererElementCreators {
  createBox(def, children, applyCommonProps) {
    const el = document.createElement(def.type === 'div' || def.type === 'box' ? 'div' : def.type);
    applyCommonProps(el, def);
    if (children) children.forEach(child => el.appendChild(child));
    return el;
  }

  createButton(def, children, applyCommonProps, applyEventListeners) {
    const el = document.createElement('button');
    el.textContent = def.content || def.label || 'Button';
    applyCommonProps(el, def);
    applyEventListeners(el, def);
    if (children) children.forEach(child => el.appendChild(child));
    return el;
  }

  createInput(def, children, applyCommonProps, applyEventListeners) {
    const el = document.createElement('input');
    el.type = def.type || 'text';
    el.placeholder = def.placeholder || '';
    el.value = def.value || '';
    if (def.disabled) el.disabled = true;
    if (def.required) el.required = true;
    applyCommonProps(el, def);
    applyEventListeners(el, def);
    return el;
  }

  createTextarea(def, children, applyCommonProps, applyEventListeners) {
    const el = document.createElement('textarea');
    el.placeholder = def.placeholder || '';
    el.value = def.value || '';
    el.rows = def.rows || 4;
    el.cols = def.cols || 50;
    applyCommonProps(el, def);
    applyEventListeners(el, def);
    return el;
  }

  createSelect(def, children, applyCommonProps, applyEventListeners) {
    const el = document.createElement('select');
    if (def.options) {
      def.options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value || opt;
        option.textContent = opt.label || opt;
        el.appendChild(option);
      });
    }
    applyCommonProps(el, def);
    applyEventListeners(el, def);
    return el;
  }

  createHeading(def, children, applyCommonProps, level = null) {
    const h = level || def.level || 2;
    const el = document.createElement(`h${Math.min(Math.max(h, 1), 6)}`);
    el.textContent = def.content || def.label || 'Heading';
    applyCommonProps(el, def);
    if (children) children.forEach(child => el.appendChild(child));
    return el;
  }

  createParagraph(def, children, applyCommonProps) {
    const el = document.createElement('p');
    el.textContent = def.content || def.text || '';
    applyCommonProps(el, def);
    if (children) children.forEach(child => el.appendChild(child));
    return el;
  }

  createText(def) {
    return document.createTextNode(def.content || def.text || '');
  }

  createImage(def, children, applyCommonProps) {
    const el = document.createElement('img');
    el.src = def.src || '';
    el.alt = def.alt || '';
    el.title = def.title || '';
    applyCommonProps(el, def);
    return el;
  }

  createLink(def, children, applyCommonProps) {
    const el = document.createElement('a');
    el.href = def.href || '#';
    el.textContent = def.content || def.label || 'Link';
    el.target = def.target || '';
    applyCommonProps(el, def);
    if (children) children.forEach(child => el.appendChild(child));
    return el;
  }

  createGrid(def, children, applyStyles) {
    const el = document.createElement('div');
    applyStyles(el, {
      display: 'grid',
      gridTemplateColumns: def.columns || 'repeat(2, 1fr)',
      gap: def.gap || '16px',
      ...def.style
    });
    el.className = 'pattern-grid ' + (def.className || '');
    if (children) children.forEach(child => el.appendChild(child));
    return el;
  }

  createFlex(def, children, applyStyles) {
    const el = document.createElement('div');
    applyStyles(el, {
      display: 'flex',
      flexDirection: def.direction || 'row',
      gap: def.gap || '12px',
      alignItems: def.alignItems || 'flex-start',
      justifyContent: def.justifyContent || 'flex-start',
      ...def.style
    });
    el.className = 'pattern-flex ' + (def.className || '');
    if (children) children.forEach(child => el.appendChild(child));
    return el;
  }

  createCard(def, children, applyStyles) {
    const el = document.createElement('div');
    applyStyles(el, {
      padding: '16px',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      ...def.style
    });
    el.className = 'pattern-card ' + (def.className || '');
    if (children) children.forEach(child => el.appendChild(child));
    return el;
  }

  createSection(def, children, applyCommonProps) {
    const el = document.createElement('section');
    applyCommonProps(el, def);
    if (children) children.forEach(child => el.appendChild(child));
    return el;
  }

  createHeader(def, children, applyCommonProps) {
    const el = document.createElement('header');
    applyCommonProps(el, def);
    if (children) children.forEach(child => el.appendChild(child));
    return el;
  }

  createFooter(def, children, applyCommonProps) {
    const el = document.createElement('footer');
    applyCommonProps(el, def);
    if (children) children.forEach(child => el.appendChild(child));
    return el;
  }

  createNav(def, children, applyCommonProps) {
    const el = document.createElement('nav');
    applyCommonProps(el, def);
    if (children) children.forEach(child => el.appendChild(child));
    return el;
  }

  createList(def, children, applyCommonProps, ordered = false) {
    const el = document.createElement(ordered ? 'ol' : 'ul');
    if (def.items) {
      def.items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item.text || item;
        el.appendChild(li);
      });
    }
    applyCommonProps(el, def);
    if (children) children.forEach(child => el.appendChild(child));
    return el;
  }

  createListItem(def, children, applyCommonProps) {
    const el = document.createElement('li');
    el.textContent = def.content || def.text || '';
    applyCommonProps(el, def);
    if (children) children.forEach(child => el.appendChild(child));
    return el;
  }

  createTable(def, children, applyCommonProps) {
    const el = document.createElement('table');
    applyCommonProps(el, def);
    if (children) children.forEach(child => el.appendChild(child));
    return el;
  }

  createForm(def, children, applyCommonProps, applyEventListeners) {
    const el = document.createElement('form');
    el.method = def.method || 'POST';
    el.action = def.action || '';
    applyCommonProps(el, def);
    applyEventListeners(el, def);
    if (children) children.forEach(child => el.appendChild(child));
    return el;
  }
}
