export class PatternBuilder {
  constructor(id, name) {
    this.pattern = {
      id,
      name,
      category: '',
      icon: '',
      description: '',
      codeReduction: '80%',
      tags: [],
      definition: {},
      metadata: {}
    };
  }

  category(cat) {
    this.pattern.category = cat;
    return this;
  }

  icon(i) {
    this.pattern.icon = i;
    return this;
  }

  description(desc) {
    this.pattern.description = desc;
    return this;
  }

  codeReduction(reduction) {
    this.pattern.codeReduction = reduction;
    return this;
  }

  tags(t) {
    this.pattern.tags = Array.isArray(t) ? t : [t];
    return this;
  }

  definition(def) {
    this.pattern.definition = def;
    return this;
  }

  metadata(meta) {
    this.pattern.metadata = meta;
    return this;
  }

  build() {
    return this.pattern;
  }
}

export function createPattern(id, name) {
  return new PatternBuilder(id, name);
}

export const componentTypes = {
  flex: 'flex',
  grid: 'grid',
  box: 'box',
  container: 'container',
  heading: 'heading',
  paragraph: 'paragraph',
  button: 'button',
  input: 'input',
  image: 'image',
  card: 'card',
  section: 'section'
};

export const commonStyles = {
  containerBase: {
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #e0e0e0'
  },
  headingBase: {
    margin: 0,
    fontWeight: '600',
    fontSize: '24px'
  },
  inputBase: {
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px'
  },
  buttonBase: {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  }
};

export const categories = {
  forms: 'forms',
  charts: 'charts',
  tables: 'tables',
  lists: 'lists',
  grids: 'grids',
  modals: 'modals',
  navigation: 'navigation',
  cards: 'cards',
  layouts: 'layouts',
  extended: 'extended'
};
