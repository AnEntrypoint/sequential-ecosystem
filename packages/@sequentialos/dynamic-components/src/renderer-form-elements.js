// Form element creation - buttons, inputs, textareas, select, forms
export function createButton(def, children, applyCommonProps, applyEventListeners) {
  const el = document.createElement('button');
  el.textContent = def.content || def.label || 'Button';
  applyCommonProps(el, def);
  applyEventListeners(el, def);
  if (children) children.forEach(child => el.appendChild(child));
  return el;
}

export function createInput(def, children, applyCommonProps, applyEventListeners) {
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

export function createTextarea(def, children, applyCommonProps, applyEventListeners) {
  const el = document.createElement('textarea');
  el.placeholder = def.placeholder || '';
  el.value = def.value || '';
  el.rows = def.rows || 4;
  el.cols = def.cols || 50;
  applyCommonProps(el, def);
  applyEventListeners(el, def);
  return el;
}

export function createSelect(def, children, applyCommonProps, applyEventListeners) {
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

export function createForm(def, children, applyCommonProps, applyEventListeners) {
  const el = document.createElement('form');
  el.method = def.method || 'POST';
  el.action = def.action || '';
  applyCommonProps(el, def);
  applyEventListeners(el, def);
  if (children) children.forEach(child => el.appendChild(child));
  return el;
}
