// Layout element creation - flex, grid, card, section containers
export function createGrid(def, children, applyStyles) {
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

export function createFlex(def, children, applyStyles) {
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

export function createCard(def, children, applyStyles) {
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
