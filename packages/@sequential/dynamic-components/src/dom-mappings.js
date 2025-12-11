// Default DOM to component mappings and examples
export const defaultDOMMappings = {
  'div': 'flex',
  'button': 'button',
  'input': 'input',
  'textarea': 'textarea',
  'select': 'select',
  'h1': 'heading',
  'h2': 'heading',
  'h3': 'heading',
  'p': 'paragraph',
  'span': 'paragraph',
  'img': 'image',
  'ul': 'list',
  'ol': 'list',
  'li': 'list-item',
  'table': 'data-table',
  'form': 'flex'
};

export const usageExamples = {
  'button': `const button = {
  type: 'button',
  label: 'Click me',
  onClick: () => handleClick(),
  variant: 'primary'
};`,
  'input': `const input = {
  type: 'input',
  placeholder: 'Enter text',
  value: '',
  onChange: (value) => setState(value)
};`,
  'card': `const card = {
  type: 'card',
  title: 'Card Title',
  variant: 'default',
  children: [...]
};`,
  'flex': `const layout = {
  type: 'flex',
  direction: 'row',
  gap: '16px',
  children: [...]
};`,
  'grid': `const grid = {
  type: 'grid',
  cols: 'repeat(3, 1fr)',
  gap: '16px',
  children: [...]
};`
};

export const typeSpecificProps = {
  'button': ['label', 'variant', 'disabled', 'onClick'],
  'input': ['placeholder', 'type', 'value', 'onChange', 'disabled'],
  'card': ['title', 'variant', 'children'],
  'heading': ['content', 'level'],
  'select': ['options', 'value', 'onChange']
};

export const componentRelationships = {
  'button': ['link', 'toggle-switch'],
  'input': ['textarea', 'select', 'multi-select'],
  'card': ['panel-group', 'container'],
  'flex': ['grid', 'stack', 'container'],
  'heading': ['paragraph', 'section-header']
};
