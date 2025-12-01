import path from 'path';
import { writeFileAtomicString } from '@sequential/file-operations';

export async function createExamplesReadme(tasksDir) {
  const readmeFile = path.join(tasksDir, 'EXAMPLES.md');

  const content = `# Sequential Ecosystem Examples

Comprehensive examples demonstrating all features, runners, tools, and workflows.

## Quick Start

\`\`\`bash
npx sequential-ecosystem list
npx sequential-ecosystem run example-simple-flow --input '{"message":"hello"}'
npx sequential-ecosystem gui  # Open Desktop GUI to explore all examples
\`\`\`

## Example Tasks

### 1. Simple Flow (\`example-simple-flow\`)

**Runner:** Sequential-JS (Implicit xstate)
**Pattern:** Auto-pause on fetch()

Basic async operations with automatic state management.

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

**Runner:** FlowState (Explicit xstate)
**Pattern:** State machine with graph definition

State machine with explicit transitions, error handling, and retry logic.

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

**Runner:** Sequential-JS
**Pattern:** HTTP client with retry logic

Integration patterns for external APIs.

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

**Runner:** Sequential-JS
**Pattern:** Concurrency control and batching

Process large datasets with controlled concurrency.

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

### 5. Sequential-OS (\`example-sequential-os\`)

**Runner:** Sequential-Machine (StateKit)
**Pattern:** Container-based execution with immutable layers

Container isolation with layer-based state management.

**Features:**
- Container isolation
- Each command creates an immutable layer
- Layer checkout and branching
- Command history as state
- Git-like workflow for shell commands

**Run:**
\`\`\`bash
npx sequential-ecosystem run example-sequential-os --input '{"projectName":"my-app","setupCommands":["npm init -y"]}'
\`\`\`

---

## Example Tools

Reusable utility modules in \`tools/\` directory.

### database.js

Database operations with connection pooling.

**Functions:**
- \`query(sql, params)\` - Execute SQL queries
- \`insert(table, data)\` - Insert records
- \`update(table, id, data)\` - Update records
- \`del(table, id)\` - Delete records

**Usage:**
\`\`\`javascript
import * as db from '../tools/database.js';

const users = await db.query('SELECT * FROM users WHERE id = ?', [123]);
const newUser = await db.insert('users', { name: 'John', email: 'john@example.com' });
\`\`\`

### api-client.js

HTTP API client with retry logic and exponential backoff.

**Functions:**
- \`get(url, options)\` - GET requests
- \`post(url, data, options)\` - POST requests
- \`withRetry(fn, maxRetries)\` - Retry wrapper

**Usage:**
\`\`\`javascript
import * as api from '../tools/api-client.js';

const data = await api.get('https://api.example.com/users');
const result = await api.withRetry(() => api.post('/endpoint', { data }), 3);
\`\`\`

### filesystem.js

File system operations with safety checks and directory creation.

**Functions:**
- \`readFile(filePath)\` - Read file contents
- \`writeFile(filePath, content)\` - Write with directory creation
- \`listFiles(dirPath, pattern)\` - List files with regex filtering
- \`ensureDir(dirPath)\` - Create directory recursively

**Usage:**
\`\`\`javascript
import * as fs from '../tools/filesystem.js';

const content = await fs.readFile('./config.json');
await fs.writeFile('./output/result.json', JSON.stringify(data));
const files = await fs.listFiles('./src', '\\\\.js$');
\`\`\`

### Using Tools in Tasks

\`\`\`javascript
import * as db from '../tools/database.js';
import * as api from '../tools/api-client.js';
import * as fs from '../tools/filesystem.js';

export async function myTask(input) {
  const users = await db.query('SELECT * FROM users');

  const data = await api.get('https://api.example.com/data');

  await fs.writeFile('./output/users.json', JSON.stringify(users));
  await fs.writeFile('./output/api-data.json', JSON.stringify(data));

  return { success: true, userCount: users.length };
}
\`\`\`

---

## Example Flows

Visual workflow definitions in \`tasks/flows/\` for the Flow Editor.

### user-authentication.json

Complete user authentication workflow.

**States:**
- \`start\` → \`validateInput\` → \`checkDatabase\` → \`verifyPassword\` → \`generateToken\` → \`complete\`
- Error paths: \`validationError\`, \`userNotFound\`, \`invalidPassword\`

**Usage:**
1. Open Desktop GUI (\`npx sequential-ecosystem gui\`)
2. Launch Flow Editor app
3. Load \`user-authentication\` flow
4. Visualize and edit state machine
5. Export to task code

### data-pipeline.json

ETL data processing pipeline.

**States:**
- \`start\` → \`extract\` → \`validate\` → \`transform\` → \`load\` → \`complete\`
- Error paths: \`extractError\`, \`validationError\`, \`transformError\`, \`loadError\`

### order-processing.json

E-commerce order processing workflow.

**States:**
- \`start\` → \`validateOrder\` → \`checkInventory\` → \`processPayment\` → \`createShipment\` → \`sendNotification\` → \`complete\`
- Error paths: \`orderError\`, \`inventoryError\`, \`paymentError\`

**Converting Flows to Tasks:**
1. Design flow visually in Flow Editor
2. Export flow definition
3. Generate task code from states
4. Implement state handler functions

---

## Patterns Demonstrated

### Implicit xstate (Sequential-JS)
Tasks use \`fetch()\` which automatically triggers state saving.

**Examples:** simple-flow, api-integration, batch-processing

### Explicit xstate (FlowState)
Tasks define state graph with explicit transitions.

**Examples:** complex-flow, plus all flow definitions

### Container-based (Sequential-OS)
Tasks execute in isolated containers with layer management.

**Examples:** example-sequential-os

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

---

## Creating Custom Tasks

Use examples as templates:

\`\`\`bash
npx sequential-ecosystem create-task my-task
npx sequential-ecosystem create-task my-workflow --with-graph
npx sequential-ecosystem create-task my-container --runner machine
\`\`\`

## Best Practices

1. **Use fetch() for HTTP calls** - Automatic state management
2. **Define explicit graphs for complex workflows** - Better control flow
3. **Always handle errors** - Include retry logic and fallbacks
4. **Track progress** - Log state transitions and operations
5. **Validate inputs** - Use config.inputs schema
6. **Return structured results** - Include success, timestamp, and data
7. **Reuse tools** - Create utility modules in tools/ directory
8. **Design flows visually** - Use Flow Editor for complex workflows

## Testing Examples

\`\`\`bash
npx sequential-ecosystem list
npx sequential-ecosystem describe example-simple-flow
npx sequential-ecosystem run example-simple-flow --dry-run
npx sequential-ecosystem run example-simple-flow --input '{}' --save
npx sequential-ecosystem history example-simple-flow
\`\`\`

## Desktop GUI

Explore all examples visually:

\`\`\`bash
npx sequential-ecosystem gui
\`\`\`

**Apps:**
- **📟 Terminal** - Execute Sequential-OS tasks with layer management
- **🔄 Flow Editor** - Design and edit visual workflows
- **📝 Task Editor** - Edit tasks with multi-runner support
- **💻 Code Editor** - Edit task and tool files
- **🔍 Debugger** - Inspect layers and state
- **🔧 Tool Editor** - Create and manage tool definitions

## Storage Adapters

Examples work with all storage backends:

\`\`\`bash
export DATABASE_URL="sqlite:./workflow.db"
npx sequential-ecosystem run example-simple-flow --input '{}'
\`\`\`

**Supported:**
- Folder (default, zero config)
- SQLite (single node)
- PostgreSQL/Supabase (distributed)

## Next Steps

1. Run all examples to understand patterns
2. Modify examples to fit your use case
3. Create tools for common operations
4. Design workflows in Flow Editor
5. Build custom tasks using example patterns
6. Deploy with appropriate storage adapter

## Documentation

- \`CLAUDE.md\` - Complete architecture reference
- \`README.md\` - Quick start guide
- \`CHANGELOG.md\` - Version history

## Support

For questions and issues, see the main repository documentation.
`;

  await writeFileAtomicString(readmeFile, content);
  console.log(`  ✓ Created comprehensive EXAMPLES.md`);
}
