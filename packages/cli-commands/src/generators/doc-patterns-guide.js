export function patternsGuideSection() {
  return `## Part 3: Writing Tasks

### Task Structure

Tasks are async functions that can be paused and resumed:

\`\`\`javascript
export async function myTask(input) {
  const { userId, orderId } = input;

  const user = await fetch(\`/api/users/\${userId}\`).then(r => r.json());
  const order = await fetch(\`/api/orders/\${orderId}\`).then(r => r.json());

  return { user, order, success: true };
}
\`\`\`

### Error Handling

\`\`\`javascript
export async function resilientTask(input) {
  try {
    const result = await fetch('/api/external').then(r => r.json());
    return result;
  } catch (error) {
    console.error('API call failed:', error.message);
    throw new Error('Task failed after retry');
  }
}
\`\`\`

### State Management

Use global scope for persistent state:

\`\`\`javascript
export async function userOnboarding(input) {
  globalThis.progress = globalThis.progress || { step: 0, user: null };

  if (globalThis.progress.step === 0) {
    globalThis.progress.user = await fetch(\`/api/users/\${input.email}\`).then(r => r.json());
    globalThis.progress.step = 1;
  }

  if (globalThis.progress.step === 1) {
    await fetch('/api/email/verify', {
      method: 'POST',
      body: JSON.stringify({ email: input.email })
    }).then(r => r.json());
    globalThis.progress.step = 2;
  }

  return { status: 'onboarding_complete', user: globalThis.progress.user };
}
\`\`\`

---

## Part 4: Dynamic React Component System

### Buildless React Components

Components are stored as JSX strings and parsed at runtime:

\`\`\`javascript
export function MyComponent() {
  const [count, setCount] = React.useState(0);

  return (
    <div>
      <h1>Counter: {count}</h1>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
\`\`\`

### Component Registry

Store and retrieve components dynamically:

\`\`\`javascript
const componentDef = {
  id: 'counter',
  jsx: 'export default function Counter() { return <button>Click</button> }'
};

await sdk.storage('set', 'components:counter', componentDef);
const loaded = await sdk.storage('get', 'components:counter');
\`\`\`

### Real-Time Updates

Components update automatically when storage changes:

\`\`\`javascript
function App() {
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    sdk.realtime('connect', 'updates').on('data', (msg) => {
      setData(msg.data);
    });
  }, []);

  return <div>{data && <pre>{JSON.stringify(data, null, 2)}</pre>}</div>;
}
\`\`\`

---

## Part 5: Advanced Patterns & Recipes

### Retryable Tasks

\`\`\`javascript
export async function retryableTask(input) {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await fetch('/api/unreliable', {
        method: 'POST',
        body: JSON.stringify(input)
      }).then(r => r.json());
      return result;
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  throw new Error(\`Failed after \${maxRetries} attempts: \${lastError.message}\`);
}
\`\`\`

### Batch Processing

\`\`\`javascript
export async function batchProcess(input) {
  const batchSize = 10;
  const results = [];

  for (let i = 0; i < input.items.length; i += batchSize) {
    const batch = input.items.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map(item => fetch('/api/process', {
        method: 'POST',
        body: JSON.stringify(item)
      }).then(r => r.json()))
    );

    results.push(...batchResults);
  }

  return { processed: results.length, results };
}
\`\`\`

### Resumable Long-Running Tasks

\`\`\`javascript
export async function resumableTask(input) {
  globalThis.progress = globalThis.progress || { index: 0, results: [] };

  const { index, results } = globalThis.progress;

  for (let i = index; i < input.items.length; i++) {
    const item = input.items[i];

    const result = await fetch('/api/process', {
      method: 'POST',
      body: JSON.stringify(item)
    }).then(r => r.json());

    results.push(result);
    globalThis.progress.index = i + 1;
  }

  return { completed: results.length, results };
}
\`\`\`

### Rate-Limited Task Execution

\`\`\`javascript
export async function rateLimitedTask(input) {
  const rateLimit = 10; // requests per second
  const delayMs = 1000 / rateLimit;

  globalThis.lastCallTime = globalThis.lastCallTime || 0;

  for (const item of input.items) {
    const now = Date.now();
    const timeSinceLastCall = now - globalThis.lastCallTime;

    if (timeSinceLastCall < delayMs) {
      await new Promise(resolve =>
        setTimeout(resolve, delayMs - timeSinceLastCall)
      );
    }

    await fetch('/api/limited', {
      method: 'POST',
      body: JSON.stringify(item)
    }).then(r => r.json());

    globalThis.lastCallTime = Date.now();
  }

  return { success: true };
}
\`\`\`

`;
}
