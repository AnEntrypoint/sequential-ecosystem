import fs from 'fs';
import path from 'path';

export function createExamplesReadme(tasksDir) {
  const readmeFile = path.join(tasksDir, 'EXAMPLES.md');

  const content = `# Sequential Ecosystem Examples

Comprehensive examples demonstrating all features and patterns.

## Examples Overview

### 1. Simple Flow (\`example-simple-flow\`)

Basic async operations with automatic pause/resume on \`fetch()\`.

**Features:**
- Auto-pause on HTTP calls
- Simple async/await patterns
- Basic input validation
- Response transformation

**Run:**
\`\`\`bash
npx sequential-ecosystem run example-simple-flow --input '{"message":"hello","delay":1000}'
\`\`\`

### 2. Complex Flow (\`example-complex-flow\`)

State machine with explicit state transitions, error handling, and retry logic.

**Features:**
- Explicit state graph definition
- Multi-state workflow
- Error recovery strategies
- Retry logic with backoff
- State context passing

**Graph States:**
- \`initialize\` → \`fetchData\` → \`processItems\` → \`complete\`
- Error path: \`retryFetch\` → \`handleError\`

**Run:**
\`\`\`bash
npx sequential-ecosystem run example-complex-flow --input '{"items":["a","b","c"],"maxRetries":3}'
\`\`\`

### 3. API Integration (\`example-api-integration\`)

Patterns for integrating external APIs with retry, error handling, and header management.

**Features:**
- HTTP client patterns
- Retry logic with exponential backoff
- Error classification (4xx vs 5xx)
- Header management
- Query parameter handling

**Run:**
\`\`\`bash
npx sequential-ecosystem run example-api-integration --input '{"endpoint":"https://httpbin.org/get","method":"GET","params":{"key":"value"}}'
\`\`\`

### 4. Batch Processing (\`example-batch-processing\`)

Process large datasets with controlled concurrency and progress tracking.

**Features:**
- Batch creation from arrays
- Concurrency control
- Progress tracking
- Performance metrics
- Parallel execution within batches

**Run:**
\`\`\`bash
npx sequential-ecosystem run example-batch-processing --input '{"items":["a","b","c","d","e"],"batchSize":2,"concurrency":2}'
\`\`\`

## Patterns Demonstrated

### Implicit xstate (fetch-based)
Simple flow and API integration examples use \`fetch()\` which automatically triggers state saving.

### Explicit xstate (state graph)
Complex flow example defines explicit state machine with transitions.

### Error Handling
All examples include comprehensive error handling:
- Try/catch blocks
- Retry logic
- Error context preservation
- Graceful degradation

### Retry Strategies
- Fixed retry count
- Exponential backoff
- Conditional retry (5xx only)

### Concurrency Control
Batch processing shows how to limit concurrent operations.

## Creating Custom Tasks

Use these examples as templates:

\`\`\`bash
npx sequential-ecosystem create-task my-task
npx sequential-ecosystem create-task my-workflow --with-graph
npx sequential-ecosystem create-task my-machine --runner machine
\`\`\`

## Best Practices

1. **Use fetch() for HTTP calls** - Automatic state management
2. **Define explicit graphs for complex workflows** - Better control flow
3. **Always handle errors** - Include retry logic and fallbacks
4. **Track progress** - Log state transitions and operations
5. **Validate inputs** - Use config.inputs schema
6. **Return structured results** - Include success, timestamp, and data

## Testing Examples

\`\`\`bash
npx sequential-ecosystem list
npx sequential-ecosystem describe example-simple-flow
npx sequential-ecosystem run example-simple-flow --dry-run
npx sequential-ecosystem run example-simple-flow --input '{}' --save
npx sequential-ecosystem history example-simple-flow
\`\`\`

## Next Steps

1. Run all examples
2. Modify examples to fit your use case
3. Create custom tasks using patterns from examples
4. Deploy with appropriate storage adapter (folder/sqlite/supabase)

## Storage Adapters

Examples work with all storage backends:

\`\`\`bash
export DATABASE_URL="sqlite:./workflow.db"
npx sequential-ecosystem run example-simple-flow --input '{}'
\`\`\`

See \`CLAUDE.md\` for detailed architecture documentation.
`;

  fs.writeFileSync(readmeFile, content);
  console.log(`✓ Created EXAMPLES.md`);
}
