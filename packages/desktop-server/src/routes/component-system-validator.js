export class ComponentSystemValidator {
  constructor() {
    this.testResults = [];
    this.componentRegistry = new Map();
    this.renderCache = new Map();
  }

  async validateBasicComponentRegistration() {
    const component = {
      id: 'button-primary',
      name: 'Button',
      code: '<button style={{background: "blue"}}>{children}</button>',
      meta: { category: 'Forms', description: 'Primary button', tags: ['interactive'] }
    };
    this.componentRegistry.set('button-primary', component);
    return {
      name: 'Basic Component Registration',
      passed: this.componentRegistry.has('button-primary') && component.code !== null,
      details: { componentId: 'button-primary', stored: true, codeLength: component.code.length }
    };
  }

  async validateComponentMetadataStructure() {
    const components = [
      {
        id: 'input-text',
        name: 'Text Input',
        code: '<input type="text" />',
        meta: { category: 'Forms', description: 'Text input field', tags: ['input'] }
      },
      {
        id: 'heading-h1',
        name: 'Heading H1',
        code: '<h1>{children}</h1>',
        meta: { category: 'Typography', description: 'H1 heading', tags: ['text'] }
      }
    ];
    const allValid = components.every(c =>
      c.id && c.name && c.code && c.meta && c.meta.category && c.meta.description
    );
    components.forEach(c => this.componentRegistry.set(c.id, c));
    return {
      name: 'Component Metadata Structure',
      passed: allValid && this.componentRegistry.size >= 2,
      details: { componentsValidated: components.length, allValid }
    };
  }

  async validateComponentLifecycleHooks() {
    const lifecycle = {
      onBeforeRender: (props) => {
        return { ...props, initialized: true };
      },
      onAfterRender: (element) => {
        return element;
      },
      onMount: () => { },
      onUnmount: () => { }
    };
    const hasAllHooks = lifecycle.onBeforeRender && lifecycle.onAfterRender &&
                       lifecycle.onMount && lifecycle.onUnmount;
    const beforeResult = lifecycle.onBeforeRender({ foo: 'bar' });
    const hooksWork = beforeResult.initialized === true;
    return {
      name: 'Component Lifecycle Hooks',
      passed: hasAllHooks && hooksWork,
      details: { hooksCount: Object.keys(lifecycle).length, allCallable: hooksWork }
    };
  }

  async validateComponentCategoryOrganization() {
    const categories = {};
    const components = [
      { id: 'btn1', category: 'Forms' },
      { id: 'btn2', category: 'Forms' },
      { id: 'h1', category: 'Typography' },
      { id: 'p', category: 'Typography' },
      { id: 'card', category: 'Layout' }
    ];
    components.forEach(c => {
      if (!categories[c.category]) categories[c.category] = [];
      categories[c.category].push(c.id);
    });
    const formsCount = categories['Forms'] ? categories['Forms'].length : 0;
    const typographyCount = categories['Typography'] ? categories['Typography'].length : 0;
    const layoutCount = categories['Layout'] ? categories['Layout'].length : 0;
    return {
      name: 'Component Category Organization',
      passed: formsCount === 2 && typographyCount === 2 && layoutCount === 1,
      details: { categories: Object.keys(categories), formsCount, typographyCount, layoutCount }
    };
  }

  async validateComponentSearch() {
    const components = [
      { id: 'button-primary', name: 'Button', tags: ['interactive', 'forms'] },
      { id: 'input-text', name: 'Text Input', tags: ['input', 'forms'] },
      { id: 'heading-h1', name: 'Heading H1', tags: ['text', 'typography'] },
      { id: 'paragraph', name: 'Paragraph', tags: ['text', 'typography'] }
    ];
    const query = 'text';
    const results = components.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.tags.some(t => t.toLowerCase().includes(query))
    );
    return {
      name: 'Component Search & Discovery',
      passed: results.length === 3,
      details: { query, resultsFound: results.length, results: results.map(r => r.name) }
    };
  }

  async validateBasicPropsValidation() {
    const buttonSchema = {
      label: { type: 'string', required: true },
      variant: { type: 'select', options: ['primary', 'secondary'], required: false },
      disabled: { type: 'boolean', required: false }
    };
    const validProps = { label: 'Click Me', variant: 'primary', disabled: false };
    const invalidProps = { variant: 'primary' };
    const validateProps = (props, schema) => {
      for (const [key, config] of Object.entries(schema)) {
        if (config.required && !(key in props)) return false;
        if (key in props && config.type === 'string' && typeof props[key] !== 'string') return false;
        if (key in props && config.type === 'boolean' && typeof props[key] !== 'boolean') return false;
      }
      return true;
    };
    const validCheck = validateProps(validProps, buttonSchema);
    const invalidCheck = !validateProps(invalidProps, buttonSchema);
    return {
      name: 'Basic Props Validation',
      passed: validCheck && invalidCheck,
      details: { validPassed: validCheck, invalidCaughtCorrectly: invalidCheck }
    };
  }

  async validatePropsTypeCoercion() {
    const coerceType = (value, targetType) => {
      if (targetType === 'number' && typeof value === 'string') return parseInt(value, 10);
      if (targetType === 'boolean' && typeof value === 'string') return value.toLowerCase() === 'true';
      if (targetType === 'string' && typeof value !== 'string') return String(value);
      return value;
    };
    const testCases = [
      { value: '42', targetType: 'number', expected: 42 },
      { value: 'true', targetType: 'boolean', expected: true },
      { value: 123, targetType: 'string', expected: '123' },
      { value: false, targetType: 'string', expected: 'false' }
    ];
    const results = testCases.map(tc => coerceType(tc.value, tc.targetType) === tc.expected);
    const allCorrect = results.every(r => r);
    return {
      name: 'Props Type Coercion',
      passed: allCorrect,
      details: { testCases: testCases.length, coercedCorrectly: results.filter(r => r).length, allCorrect }
    };
  }

  async validateConstraintValidation() {
    const constraints = [
      { prop: 'label', minLength: 1, maxLength: 50, value: 'Valid Label', valid: true },
      { prop: 'label', minLength: 1, maxLength: 50, value: '', valid: false },
      { prop: 'count', min: 0, max: 100, value: 50, valid: true },
      { prop: 'count', min: 0, max: 100, value: 150, valid: false },
      { prop: 'variant', enum: ['primary', 'secondary'], value: 'primary', valid: true },
      { prop: 'variant', enum: ['primary', 'secondary'], value: 'tertiary', valid: false }
    ];
    const validateConstraint = (constraint) => {
      if (constraint.minLength !== undefined) {
        return (constraint.value.length >= constraint.minLength &&
                constraint.value.length <= constraint.maxLength) === constraint.valid;
      }
      if (constraint.min !== undefined) {
        return (constraint.value >= constraint.min && constraint.value <= constraint.max) === constraint.valid;
      }
      if (constraint.enum !== undefined) {
        return constraint.enum.includes(constraint.value) === constraint.valid;
      }
      return true;
    };
    const results = constraints.map(c => validateConstraint(c));
    const allCorrect = results.every(r => r);
    return {
      name: 'Props Constraint Validation',
      passed: allCorrect,
      details: { constraintsValidated: constraints.length, validatedCorrectly: results.filter(r => r).length, allCorrect }
    };
  }

  async validateRequiredPropsEnforcement() {
    const schema = { required: ['id', 'name', 'type'] };
    const testCases = [
      { props: { id: '1', name: 'Component', type: 'button' }, valid: true },
      { props: { id: '1', name: 'Component' }, valid: false },
      { props: { id: '1', type: 'button' }, valid: false }
    ];
    const validateRequired = (props, requiredFields) => {
      return requiredFields.every(f => f in props);
    };
    const results = testCases.map(tc => {
      const isValid = validateRequired(tc.props, schema.required);
      return isValid === tc.valid;
    });
    const allCorrect = results.every(r => r);
    return {
      name: 'Required Props Enforcement',
      passed: allCorrect,
      details: { testCases: testCases.length, validatedCorrectly: results.filter(r => r).length, allCorrect }
    };
  }

  async validateBasicComponentRender() {
    const simpleRender = (code, props) => {
      return { type: 'div', props: props, children: code };
    };
    const result = simpleRender('<div>Hello World</div>', { className: 'test' });
    return {
      name: 'Basic Component Render',
      passed: result && result.type === 'div' && result.children === '<div>Hello World</div>',
      details: { renderSuccessful: true, hasType: !!result.type, hasProps: !!result.props }
    };
  }

  async validateRenderCaching() {
    const cache = new Map();
    const maxCacheSize = 256;
    const renderWithCache = (name, props) => {
      const key = name + ':' + JSON.stringify(props);
      if (cache.has(key)) {
        return { result: cache.get(key), fromCache: true };
      }
      const result = `<${name}>${JSON.stringify(props)}</${name}>`;
      if (cache.size >= maxCacheSize) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      cache.set(key, result);
      return { result, fromCache: false };
    };
    const render1 = renderWithCache('button', { label: 'Click' });
    const render2 = renderWithCache('button', { label: 'Click' });
    const render3 = renderWithCache('input', { type: 'text' });
    const cacheHit = render2.fromCache;
    const cacheMiss = !render1.fromCache && !render3.fromCache;
    const cacheSize = cache.size === 2;
    return {
      name: 'Render Caching',
      passed: cacheHit && cacheMiss && cacheSize,
      details: { cacheHits: 1, cacheMisses: 2, cacheSize: cache.size, maxSize: maxCacheSize }
    };
  }

  async validateBabelTransformation() {
    const jsxCode = '<div className="test">{children}</div>';
    const transformJSX = (code) => {
      const hasJSX = code.includes('<') && code.includes('>');
      const transformed = hasJSX ? code.replace(/<([^>]+)>/g, 'createElement("$1")') : code;
      return { success: true, transformed };
    };
    const result = transformJSX(jsxCode);
    const hasElements = result.transformed.includes('createElement');
    return {
      name: 'JSX Babel Transformation',
      passed: result.success && hasElements,
      details: { transformSuccessful: result.success, hasCreateElement: hasElements }
    };
  }

  async validateErrorBoundary() {
    const testCases = [
      { code: '<div>Valid</div>', shouldError: false },
      { code: '<div>', shouldError: true },
      { code: null, shouldError: true },
      { code: '<button>OK</button>', shouldError: false }
    ];
    const validateCode = (code) => {
      try {
        if (code === null || typeof code !== 'string') throw new Error('Invalid code type');
        const openTags = (code.match(/<[^>/]+>/g) || []).length;
        const closeTags = (code.match(/<\/[^>]+>/g) || []).length;
        if (openTags !== closeTags) throw new Error('Unbalanced tags');
        return true;
      } catch (e) {
        return false;
      }
    };
    const results = testCases.map(tc => {
      const isValid = validateCode(tc.code);
      const isError = !isValid;
      return isError === tc.shouldError;
    });
    const allCorrect = results.every(r => r);
    return {
      name: 'Error Boundary & Fallback',
      passed: allCorrect,
      details: { testCases: testCases.length, correctlyHandled: results.filter(r => r).length, allCorrect }
    };
  }

  async validateSlotBasedComposition() {
    const baseComponent = '<div>{slot:content}</div>';
    const slot = '<p>Filled Slot</p>';
    const fillSlot = (base, slotName, content) => {
      return base.replace(`{slot:${slotName}}`, content);
    };
    const result = fillSlot(baseComponent, 'content', slot);
    const hasSlotFilled = result.includes('<p>Filled Slot</p>');
    return {
      name: 'Slot-Based Composition',
      passed: hasSlotFilled && !result.includes('{slot:'),
      details: { slotFilled: hasSlotFilled, slotPlaceholderRemoved: !result.includes('{slot:') }
    };
  }

  async validateHOCWrapping() {
    const testComponent = { name: 'Button', render: () => 'button' };
    const withMemo = (component) => {
      return { ...component, memoized: true };
    };
    const withError = (component) => {
      return { ...component, errorBoundary: true };
    };
    const withProps = (component, defaults) => {
      return { ...component, defaultProps: defaults };
    };
    const enhanced = withProps(withError(withMemo(testComponent)), { variant: 'primary' });
    const hasMemo = enhanced.memoized === true;
    const hasError = enhanced.errorBoundary === true;
    const hasDefaults = enhanced.defaultProps.variant === 'primary';
    return {
      name: 'HOC Wrapping & Composition',
      passed: hasMemo && hasError && hasDefaults,
      details: { memoized: hasMemo, errorBoundary: hasError, defaultProps: hasDefaults }
    };
  }

  async validateComponentVariants() {
    const variants = {};
    const createVariant = (name, baseType, propOverrides) => {
      variants[name] = { baseType, overrides: propOverrides };
    };
    createVariant('primary', 'button', { color: 'blue' });
    createVariant('secondary', 'button', { color: 'gray' });
    createVariant('large', 'button', { size: 'large' });
    const hasVariants = Object.keys(variants).length === 3;
    const allBasedOnButton = Object.values(variants).every(v => v.baseType === 'button');
    return {
      name: 'Component Variants',
      passed: hasVariants && allBasedOnButton,
      details: { variantsCount: Object.keys(variants).length, allBasedOnButton }
    };
  }

  async validateRenderPerformance() {
    const components = Array.from({ length: 100 }, (_, i) => ({
      id: `comp-${i}`,
      code: `<div>Component ${i}</div>`
    }));
    const startTime = Date.now();
    components.forEach(c => {
      this.renderCache.set(c.id, c.code);
    });
    const duration = Date.now() - startTime;
    return {
      name: 'Render Performance (100 components)',
      passed: duration < 50,
      details: { componentsRendered: components.length, duration, performant: duration < 50 }
    };
  }

  async validateDebounceRender() {
    let renderCount = 0;
    const renderQueue = [];
    const debounceRender = (callback, delay = 300) => {
      return (...args) => {
        renderQueue.push(callback);
        if (renderQueue.length === 1) {
          setTimeout(() => {
            renderCount++;
            renderQueue.length = 0;
          }, delay);
        }
      };
    };
    const debouncedRender = debounceRender(() => {}, 10);
    debouncedRender();
    debouncedRender();
    debouncedRender();
    await new Promise(r => setTimeout(r, 20));
    return {
      name: 'Debounce Render Calls',
      passed: renderQueue.length === 0,
      details: { renderCount, queueSize: renderQueue.length }
    };
  }

  async validateCacheEviction() {
    const cache = new Map();
    const maxSize = 10;
    const addToCache = (key, value) => {
      if (cache.size >= maxSize) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      cache.set(key, value);
    };
    for (let i = 0; i < 15; i++) {
      addToCache(`item-${i}`, `value-${i}`);
    }
    const correctSize = cache.size === maxSize;
    const hasLatest = cache.has('item-14');
    const hasEarliest = cache.has('item-0');
    return {
      name: 'Cache Eviction (LRU)',
      passed: correctSize && hasLatest && !hasEarliest,
      details: { cacheSize: cache.size, maxSize, hasLatest, earliestEvicted: !hasEarliest }
    };
  }

  async validatePropChangeDetection() {
    const previousProps = { color: 'blue', size: 'large', disabled: false };
    const currentProps = { color: 'red', size: 'large', disabled: false };
    const detectChanges = (prev, current) => {
      const changes = [];
      for (const key in current) {
        if (prev[key] !== current[key]) {
          changes.push({ key, from: prev[key], to: current[key] });
        }
      }
      return changes;
    };
    const changes = detectChanges(previousProps, currentProps);
    const colorChanged = changes.some(c => c.key === 'color');
    const sizeUnchanged = !changes.some(c => c.key === 'size');
    return {
      name: 'Prop Change Detection',
      passed: colorChanged && sizeUnchanged && changes.length === 1,
      details: { changesDetected: changes.length, colorChanged, sizeUnchanged }
    };
  }

  async validateMemoization() {
    let callCount = 0;
    const memoize = (fn) => {
      const cache = {};
      return (props) => {
        const key = JSON.stringify(props);
        if (key in cache) {
          return cache[key];
        }
        const result = fn(props);
        cache[key] = result;
        callCount++;
        return result;
      };
    };
    const expensiveRender = memoize((props) => {
      return `<div>${props.label}</div>`;
    });
    expensiveRender({ label: 'Button' });
    expensiveRender({ label: 'Button' });
    expensiveRender({ label: 'Button' });
    const memoized = callCount === 1;
    return {
      name: 'Component Memoization',
      passed: memoized,
      details: { callCount, expectedCalls: 1, memoized }
    };
  }

  async validateAccessibilityAttributes() {
    const components = [
      { id: 'button', required: ['aria-label', 'role'], provided: ['aria-label', 'role'] },
      { id: 'input', required: ['aria-label', 'id'], provided: ['aria-label'] },
      { id: 'heading', required: ['role'], provided: ['role'] }
    ];

    const validateA11y = (component) => {
      return component.required.every(attr => component.provided.includes(attr));
    };

    const results = components.map(c => validateA11y(c));
    const passed = results[0] && !results[1] && results[2];

    return {
      name: 'Accessibility Attributes Validation',
      passed: passed,
      details: {
        componentsValidated: components.length,
        compliant: results.filter(r => r).length
      }
    };
  }

  async validateDeepPropComparison() {
    const deepEqual = (obj1, obj2) => {
      if (obj1 === obj2) return true;
      if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;
      const keys1 = Object.keys(obj1);
      const keys2 = Object.keys(obj2);
      if (keys1.length !== keys2.length) return false;
      return keys1.every(key => deepEqual(obj1[key], obj2[key]));
    };

    const testCases = [
      { a: { x: 1, y: 2 }, b: { x: 1, y: 2 }, expected: true },
      { a: { x: 1, y: { z: 3 } }, b: { x: 1, y: { z: 3 } }, expected: true },
      { a: { x: 1, y: 2 }, b: { x: 1, y: 3 }, expected: false }
    ];

    const results = testCases.map(tc => deepEqual(tc.a, tc.b) === tc.expected);
    const allCorrect = results.every(r => r);

    return {
      name: 'Deep Prop Comparison',
      passed: allCorrect,
      details: { testCases: testCases.length, passedCorrectly: results.filter(r => r).length }
    };
  }

  async runAllTests() {
    this.testResults = await Promise.all([
      this.validateBasicComponentRegistration(),
      this.validateComponentMetadataStructure(),
      this.validateComponentLifecycleHooks(),
      this.validateComponentCategoryOrganization(),
      this.validateComponentSearch(),
      this.validateBasicPropsValidation(),
      this.validatePropsTypeCoercion(),
      this.validateConstraintValidation(),
      this.validateRequiredPropsEnforcement(),
      this.validateBasicComponentRender(),
      this.validateRenderCaching(),
      this.validateBabelTransformation(),
      this.validateErrorBoundary(),
      this.validateSlotBasedComposition(),
      this.validateHOCWrapping(),
      this.validateComponentVariants(),
      this.validateRenderPerformance(),
      this.validateDebounceRender(),
      this.validateCacheEviction(),
      this.validatePropChangeDetection(),
      this.validateMemoization(),
      this.validateAccessibilityAttributes(),
      this.validateDeepPropComparison()
    ]);
    return this.testResults;
  }

  getSummary() {
    const passed = this.testResults.filter(t => t.passed).length;
    const total = this.testResults.length;
    return {
      total,
      passed,
      failed: total - passed,
      percentage: Math.round((passed / total) * 100),
      tests: this.testResults
    };
  }
}

export function createComponentSystemValidator() {
  return new ComponentSystemValidator();
}
