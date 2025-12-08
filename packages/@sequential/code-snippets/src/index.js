const TASK_SNIPPETS = {
  validation: [
    {
      id: 'task-required-field',
      name: 'Check Required Field',
      category: 'Validation',
      description: 'Validate required fields at task entry',
      code: `if (!input.{{fieldName}}) {
  throw new Error('Missing required field: {{fieldName}}');
}`,
      templateVars: [{ name: 'fieldName', prompt: 'Field name to check?' }],
      language: 'javascript',
      complexity: 'beginner'
    },
    {
      id: 'task-type-validation',
      name: 'Type Validation',
      category: 'Validation',
      description: 'Validate parameter types',
      code: `if (typeof input.{{fieldName}} !== '{{expectedType}}') {
  throw new Error('Expected {{fieldName}} to be {{expectedType}}, got ' + typeof input.{{fieldName}});
}`,
      templateVars: [
        { name: 'fieldName', prompt: 'Field name?' },
        { name: 'expectedType', prompt: 'Expected type (string/number/boolean/object)?' }
      ],
      language: 'javascript',
      complexity: 'beginner'
    },
    {
      id: 'task-enum-validation',
      name: 'Enum Validation',
      category: 'Validation',
      description: 'Validate against allowed values',
      code: `const allowed = [{{allowedValues}}];
if (!allowed.includes(input.{{fieldName}})) {
  throw new Error('{{fieldName}} must be one of: ' + allowed.join(', '));
}`,
      templateVars: [
        { name: 'fieldName', prompt: 'Field name?' },
        { name: 'allowedValues', prompt: 'Allowed values (comma-separated, quoted)?' }
      ],
      language: 'javascript',
      complexity: 'beginner'
    }
  ],
  http: [
    {
      id: 'task-http-fetch',
      name: 'HTTP Fetch with Error Handling',
      category: 'HTTP Patterns',
      description: 'Fetch with error handling and headers',
      code: `try {
  const response = await fetch('{{url}}', {
    method: '{{method}}',
    headers: {
      'Content-Type': 'application/json',
      {{additionalHeaders}}
    },
    timeout: {{timeout}}
  });

  if (!response.ok) {
    throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
  }

  return await response.json();
} catch (error) {
  throw new Error('Fetch failed: ' + error.message);
}`,
      templateVars: [
        { name: 'url', prompt: 'URL to fetch?' },
        { name: 'method', prompt: 'HTTP method (GET/POST/PUT/DELETE)?' },
        { name: 'additionalHeaders', prompt: 'Additional headers (e.g., "Authorization: Bearer token")?' },
        { name: 'timeout', prompt: 'Timeout in milliseconds?' }
      ],
      language: 'javascript',
      complexity: 'intermediate'
    },
    {
      id: 'task-http-retry',
      name: 'Fetch with Retry Logic',
      category: 'HTTP Patterns',
      description: 'Retry failed HTTP requests with exponential backoff',
      code: `async function fetchWithRetry(url, options = {}, maxRetries = {{retries}}) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
      return await response.json();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const delay = Math.pow(2, i) * {{baseDelay}};
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

return await fetchWithRetry('{{url}}', {}, {{retries}});`,
      templateVars: [
        { name: 'url', prompt: 'URL to fetch?' },
        { name: 'retries', prompt: 'Max retries (default: 3)?' },
        { name: 'baseDelay', prompt: 'Base delay in ms (default: 1000)?' }
      ],
      language: 'javascript',
      complexity: 'intermediate'
    }
  ],
  toolCalls: [
    {
      id: 'task-tool-call-simple',
      name: 'Call Tool with Error Handling',
      category: 'Tool Calls',
      description: 'Call another tool safely',
      code: `try {
  const result = await __callHostTool__('{{toolType}}', '{{toolName}}', {
    {{params}}
  });

  if (result.error) {
    throw new Error(\`Tool failed: \${result.error.message}\`);
  }

  return { success: true, data: result };
} catch (error) {
  return { success: false, error: error.message };
}`,
      templateVars: [
        { name: 'toolType', prompt: 'Tool type (tool/task/flow)?' },
        { name: 'toolName', prompt: 'Tool/Task/Flow name?' },
        { name: 'params', prompt: 'Parameters (key: value format)?' }
      ],
      language: 'javascript',
      complexity: 'beginner'
    },
    {
      id: 'task-tool-call-parallel',
      name: 'Multiple Parallel Tool Calls',
      category: 'Tool Calls',
      description: 'Call multiple tools in parallel',
      code: `const promises = [
  __callHostTool__('{{toolType1}}', '{{toolName1}}', {{params1}}),
  __callHostTool__('{{toolType2}}', '{{toolName2}}', {{params2}})
];

try {
  const [result1, result2] = await Promise.all(promises);
  return { success: true, results: [result1, result2] };
} catch (error) {
  return { success: false, error: error.message };
}`,
      templateVars: [
        { name: 'toolType1', prompt: 'First tool type?' },
        { name: 'toolName1', prompt: 'First tool name?' },
        { name: 'params1', prompt: 'First tool params?' },
        { name: 'toolType2', prompt: 'Second tool type?' },
        { name: 'toolName2', prompt: 'Second tool name?' },
        { name: 'params2', prompt: 'Second tool params?' }
      ],
      language: 'javascript',
      complexity: 'intermediate'
    }
  ],
  errorHandling: [
    {
      id: 'task-try-catch-logging',
      name: 'Try/Catch with Logging',
      category: 'Error Handling',
      description: 'Error handling with detailed logging',
      code: `try {
  {{codeBlock}}
} catch (error) {
  console.error('[{{taskName}}] Error:', error.message);
  console.error('Stack:', error.stack);
  console.error('Context:', { input, timestamp: new Date().toISOString() });

  return {
    success: false,
    error: error.message,
    code: error.code || 'UNKNOWN_ERROR',
    timestamp: new Date().toISOString()
  };
}`,
      templateVars: [
        { name: 'taskName', prompt: 'Task name for logging?' },
        { name: 'codeBlock', prompt: 'Code to execute?' }
      ],
      language: 'javascript',
      complexity: 'intermediate'
    },
    {
      id: 'task-error-context',
      name: 'Error with Context',
      category: 'Error Handling',
      description: 'Enrich errors with context information',
      code: `const errorContext = {
  taskName: '{{taskName}}',
  input,
  timestamp: new Date().toISOString(),
  {{additionalContext}}
};

try {
  {{codeBlock}}
} catch (error) {
  const enrichedError = new Error(error.message);
  enrichedError.context = errorContext;
  throw enrichedError;
}`,
      templateVars: [
        { name: 'taskName', prompt: 'Task name?' },
        { name: 'additionalContext', prompt: 'Additional context fields?' },
        { name: 'codeBlock', prompt: 'Code to execute?' }
      ],
      language: 'javascript',
      complexity: 'intermediate'
    }
  ],
  logging: [
    {
      id: 'task-debug-logging',
      name: 'Debug Logging',
      category: 'Logging',
      description: 'Structured logging for debugging',
      code: `const log = {
  debug: (msg, data) => console.log('[DEBUG]', msg, data),
  info: (msg, data) => console.log('[INFO]', msg, data),
  error: (msg, data) => console.error('[ERROR]', msg, data)
};

log.info('Task started', { input, timestamp: new Date().toISOString() });
{{codeBlock}}
log.info('Task completed', { success: true });`,
      templateVars: [{ name: 'codeBlock', prompt: 'Code to execute?' }],
      language: 'javascript',
      complexity: 'beginner'
    },
    {
      id: 'task-performance-timing',
      name: 'Performance Timing',
      category: 'Logging',
      description: 'Measure execution time',
      code: `const startTime = Date.now();
console.log('[PERF] Starting {{operationName}}');

{{codeBlock}}

const duration = Date.now() - startTime;
console.log('[PERF] {{operationName}} completed in', duration, 'ms');
return { {{returnValue}}, duration };`,
      templateVars: [
        { name: 'operationName', prompt: 'Operation name?' },
        { name: 'codeBlock', prompt: 'Code to execute?' },
        { name: 'returnValue', prompt: 'Return value (key: value)?' }
      ],
      language: 'javascript',
      complexity: 'beginner'
    }
  ],
  async: [
    {
      id: 'task-promise-all',
      name: 'Promise.all for Parallel Execution',
      category: 'Async Patterns',
      description: 'Execute multiple async operations in parallel',
      code: `const promises = [
  {{promise1}},
  {{promise2}},
  {{promise3}}
];

try {
  const [result1, result2, result3] = await Promise.all(promises);
  return {
    success: true,
    data: { result1, result2, result3 }
  };
} catch (error) {
  return { success: false, error: error.message };
}`,
      templateVars: [
        { name: 'promise1', prompt: 'First promise?' },
        { name: 'promise2', prompt: 'Second promise?' },
        { name: 'promise3', prompt: 'Third promise?' }
      ],
      language: 'javascript',
      complexity: 'intermediate'
    },
    {
      id: 'task-sequential-chain',
      name: 'Sequential Promise Chain',
      category: 'Async Patterns',
      description: 'Execute async operations sequentially',
      code: `let result = input;

try {
  result = await {{step1}};
  console.log('Step 1 complete:', result);

  result = await {{step2}};
  console.log('Step 2 complete:', result);

  result = await {{step3}};
  console.log('Step 3 complete:', result);

  return { success: true, data: result };
} catch (error) {
  return { success: false, error: error.message };
}`,
      templateVars: [
        { name: 'step1', prompt: 'First async operation?' },
        { name: 'step2', prompt: 'Second async operation?' },
        { name: 'step3', prompt: 'Third async operation?' }
      ],
      language: 'javascript',
      complexity: 'intermediate'
    }
  ]
};

const TOOL_SNIPPETS = {
  validation: [
    {
      id: 'tool-param-validation',
      name: 'Parameter Validation',
      category: 'Validation',
      description: 'Validate tool parameters',
      code: `if (!params.{{fieldName}}) {
  return {
    success: false,
    error: 'Missing required parameter: {{fieldName}}',
    code: 'MISSING_PARAM'
  };
}`,
      templateVars: [{ name: 'fieldName', prompt: 'Parameter name to validate?' }],
      language: 'javascript',
      complexity: 'beginner'
    },
    {
      id: 'tool-type-check',
      name: 'Type Check',
      category: 'Validation',
      description: 'Validate parameter types',
      code: `const {{fieldName}}Type = typeof params.{{fieldName}};
if ({{fieldName}}Type !== '{{expectedType}}') {
  return {
    success: false,
    error: \`Parameter {{fieldName}} must be {{expectedType}}, got \${{{fieldName}}Type}\`,
    code: 'INVALID_TYPE'
  };
}`,
      templateVars: [
        { name: 'fieldName', prompt: 'Parameter name?' },
        { name: 'expectedType', prompt: 'Expected type?' }
      ],
      language: 'javascript',
      complexity: 'beginner'
    }
  ],
  errorHandling: [
    {
      id: 'tool-error-response',
      name: 'Error Response',
      category: 'Error Handling',
      description: 'Return structured error response',
      code: `return {
  success: false,
  error: '{{errorMessage}}',
  code: '{{errorCode}}',
  context: {
    timestamp: new Date().toISOString(),
    params: params
  }
};`,
      templateVars: [
        { name: 'errorMessage', prompt: 'Error message?' },
        { name: 'errorCode', prompt: 'Error code (e.g., INVALID_INPUT)?' }
      ],
      language: 'javascript',
      complexity: 'beginner'
    },
    {
      id: 'tool-try-catch',
      name: 'Try/Catch Error Handling',
      category: 'Error Handling',
      description: 'Execute with try/catch',
      code: `try {
  {{toolLogic}}
} catch (error) {
  console.error('[{{toolName}}] Error:', error);
  return {
    success: false,
    error: error.message,
    code: 'EXECUTION_ERROR',
    timestamp: new Date().toISOString()
  };
}`,
      templateVars: [
        { name: 'toolName', prompt: 'Tool name for logging?' },
        { name: 'toolLogic', prompt: 'Tool logic to execute?' }
      ],
      language: 'javascript',
      complexity: 'intermediate'
    }
  ],
  logging: [
    {
      id: 'tool-contextual-log',
      name: 'Contextual Logging',
      category: 'Logging',
      description: 'Log with request context',
      code: `const requestId = params.requestId || '{{defaultId}}';
console.log(\`[\${requestId}] {{toolName}} invoked\`, {
  params,
  timestamp: new Date().toISOString()
});

{{toolLogic}}

console.log(\`[\${requestId}] {{toolName}} completed\`, {
  success: true,
  duration: Date.now() - startTime
});`,
      templateVars: [
        { name: 'defaultId', prompt: 'Default request ID?' },
        { name: 'toolName', prompt: 'Tool name?' },
        { name: 'toolLogic', prompt: 'Tool logic?' }
      ],
      language: 'javascript',
      complexity: 'intermediate'
    },
    {
      id: 'tool-perf-log',
      name: 'Performance Logging',
      category: 'Logging',
      description: 'Log execution performance',
      code: `const startTime = Date.now();
console.log('[PERF] {{toolName}} starting');

{{toolLogic}}

const duration = Date.now() - startTime;
console.log('[PERF] {{toolName}} completed in', duration, 'ms');`,
      templateVars: [
        { name: 'toolName', prompt: 'Tool name?' },
        { name: 'toolLogic', prompt: 'Tool logic?' }
      ],
      language: 'javascript',
      complexity: 'beginner'
    }
  ],
  transforms: [
    {
      id: 'tool-map-transform',
      name: 'Array Map Transform',
      category: 'Transforms',
      description: 'Transform array elements',
      code: `const {{outputName}} = params.{{inputName}}.map(item => ({
  {{mappedFields}}
}));

return {
  success: true,
  data: {{outputName}},
  count: {{outputName}}.length
};`,
      templateVars: [
        { name: 'inputName', prompt: 'Input array parameter?' },
        { name: 'outputName', prompt: 'Output variable name?' },
        { name: 'mappedFields', prompt: 'Mapped fields (e.g., id: item.id, name: item.name)?' }
      ],
      language: 'javascript',
      complexity: 'intermediate'
    },
    {
      id: 'tool-filter-data',
      name: 'Array Filter',
      category: 'Transforms',
      description: 'Filter array based on predicate',
      code: `const {{outputName}} = params.{{inputName}}.filter(item => {
  return {{predicate}};
});

return {
  success: true,
  data: {{outputName}},
  count: {{outputName}}.length,
  filtered: params.{{inputName}}.length - {{outputName}}.length
};`,
      templateVars: [
        { name: 'inputName', prompt: 'Input array parameter?' },
        { name: 'outputName', prompt: 'Output variable name?' },
        { name: 'predicate', prompt: 'Filter predicate (e.g., item.status === "active")?' }
      ],
      language: 'javascript',
      complexity: 'intermediate'
    }
  ],
  responses: [
    {
      id: 'tool-success-response',
      name: 'Success Response',
      category: 'Response Formatting',
      description: 'Formatted success response',
      code: `return {
  success: true,
  data: {{responseData}},
  meta: {
    timestamp: new Date().toISOString(),
    duration: Date.now() - startTime
  }
};`,
      templateVars: [{ name: 'responseData', prompt: 'Response data (variable or value)?' }],
      language: 'javascript',
      complexity: 'beginner'
    },
    {
      id: 'tool-paginated-response',
      name: 'Paginated Response',
      category: 'Response Formatting',
      description: 'Return paginated data',
      code: `return {
  success: true,
  data: {{items}},
  pagination: {
    offset: {{offset}},
    limit: {{limit}},
    total: {{total}},
    hasMore: {{offset}} + {{limit}} < {{total}}
  },
  timestamp: new Date().toISOString()
};`,
      templateVars: [
        { name: 'items', prompt: 'Items array?' },
        { name: 'offset', prompt: 'Pagination offset?' },
        { name: 'limit', prompt: 'Page limit?' },
        { name: 'total', prompt: 'Total count?' }
      ],
      language: 'javascript',
      complexity: 'intermediate'
    }
  ]
};

class SnippetManager {
  constructor(type) {
    this.type = type;
    this.snippets = type === 'task' ? TASK_SNIPPETS : TOOL_SNIPPETS;
  }

  getSnippetsByCategory(category) {
    const allSnippets = Object.values(this.snippets).flat();
    return allSnippets.filter(s => s.category === category);
  }

  getAllCategories() {
    const allSnippets = Object.values(this.snippets).flat();
    const categories = new Set(allSnippets.map(s => s.category));
    return Array.from(categories).sort();
  }

  getAllSnippets() {
    return Object.values(this.snippets).flat();
  }

  getSnippetById(id) {
    const allSnippets = this.getAllSnippets();
    return allSnippets.find(s => s.id === id);
  }

  searchSnippets(query) {
    const allSnippets = this.getAllSnippets();
    const q = query.toLowerCase();
    return allSnippets.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
    );
  }

  getIndentLevel(text, cursorPos) {
    const lineStart = text.lastIndexOf('\n', cursorPos - 1) + 1;
    const lineText = text.substring(lineStart, cursorPos);
    const match = lineText.match(/^(\s*)/);
    return match ? match[1].length : 0;
  }

  insertSnippetAtCursor(editorElement, snippet, templateVars) {
    const textarea = editorElement;
    const cursorPos = textarea.selectionStart;
    const text = textarea.value;

    const indentLevel = this.getIndentLevel(text, cursorPos);
    const indentStr = ' '.repeat(indentLevel);

    let code = snippet.code;
    for (const varDef of snippet.templateVars) {
      const value = templateVars[varDef.name] || varDef.name;
      code = code.replace(new RegExp(`{{${varDef.name}}}`, 'g'), value);
    }

    const indentedCode = code.split('\n')
      .map((line, i) => i === 0 ? line : indentStr + line)
      .join('\n');

    const newText = text.substring(0, cursorPos) + indentedCode + text.substring(cursorPos);
    textarea.value = newText;
    textarea.selectionStart = textarea.selectionEnd = cursorPos + indentedCode.length;

    if (textarea.onchange) textarea.onchange();
    if (textarea.oninput) textarea.oninput();
  }
}

export { SnippetManager, TASK_SNIPPETS, TOOL_SNIPPETS };
