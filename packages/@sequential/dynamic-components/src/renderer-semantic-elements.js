// Semantic HTML element creation - text, headings, paragraphs, lists, tables, nav
export function createBox(def, children, applyCommonProps) {
  const el = document.createElement(def.type === 'div' || def.type === 'box' ? 'div' : def.type);
  applyCommonProps(el, def);
  if (children) children.forEach(child => el.appendChild(child));
  return el;
}

export function createHeading(def, children, applyCommonProps, level = null) {
  const h = level || def.level || 2;
  const el = document.createElement(`h${Math.min(Math.max(h, 1), 6)}`);
  el.textContent = def.content || def.label || 'Heading';
  applyCommonProps(el, def);
  if (children) children.forEach(child => el.appendChild(child));
  return el;
}

export function createParagraph(def, children, applyCommonProps) {
  const el = document.createElement('p');
  el.textContent = def.content || def.text || '';
  applyCommonProps(el, def);
  if (children) children.forEach(child => el.appendChild(child));
  return el;
}

export function createText(def) {
  return document.createTextNode(def.content || def.text || '');
}

export function createImage(def, children, applyCommonProps) {
  const el = document.createElement('img');
  el.src = def.src || '';
  el.alt = def.alt || '';
  el.title = def.title || '';
  applyCommonProps(el, def);
  return el;
}

export function createLink(def, children, applyCommonProps) {
  const el = document.createElement('a');
  el.href = def.href || '#';
  el.textContent = def.content || def.label || 'Link';
  el.target = def.target || '';
  applyCommonProps(el, def);
  if (children) children.forEach(child => el.appendChild(child));
  return el;
}

export function createSection(def, children, applyCommonProps) {
  const el = document.createElement('section');
  applyCommonProps(el, def);
  if (children) children.forEach(child => el.appendChild(child));
  return el;
}

export function createHeader(def, children, applyCommonProps) {
  const el = document.createElement('header');
  applyCommonProps(el, def);
  if (children) children.forEach(child => el.appendChild(child));
  return el;
}

export function createFooter(def, children, applyCommonProps) {
  const el = document.createElement('footer');
  applyCommonProps(el, def);
  if (children) children.forEach(child => el.appendChild(child));
  return el;
}

export function createNav(def, children, applyCommonProps) {
  const el = document.createElement('nav');
  applyCommonProps(el, def);
  if (children) children.forEach(child => el.appendChild(child));
  return el;
}

export function createList(def, children, applyCommonProps, ordered = false) {
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

export function createListItem(def, children, applyCommonProps) {
  const el = document.createElement('li');
  el.textContent = def.content || def.text || '';
  applyCommonProps(el, def);
  if (children) children.forEach(child => el.appendChild(child));
  return el;
}

export function createTable(def, children, applyCommonProps) {
  const el = document.createElement('table');
  applyCommonProps(el, def);
  if (children) children.forEach(child => el.appendChild(child));
  return el;
}
