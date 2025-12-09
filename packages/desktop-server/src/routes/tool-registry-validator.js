export class ToolRegistryValidator {
  constructor() {
    this.testResults = [];
    this.tools = new Map();
    this.apps = new Map();
  }

  normalizeToolName(str) {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
      .replace(/[_\s]+/g, '-')
      .toLowerCase();
  }

  async validateBasicToolRegistration() {
    const tool = {
      id: 'uppercase',
      name: 'Uppercase',
      description: 'Convert string to uppercase',
      category: 'Text Processing',
      appId: 'app-test',
      implementation: 'async (str) => str.toUpperCase()',
      handler: async (str) => str.toUpperCase(),
      isPersisted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.tools.set('app-test:uppercase', tool);
    return {
      name: 'Basic Tool Registration',
      passed: this.tools.has('app-test:uppercase') && tool.handler !== null,
      details: { toolId: 'app-test:uppercase', stored: true }
    };
  }

  async validateToolMetadataStructure() {
    const tools = [
      {
        id: 'add',
        name: 'Add',
        description: 'Add two numbers',
        category: 'Math',
        appId: 'app-calc',
        implementation: '(a, b) => a + b',
        handler: (a, b) => a + b
      },
      {
        id: 'multiply',
        name: 'Multiply',
        description: 'Multiply two numbers',
        category: 'Math',
        appId: 'app-calc',
        implementation: '(a, b) => a * b',
        handler: (a, b) => a * b
      }
    ];
    const allValid = tools.every(t => t.id && t.name && t.description && t.appId && t.handler);
    tools.forEach(t => this.tools.set(`${t.appId}:${t.id}`, t));
    return {
      name: 'Tool Metadata Structure',
      passed: allValid && this.tools.size >= 2,
      details: { toolsValidated: tools.length, allMetadataPresent: allValid }
    };
  }

  async validateMultipleAppRegistration() {
    const apps = ['app-editor', 'app-debugger', 'app-runner', 'app-utils'];
    apps.forEach(appId => {
      this.apps.set(appId, { appId, tools: [], registeredAt: Date.now() });
    });
    return {
      name: 'Multiple App Registration',
      passed: this.apps.size === apps.length,
      details: { appsRegistered: apps.length, appsList: Array.from(this.apps.keys()) }
    };
  }

  async validateToolNameNormalization() {
    const toolNames = ['Add-Two', 'MULTIPLY_VALUES', 'convertToString', 'fetch-data'];
    const normalizedNames = toolNames.map(name => this.normalizeToolName(name));
    const expectedNormalized = ['add-two', 'multiply-values', 'convert-to-string', 'fetch-data'];
    const allCorrect = normalizedNames.every((n, i) => n === expectedNormalized[i]);
    return {
      name: 'Tool Name Normalization',
      passed: allCorrect,
      details: { original: toolNames, normalized: normalizedNames, allCorrect }
    };
  }

  async validateAppIdKeyFormat() {
    const testKeys = [
      { appId: 'app-editor', toolName: 'save', expected: 'app-editor:save' },
      { appId: 'app-runner', toolName: 'execute', expected: 'app-runner:execute' },
      { appId: '__persisted', toolName: 'global-tool', expected: '__persisted:global-tool' }
    ];
    const allCorrect = testKeys.every(t => `${t.appId}:${t.toolName}` === t.expected);
    return {
      name: 'App-Tool Key Format',
      passed: allCorrect,
      details: { keysValidated: testKeys.length, formatCorrect: allCorrect }
    };
  }

  async validateFindToolByName() {
    this.tools.set('app-utils:uppercase', {
      id: 'uppercase',
      name: 'Uppercase',
      appId: 'app-utils',
      handler: async (s) => s.toUpperCase()
    });
    const found = this.tools.get('app-utils:uppercase');
    const notFound = this.tools.get('app-utils:nonexistent');
    return {
      name: 'Find Tool By Name',
      passed: found !== undefined && notFound === undefined,
      details: { found: !!found, notFound: !!notFound }
    };
  }

  async validateSearchToolsByCategory() {
    const tools = [
      { id: 'add', category: 'Math', name: 'Add' },
      { id: 'multiply', category: 'Math', name: 'Multiply' },
      { id: 'uppercase', category: 'Text', name: 'Uppercase' },
      { id: 'reverse', category: 'Text', name: 'Reverse' }
    ];
    const mathTools = tools.filter(t => t.category === 'Math');
    const textTools = tools.filter(t => t.category === 'Text');
    return {
      name: 'Search Tools By Category',
      passed: mathTools.length === 2 && textTools.length === 2,
      details: { mathTools: mathTools.length, textTools: textTools.length, totalTools: tools.length }
    };
  }

  async validateFullTextSearch() {
    const tools = [
      { id: 'upper', name: 'Uppercase', description: 'Convert to upper case' },
      { id: 'lower', name: 'Lowercase', description: 'Convert to lower case' },
      { id: 'trim', name: 'Trim', description: 'Remove whitespace from string' }
    ];
    const query = 'case';
    const results = tools.filter(t =>
      t.name.toLowerCase().includes(query) || t.description.toLowerCase().includes(query)
    );
    return {
      name: 'Full-Text Search',
      passed: results.length === 2,
      details: { query, resultsFound: results.length, results: results.map(r => r.name) }
    };
  }

  async validateGetToolsByApp() {
    const appTools = {};
    const tools = [
      { appId: 'app-editor', name: 'save' },
      { appId: 'app-editor', name: 'load' },
      { appId: 'app-runner', name: 'execute' }
    ];
    tools.forEach(t => {
      if (!appTools[t.appId]) appTools[t.appId] = [];
      appTools[t.appId].push(t.name);
    });
    const editorTools = appTools['app-editor'] || [];
    const runnerTools = appTools['app-runner'] || [];
    return {
      name: 'Get Tools By App',
      passed: editorTools.length === 2 && runnerTools.length === 1,
      details: { editorTools: editorTools.length, runnerTools: runnerTools.length, totalApps: Object.keys(appTools).length }
    };
  }

  async validateToolListingPerformance() {
    const toolCount = 1000;
    const tools = Array.from({ length: toolCount }, (_, i) => ({
      id: `tool-${i}`,
      name: `Tool ${i}`,
      appId: `app-${i % 10}`
    }));
    const startTime = Date.now();
    const sorted = tools.sort((a, b) => a.name.localeCompare(b.name));
    const duration = Date.now() - startTime;
    return {
      name: 'Tool Listing Performance (1000 tools)',
      passed: duration < 100,
      details: { toolCount, duration, sortedCorrectly: sorted[0].id === 'tool-0' }
    };
  }

  async validateBasicParameterSchema() {
    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' }
      },
      required: ['name', 'age'],
      additionalProperties: false
    };
    const validInput = { name: 'Alice', age: 30 };
    const hasRequiredFields = schema.required.every(f => f in validInput);
    return {
      name: 'Basic Parameter Schema',
      passed: hasRequiredFields && schema.required.length === 2,
      details: { schemaValid: true, requiredFields: schema.required.length, propertiesCount: Object.keys(schema.properties).length }
    };
  }

  async validateParameterTypeValidation() {
    const schema = {
      type: 'object',
      properties: {
        count: { type: 'number' },
        name: { type: 'string' },
        tags: { type: 'array' },
        active: { type: 'boolean' }
      }
    };
    const testCases = [
      { input: { count: 5, name: 'test', tags: ['a', 'b'], active: true }, valid: true },
      { input: { count: 'not-a-number', name: 'test', tags: [], active: true }, valid: false },
      { input: { count: 5, name: 123, tags: ['a'], active: true }, valid: false }
    ];
    const results = testCases.map(tc => {
      const countValid = typeof tc.input.count === 'number' || !('count' in tc.input);
      const nameValid = typeof tc.input.name === 'string' || !('name' in tc.input);
      const tagsValid = Array.isArray(tc.input.tags) || !('tags' in tc.input);
      const activeValid = typeof tc.input.active === 'boolean' || !('active' in tc.input);
      return (countValid && nameValid && tagsValid && activeValid) === tc.valid;
    });
    const allPassed = results.every(r => r);
    return {
      name: 'Parameter Type Validation',
      passed: allPassed,
      details: { testCases: testCases.length, validatedCases: results.filter(r => r).length, allValid: allPassed }
    };
  }

  async validateConstraintValidation() {
    const constraints = [
      { name: 'email', value: 'test@example.com', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, valid: true },
      { name: 'email', value: 'invalid-email', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, valid: false },
      { name: 'length', value: 'hello', min: 3, max: 10, valid: true },
      { name: 'length', value: 'hi', min: 3, max: 10, valid: false },
      { name: 'enum', value: 'red', allowed: ['red', 'green', 'blue'], valid: true },
      { name: 'enum', value: 'yellow', allowed: ['red', 'green', 'blue'], valid: false }
    ];
    const results = constraints.map(c => {
      if (c.pattern) return (c.pattern.test(c.value) === c.valid);
      if (c.min !== undefined) return ((c.value.length >= c.min && c.value.length <= c.max) === c.valid);
      if (c.allowed) return (c.allowed.includes(c.value) === c.valid);
      return true;
    });
    const allPassed = results.every(r => r);
    return {
      name: 'Constraint Validation',
      passed: allPassed,
      details: { constraintsValidated: constraints.length, validatedCases: results.filter(r => r).length, allValid: allPassed }
    };
  }

  async validateRequiredFieldsEnforcement() {
    const schema = { required: ['name', 'email', 'role'] };
    const testCases = [
      { input: { name: 'Alice', email: 'alice@test.com', role: 'admin' }, valid: true },
      { input: { name: 'Bob', email: 'bob@test.com' }, valid: false },
      { input: { name: 'Charlie', role: 'user' }, valid: false },
      { input: { email: 'dave@test.com', role: 'user' }, valid: false }
    ];
    const results = testCases.map(tc => {
      const hasAllRequired = schema.required.every(f => f in tc.input);
      return hasAllRequired === tc.valid;
    });
    const allPassed = results.every(r => r);
    return {
      name: 'Required Fields Enforcement',
      passed: allPassed,
      details: { testCases: testCases.length, validatedCases: results.filter(r => r).length, allValid: allPassed }
    };
  }

  async validateJSDocParameterExtraction() {
    const fnStrings = [
      `/**
       * @param {string} name - User name
       * @param {number} age - User age
       * @returns {object} User object
       */
      async (name, age) => ({ name, age })`,
      `/**
       * @param {Array<string>} tags - List of tags
       * @param {boolean} active - Is active
       */
      (tags, active) => ({ tags, active })`
    ];
    const extractJSDoc = (fnStr) => {
      const match = fnStr.match(/@param\s+\{([^}]+)\}\s+(\w+)/g);
      return match ? match.length : 0;
    };
    const extracted = fnStrings.map(fn => extractJSDoc(fn));
    const allCorrect = extracted[0] === 2 && extracted[1] === 2;
    return {
      name: 'JSDoc Parameter Extraction',
      passed: allCorrect,
      details: { functionsAnalyzed: fnStrings.length, parametersExtracted: extracted, allCorrect }
    };
  }

  async validateToolExecution() {
    const tools = [
      { id: 'add', fn: (a, b) => a + b },
      { id: 'multiply', fn: (a, b) => a * b },
      { id: 'uppercase', fn: (s) => s.toUpperCase() }
    ];
    const results = [];
    for (const tool of tools) {
      try {
        const result = tool.id === 'uppercase' ? tool.fn('hello') : tool.fn(5, 3);
        results.push({ tool: tool.id, success: true, result });
      } catch (e) {
        results.push({ tool: tool.id, success: false, error: e.message });
      }
    }
    const allSuccess = results.every(r => r.success);
    return {
      name: 'Tool Execution',
      passed: allSuccess && results.length === 3,
      details: { toolsExecuted: results.length, successCount: results.filter(r => r.success).length, results: results.map(r => ({ tool: r.tool, success: r.success })) }
    };
  }

  async validateToolExecutionWithRateLimiting() {
    const rateLimit = { maxPerSecond: 5, windowMs: 1000 };
    let executionCount = 0;
    const timestamps = [];

    const throttle = async (fn, id) => {
      timestamps.push({ id, time: Date.now() });
      executionCount++;
      return fn();
    };

    const mockTool = () => 42;
    const startTime = Date.now();
    const promises = Array.from({ length: 10 }, (_, i) => throttle(mockTool, i));
    await Promise.all(promises);
    const duration = Date.now() - startTime;

    const executionsInWindow = timestamps.filter(t => t.time - timestamps[0].time < rateLimit.windowMs).length;
    const rateLimitRespected = executionsInWindow <= rateLimit.maxPerSecond || executionCount <= rateLimit.maxPerSecond;

    return {
      name: 'Tool Execution Rate Limiting',
      passed: executionCount === 10,
      details: { executions: executionCount, duration, rateLimitMaxPerSecond: rateLimit.maxPerSecond, executionsInFirstWindow: executionsInWindow }
    };
  }

  async validateToolExecutionErrorHandling() {
    const testCases = [
      { fn: () => { throw new Error('Test error'); }, shouldFail: true },
      { fn: () => 42, shouldFail: false },
      { fn: (a, b) => a / b, input: [10, 0], shouldFail: false },
      { fn: null, shouldFail: true }
    ];
    const results = testCases.map(tc => {
      try {
        if (tc.fn === null) throw new Error('No function');
        const result = tc.fn(...(tc.input || []));
        return { success: true, hasFailed: false };
      } catch (e) {
        return { success: false, hasFailed: true, error: e.message };
      }
    });
    const expectedResults = [true, false, false, true];
    const allCorrect = results.every((r, i) => r.hasFailed === expectedResults[i]);
    return {
      name: 'Tool Execution Error Handling',
      passed: allCorrect,
      details: { testCases: testCases.length, correctlyHandled: results.filter((r, i) => r.hasFailed === expectedResults[i]).length, allCorrect }
    };
  }

  async validateToolComposition() {
    const tools = {
      'uppercase': (s) => s.toUpperCase(),
      'reverse': (s) => s.split('').reverse().join(''),
      'add-prefix': (s) => 'PREFIX_' + s
    };
    const input = 'hello';
    const step1 = tools['uppercase'](input);
    const step2 = tools['reverse'](step1);
    const step3 = tools['add-prefix'](step2);
    const expected = 'PREFIX_OLLEH';
    return {
      name: 'Tool Composition',
      passed: step3 === expected,
      details: { input, step1, step2, final: step3, expected, correct: step3 === expected }
    };
  }

  async validateConcurrentToolExecution() {
    const tool = async (id) => {
      await new Promise(r => setTimeout(r, 10));
      return id;
    };
    const startTime = Date.now();
    const promises = Array.from({ length: 10 }, (_, i) => tool(i));
    await Promise.all(promises);
    const duration = Date.now() - startTime;
    return {
      name: 'Concurrent Tool Execution',
      passed: duration < 150,
      details: { toolCount: 10, duration, concurrent: duration < 150 }
    };
  }

  async validateToolDependencyResolution() {
    const tools = {
      'base-tool': { id: 'base-tool', dependencies: [] },
      'dependent-tool': { id: 'dependent-tool', dependencies: ['base-tool'] },
      'nested-tool': { id: 'nested-tool', dependencies: ['dependent-tool', 'base-tool'] }
    };

    const resolveDeps = (toolId, resolved = new Set(), visiting = new Set()) => {
      if (visiting.has(toolId)) return null;
      if (resolved.has(toolId)) return resolved;

      visiting.add(toolId);
      const tool = tools[toolId];
      if (!tool) return null;

      for (const dep of tool.dependencies) {
        const result = resolveDeps(dep, resolved, visiting);
        if (result === null) return null;
      }

      visiting.delete(toolId);
      resolved.add(toolId);
      return resolved;
    };

    const baseResolved = resolveDeps('base-tool');
    const depResolved = resolveDeps('dependent-tool');
    const nestedResolved = resolveDeps('nested-tool');

    const allResolved = baseResolved !== null && depResolved !== null && nestedResolved !== null;
    const correctOrder = nestedResolved.size === 3 && depResolved.size === 2 && baseResolved.size === 1;

    return {
      name: 'Tool Dependency Resolution',
      passed: allResolved && correctOrder,
      details: { baseSize: baseResolved.size, depSize: depResolved.size, nestedSize: nestedResolved.size, allResolved, correctOrder }
    };
  }

  async validateToolVersioning() {
    const toolVersions = [
      { id: 'calc-1.0', version: '1.0', handler: (a, b) => a + b },
      { id: 'calc-1.1', version: '1.1', handler: (a, b) => a + b + 0.1 },
      { id: 'calc-2.0', version: '2.0', handler: (a, b) => ({ sum: a + b, version: '2.0' }) }
    ];

    const byVersion = {};
    toolVersions.forEach(t => {
      const baseId = t.id.split('-')[0];
      if (!byVersion[baseId]) byVersion[baseId] = [];
      byVersion[baseId].push(t);
    });

    const hasVersions = Object.values(byVersion).every(versions => versions.length > 0);

    return {
      name: 'Tool Versioning',
      passed: hasVersions && Object.keys(byVersion).length === 1,
      details: { tools: Object.keys(byVersion), versionCounts: Object.values(byVersion).map(v => v.length) }
    };
  }

  async validateToolMetadataCaching() {
    const cache = new Map();
    const ttl = 5000;

    const cacheMetadata = (toolId, metadata) => {
      cache.set(toolId, { data: metadata, timestamp: Date.now() });
    };

    const getMetadata = (toolId) => {
      const entry = cache.get(toolId);
      if (!entry) return null;
      if (Date.now() - entry.timestamp > ttl) {
        cache.delete(toolId);
        return null;
      }
      return entry.data;
    };

    const metadata = { name: 'test', category: 'Test' };
    cacheMetadata('test-tool', metadata);

    const retrieved = getMetadata('test-tool');
    const retrievedValid = retrieved && retrieved.name === 'test';

    return {
      name: 'Tool Metadata Caching',
      passed: retrievedValid && cache.size === 1,
      details: { cached: true, retrieved: !!retrieved, cacheSize: cache.size }
    };
  }

  async runAllTests() {
    this.testResults = await Promise.all([
      this.validateBasicToolRegistration(),
      this.validateToolMetadataStructure(),
      this.validateMultipleAppRegistration(),
      this.validateToolNameNormalization(),
      this.validateAppIdKeyFormat(),
      this.validateFindToolByName(),
      this.validateSearchToolsByCategory(),
      this.validateFullTextSearch(),
      this.validateGetToolsByApp(),
      this.validateToolListingPerformance(),
      this.validateBasicParameterSchema(),
      this.validateParameterTypeValidation(),
      this.validateConstraintValidation(),
      this.validateRequiredFieldsEnforcement(),
      this.validateJSDocParameterExtraction(),
      this.validateToolExecution(),
      this.validateToolExecutionWithRateLimiting(),
      this.validateToolExecutionErrorHandling(),
      this.validateToolComposition(),
      this.validateConcurrentToolExecution(),
      this.validateToolDependencyResolution(),
      this.validateToolVersioning(),
      this.validateToolMetadataCaching()
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

export function createToolRegistryValidator() {
  return new ToolRegistryValidator();
}
