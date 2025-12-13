export class ComponentComposer {
  constructor() {
    this.slots = new Map();
    this.wrappers = new Map();
  }

  defineSlot(name, defaultComponent = null) {
    this.slots.set(name, defaultComponent);
    return this;
  }

  fillSlot(slotName, component) {
    if (!this.slots.has(slotName)) {
      throw new Error(`Slot "${slotName}" not defined`);
    }
    this.slots.set(slotName, component);
    return this;
  }

  getSlot(name) {
    return this.slots.get(name);
  }

  createWrapper(name, wrapperFn) {
    this.wrappers.set(name, wrapperFn);
    return this;
  }

  wrap(componentName, content) {
    const wrapper = this.wrappers.get(componentName);
    if (!wrapper) {
      throw new Error(`Wrapper "${componentName}" not defined`);
    }
    return wrapper(content);
  }

  compose(slots = {}) {
    const result = {};
    for (const [name, component] of Object.entries(slots)) {
      if (!this.slots.has(name)) {
        throw new Error(`Slot "${name}" not defined in composer`);
      }
      result[name] = component;
    }
    return result;
  }
}

export const createSlottedComponent = (baseJSX, slots = {}) => {
  const slotPattern = /\{slot:(\w+)\}/g;
  return baseJSX.replace(slotPattern, (match, slotName) => {
    return slots[slotName] || `/* empty slot: ${slotName} */`;
  });
};

export const withLayout = (component, layout) => {
  return `React.createElement(
    'div',
    { style: ${JSON.stringify(layout.style || {})} },
    ${component}
  )`;
};

export const withError = (component, errorBoundary = true) => {
  if (!errorBoundary) return component;
  return `
    try {
      return ${component};
    } catch (error) {
      return React.createElement('div',
        { style: { color: '#f56565', padding: '12px', backgroundColor: '#fff5f5', borderRadius: '4px' } },
        'Error: ' + error.message
      );
    }
  `;
};

export const withProps = (component, defaultProps = {}) => {
  return {
    render: (props = {}) => {
      const merged = { ...defaultProps, ...props };
      return component.replace(/props\./g, () => {
        const propName = component.match(/props\.(\w+)/)?.[1];
        return JSON.stringify(merged[propName]);
      });
    }
  };
};

export const HOC = {
  withChildren: (component) => `
    (props) => React.createElement(
      'div',
      { key: props.key },
      ${component},
      props.children
    )
  `,

  withConditional: (component, condition) => `
    (props) => {
      if (${condition}) {
        return ${component};
      }
      return null;
    }
  `,

  withMemo: (component) => `
    React.memo(
      (props) => ${component},
      (prev, next) => JSON.stringify(prev) === JSON.stringify(next)
    )
  `
};
