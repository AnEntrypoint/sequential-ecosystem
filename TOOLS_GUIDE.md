# Tools Guide - Complete Reference

Complete guide to understanding, creating, and using tools in Sequential Ecosystem.

## What is a Tool?

A tool is a reusable function available to tasks, flows, and apps. Tools are the primary unit of composition in Sequential, enabling code reuse and decoupling.

**Key Properties:**
- Single responsibility (one function)
- Discoverable (registry-based)
- Reusable (across contexts)
- Versioned (with metadata)
- Categorized (for organization)

## Tool Lifecycle

```
Create (via CLI)
    ↓
Define (implement function)
    ↓
Register (add to registry)
    ↓
Discover (visible in API)
    ↓
Use (in tasks/flows/apps)
    ↓
Execute (invoke with input)
```

## Creating Tools

### Step 1: Generate from Template

```bash
npx sequential-ecosystem create-tool my-tool --template compute
```

Creates `tools/my-tool.js` with scaffold:

```javascript
export const config = {
  id: '...',
  name: 'my-tool',
  description: 'Tool description',
  category: 'Custom',
  parameters: { /* ... */ }
};

export async function myTool(input) {
  // TODO: Implement
  return { success: true, input };
}
```

### Step 2: Implement Function

Add your logic to the exported async function:

```javascript
export async function myTool(input) {
  // Validate input
  if (!input.required) {
    throw new Error('Required parameter missing');
  }

  // Process
  const result = performOperation(input);

  // Return result
  return {
    success: true,
    result,
    processedAt: new Date().toISOString()
  };
}
```

### Step 3: Register Tool

**Option A: Runtime Registration (AppSDK)**
```javascript
const sdk = new AppSDK({ appId: 'my-app' });
sdk.tool('my-tool', myTool, 'Tool description');
await sdk.initTools();
```

**Option B: Persistent Registration (API)**
```bash
curl -X POST http://localhost:3000/api/tools \
  -H "Content-Type: application/json" \
  -d '{
    "id": "my-tool-123",
    "name": "my-tool",
    "description": "Tool description",
    "category": "Custom",
    "implementation": "async (input) => { /* ... */ }",
    "parameters": { /* ... */ }
  }'
```

### Step 4: Discover Tool

```bash
# List all tools
curl http://localhost:3000/api/tools

# Search for tool
curl 'http://localhost:3000/api/tools/search?q=my-tool'

# Get tools for app
curl http://localhost:3000/api/tools/app/app-my-app

# Get specific tool
curl http://localhost:3000/api/tools/my-tool-123
```

## Tool Templates

### Compute Template

**Use for:** Data transformation, calculations, aggregations

```javascript
export async function transformData(input) {
  const transformed = {
    ...input,
    processed: true,
    timestamp: new Date().toISOString()
  };
  return { success: true, data: transformed };
}
```

**Example: Uppercase Converter**
```javascript
export async function uppercaseText(input) {
  const { text } = input;
  if (!text || typeof text !== 'string') {
    throw new Error('text must be a string');
  }
  return { result: text.toUpperCase() };
}
```

### API Template

**Use for:** HTTP requests, REST APIs, webhooks

```javascript
export async function callApi(input) {
  const { method = 'GET', url, headers = {}, body } = input;

  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await response.json();
  return { success: response.ok, status: response.status, data };
}
```

**Example: GitHub API Client**
```javascript
export async function getGithubUser(input) {
  const { username } = input;
  const response = await fetch(`https://api.github.com/users/${username}`);
  const user = await response.json();

  return {
    success: response.ok,
    user: {
      name: user.name,
      bio: user.bio,
      followers: user.followers,
      repos: user.public_repos
    }
  };
}
```

### Database Template

**Use for:** SQL queries, database operations

```javascript
export async function queryDatabase(input) {
  const { query, params = {} } = input;

  // TODO: Connect to actual database
  // const db = await getDbConnection();
  // const result = await db.query(query, params);

  return {
    success: true,
    rows: [],
    rowCount: 0
  };
}
```

**Example: User Lookup**
```javascript
export async function getUserById(input) {
  const { userId } = input;

  // Assuming DB connection available
  const db = await getDatabase();
  const user = await db.query('SELECT * FROM users WHERE id = ?', [userId]);

  if (!user) {
    throw new Error(`User ${userId} not found`);
  }

  return { success: true, user };
}
```

### Validation Template

**Use for:** Input validation, verification, sanitization

```javascript
export async function validateInput(input) {
  const { data, schema } = input;
  const errors = [];

  // TODO: Implement validation logic
  // Examples:
  // - Check required fields
  // - Verify type matching
  // - Validate email/URL format
  // - Check value ranges

  return {
    success: errors.length === 0,
    errors,
    data
  };
}
```

**Example: Email Validator**
```javascript
export async function validateEmail(input) {
  const { email } = input;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const valid = emailRegex.test(email);

  return {
    success: valid,
    valid,
    email,
    error: valid ? null : 'Invalid email format'
  };
}
```

## Tool Configuration

### Parameters

Define tool parameters in config:

```javascript
export const config = {
  // ... other fields ...
  parameters: {
    userId: {
      type: 'string',
      description: 'User ID to lookup',
      required: true
    },
    format: {
      type: 'string',
      description: 'Response format',
      default: 'json',
      enum: ['json', 'csv', 'xml']
    },
    timeout: {
      type: 'number',
      description: 'Request timeout in ms',
      default: 30000
    }
  }
};
```

**Parameter Types:**
- `string` - Text input
- `number` - Integer or float
- `boolean` - True/false
- `object` - JSON object
- `array` - Array of items
- `any` - Unrestricted type

### Categories

Organize tools by category:

```javascript
export const config = {
  // ... other fields ...
  category: 'Database'  // Group tools by category
};
```

**Common Categories:**
- Data Processing
- API Integration
- Database
- Validation
- Authentication
- Notification
- File Operations
- Analytics
- Custom

## Using Tools

### From a Task

```javascript
export async function processUserData(input) {
  // Call tool with parameters
  const validationResult = await __callHostTool__('my-app', 'validate-email', {
    email: input.email
  });

  if (!validationResult.valid) {
    throw new Error('Invalid email');
  }

  // Use another tool
  const userData = await __callHostTool__('my-app', 'fetch-user', {
    userId: input.userId
  });

  return { success: true, user: userData };
}
```

### From a Flow

```javascript
export async function validateAndSave(context) {
  const validation = await __callHostTool__('validators', 'validate-user', {
    data: context.user
  });

  if (!validation.success) {
    throw new Error('Validation failed');
  }

  return { validated: true };
}
```

### From an App

```javascript
const sdk = new AppSDK({ appId: 'my-app' });

// Register tool
sdk.tool('greet', async (name) => `Hello, ${name}!`);

// Use tool
const result = await sdk.tools('invoke', 'greet', { name: 'Alice' });
console.log(result); // "Hello, Alice!"
```

### Via API

```javascript
// Execute tool directly
const response = await fetch('/api/tools/app/my-app/validate-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com' })
});

const result = await response.json();
```

## Tool Patterns

### Error Handling Pattern

```javascript
export async function fetchData(input) {
  try {
    const response = await fetch(input.url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };

  } catch (error) {
    logger.error('Fetch failed:', error.message);
    throw {
      success: false,
      error: error.message,
      url: input.url
    };
  }
}
```

### Validation Pattern

```javascript
export async function processPayment(input) {
  // Validate required fields
  const required = ['amount', 'cardToken', 'currency'];
  for (const field of required) {
    if (!(field in input)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // Validate types
  if (typeof input.amount !== 'number' || input.amount <= 0) {
    throw new Error('Amount must be a positive number');
  }

  // Process
  const result = await processWithPaymentProvider(input);
  return { success: true, transactionId: result.id };
}
```

### Retry Pattern

```javascript
export async function retryableApiCall(input) {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(input.url);
      if (!response.ok && response.status >= 500) {
        throw new Error(`Server error: ${response.status}`);
      }
      return { success: true, data: await response.json() };

    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        // Wait before retry (exponential backoff)
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
      }
    }
  }

  throw lastError;
}
```

### Caching Pattern

```javascript
const cache = new Map();

export async function cachedApiCall(input) {
  const cacheKey = JSON.stringify(input);

  if (cache.has(cacheKey)) {
    return { success: true, cached: true, ...cache.get(cacheKey) };
  }

  const result = await fetchFromApi(input);

  // Cache for 5 minutes
  cache.set(cacheKey, result);
  setTimeout(() => cache.delete(cacheKey), 5 * 60 * 1000);

  return { success: true, cached: false, ...result };
}
```

## Best Practices

### 1. Single Responsibility

Each tool should do one thing well:

```javascript
// ✓ Good: Validates email format
export async function validateEmail(input) {
  const valid = /^.+@.+\..+$/.test(input.email);
  return { valid };
}

// ✗ Bad: Does too many things
export async function processUser(input) {
  // validation + API call + database insert + email sending
}
```

### 2. Consistent Responses

Return structured, predictable responses:

```javascript
// ✓ Good: Consistent format
return {
  success: boolean,
  data: any,
  error: string | null,
  timestamp: ISO8601
};

// ✗ Bad: Inconsistent returns
if (error) return error;
if (success) return data;
```

### 3. Input Validation

Always validate inputs before processing:

```javascript
// ✓ Good: Validates input
export async function divideNumbers(input) {
  const { dividend, divisor } = input;

  if (typeof dividend !== 'number' || typeof divisor !== 'number') {
    throw new Error('Both inputs must be numbers');
  }

  if (divisor === 0) {
    throw new Error('Cannot divide by zero');
  }

  return { result: dividend / divisor };
}

// ✗ Bad: No validation
export async function divideNumbers(input) {
  return { result: input.dividend / input.divisor };
}
```

### 4. Descriptive Naming

Use clear, self-documenting names:

```javascript
// ✓ Good: Clear intent
export async function calculateMonthlyMortgagePayment(input) { }
export async function validateCreditCardNumber(input) { }
export async function fetchUserProfileByEmail(input) { }

// ✗ Bad: Vague names
export async function calculate(input) { }
export async function validate(input) { }
export async function fetch(input) { }
```

### 5. Logging

Use structured logging for debugging:

```javascript
export async function complexOperation(input) {
  logger.info('Starting operation', { userId: input.userId });

  try {
    const step1 = await doStep1();
    logger.debug('Step 1 complete', { result: step1 });

    const step2 = await doStep2(step1);
    logger.info('Operation successful', { result: step2 });

    return { success: true, result: step2 };

  } catch (error) {
    logger.error('Operation failed', { error: error.message });
    throw error;
  }
}
```

## Testing Tools

### Quick Test via API

```bash
# Execute and see result immediately
curl -X POST http://localhost:3000/api/tools/app/my-app/my-tool \
  -H "Content-Type: application/json" \
  -d '{"param1":"value"}'
```

### Test in a Task

```javascript
export async function testMyTool(input) {
  const result = await __callHostTool__('my-app', 'my-tool', {
    param1: 'test-value'
  });

  console.log('Tool result:', result);
  return result;
}
```

### Test in an App

```javascript
const sdk = new AppSDK({ appId: 'my-app' });

async function testTool() {
  try {
    const result = await sdk.tools('invoke', 'my-tool', {
      param1: 'test-value'
    });
    console.log('Success:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

testTool();
```

## Tool Discovery

### CLI

```bash
# List all tools
curl http://localhost:3000/api/tools | jq '.'

# List with pretty formatting
curl http://localhost:3000/api/tools | jq '.data[] | {name, description, category}'
```

### In Code

```javascript
// Get all tools
const allTools = await fetch('/api/tools')
  .then(r => r.json())
  .then(r => r.data);

// Get tools for app
const appTools = await fetch('/api/tools/app/my-app')
  .then(r => r.json())
  .then(r => r.data);

// Search tools
const searchResults = await fetch('/api/tools/search?q=email')
  .then(r => r.json())
  .then(r => r.data);
```

## Troubleshooting

### Tool not found

```bash
# Check if registered
curl 'http://localhost:3000/api/tools/search?q=my-tool'

# List all tools for app
curl http://localhost:3000/api/tools/app/my-app

# Verify tool ID
curl http://localhost:3000/api/tools | jq '.data[] | select(.name=="my-tool")'
```

### Tool execution failed

```bash
# Check error details
curl -X POST http://localhost:3000/api/tools/app/my-app/my-tool \
  -H "Content-Type: application/json" \
  -d '{"test": "input"}'

# Look for 'error' field in response
# Check logs with: tail -f ~/.sequential-errors/YYYY-MM-DD.jsonl
```

### Parameter type mismatch

```javascript
// ✓ Good: Check types
if (typeof input.count !== 'number') {
  throw new Error('count must be a number');
}

// ✓ Good: Coerce if safe
const count = parseInt(input.count, 10);
if (isNaN(count)) throw new Error('count must be numeric');
```

## Advanced Topics

### Tool Composition

Create tools that use other tools:

```javascript
export async function emailAndNotify(input) {
  // Use multiple tools in sequence
  const validation = await __callHostTool__('validators', 'validate-email', input);

  if (!validation.valid) {
    throw new Error('Invalid email');
  }

  const sent = await __callHostTool__('notifications', 'send-email', {
    email: input.email,
    subject: 'Notification',
    body: 'Hello'
  });

  return { success: true, messageSent: sent.id };
}
```

### Tool Versioning

Version tools for compatibility:

```javascript
export const config = {
  id: 'fetch-user-v2',
  name: 'fetch-user',
  version: '2.0.0',  // Increment on breaking changes
  description: 'Fetch user (v2)',
  parameters: { /* v2 parameters */ }
};
```

### Conditional Tool Behavior

```javascript
export async function flexibleFetch(input) {
  const { url, format = 'json', cache = true } = input;

  if (cache && cachedResponse.has(url)) {
    return { cached: true, data: cachedResponse.get(url) };
  }

  const response = await fetch(url);

  let data;
  if (format === 'json') {
    data = await response.json();
  } else if (format === 'text') {
    data = await response.text();
  } else {
    throw new Error(`Unknown format: ${format}`);
  }

  if (cache) {
    cachedResponse.set(url, data);
  }

  return { cached: false, data };
}
```

## See Also

- **DX_GUIDE.md** - Overall developer experience guide
- **CLAUDE.md** - Project overview
- Tool Registry API docs - `/api/tools` endpoints
