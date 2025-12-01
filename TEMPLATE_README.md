# README Template for Sequential Ecosystem Packages

This document serves as the canonical template for README files in the Sequential Ecosystem.

## Template: Desktop Applications

Use this template for packages starting with `app-` (e.g., `app-code-editor`, `app-terminal`).

```markdown
# @sequential/package-name

Brief description of what this desktop application does and its primary use case.

## Installation

\`\`\`bash
npm install @sequential/package-name
\`\`\`

## Features

- Feature 1 description
- Feature 2 description
- Feature 3 description

## Usage

This package is typically used as a desktop application. Load it in Sequential Desktop via the app registry.

\`\`\`javascript
import manifest from './package-name/manifest.json';
// App automatically registers in desktop environment
\`\`\`

## Manifest

Apps must export a `manifest.json` file:

\`\`\`json
{
  "id": "package-name",
  "name": "App Display Name",
  "version": "1.0.0",
  "icon": "📱",
  "entry": "dist/index.html",
  "capabilities": ["sequential-os"],
  "window": {
    "defaultWidth": 800,
    "defaultHeight": 600,
    "resizable": true
  }
}
\`\`\`

## Architecture

- **Frontend**: Single-page application in `dist/index.html`
- **State**: Persisted to localStorage with automatic restore
- **Communication**: WebSocket and HTTP APIs with Sequential Desktop
- **Components**: Built with vanilla JS or imported from @sequential/desktop-ui-components

## Related Packages

- [@sequential/desktop-shell](../desktop-shell) - Window manager and desktop UI
- [@sequential/desktop-ui-components](../desktop-ui-components) - Shared UI components
- [@sequential/zellous-client-sdk](../zellous-client-sdk) - Collaboration SDK

## License

MIT
```

## Template: Repositories and Data Access

Use this template for data access layer packages (e.g., `data-access-layer`, repositories).

```markdown
# @sequential/package-name

Description of repository/data access layer functionality.

## Installation

\`\`\`bash
npm install @sequential/package-name
\`\`\`

## Usage

\`\`\`javascript
import { RepositoryName } from '@sequential/package-name';

const repo = new RepositoryName({ dataDir: './data' });
const items = await repo.list();
const item = await repo.get('item-id');
await repo.create({ id: 'new-id', data: {} });
await repo.update('item-id', { /* updates */ });
await repo.delete('item-id');
\`\`\`

## API

### Methods

- `list()` - Get all items
- `get(id)` - Retrieve item by ID
- `create(data)` - Create new item
- `update(id, data)` - Update existing item
- `delete(id)` - Remove item
- `exists(id)` - Check if item exists

## Storage

Items are stored as JSON files in the configured data directory with atomic write operations.

## Related Packages

- [@sequential/data-access-layer](../data-access-layer) - Main DAL package
- [@sequential/sequential-storage-utils](../sequential-storage-utils) - Storage utilities

## License

MIT
```

## Template: Services and Business Logic

Use this template for service packages (e.g., `task-execution-service`, `desktop-server`).

```markdown
# @sequential/package-name

Description of service functionality and primary responsibilities.

## Installation

\`\`\`bash
npm install @sequential/package-name
\`\`\`

## Usage

\`\`\`javascript
import { ServiceName } from '@sequential/package-name';

const service = new ServiceName({ /* config */ });
const result = await service.execute(input);
\`\`\`

## API

### Methods

- `execute(input)` - Execute service operation
- `validate(input)` - Validate input against schema
- `getStatus()` - Get service status

## Configuration

Service behavior controlled via configuration:

\`\`\`javascript
{
  timeout: 5000,
  retries: 3,
  debug: false
}
\`\`\`

## Error Handling

Uses standardized error handling from [@sequential/error-handling](../error-handling):

\`\`\`javascript
try {
  const result = await service.execute(input);
} catch (error) {
  console.error(error.message);
}
\`\`\`

## Related Packages

- [@sequential/task-execution-service](../task-execution-service) - Task execution
- [@sequential/error-handling](../error-handling) - Error handling

## License

MIT
```

## Template: Utilities and Helpers

Use this template for utility packages (e.g., `sequential-utils`, `file-operations`, `dependency-injection`).

```markdown
# @sequential/package-name

Description of utility package and what problems it solves.

## Installation

\`\`\`bash
npm install @sequential/package-name
\`\`\`

## Usage

\`\`\`javascript
import { functionName } from '@sequential/package-name';

const result = functionName(/* args */);
\`\`\`

## API

### Main Functions

- `functionName(arg1, arg2)` - Description of what function does

## Examples

\`\`\`javascript
// Basic usage
const value = functionName(input);

// With options
const result = functionName(input, { /* options */ });
\`\`\`

## Related Packages

- [@sequential/sequential-utils](../sequential-utils) - General utilities
- [@sequential/sequential-validators](../sequential-validators) - Validation

## License

MIT
```

## Template: Middleware and Handlers

Use this template for middleware packages (e.g., `param-validation`, `input-sanitization`, `response-formatting`).

```markdown
# @sequential/package-name

Description of middleware functionality and use cases.

## Installation

\`\`\`bash
npm install @sequential/package-name
\`\`\`

## Usage

\`\`\`javascript
import { middleware } from '@sequential/package-name';
import express from 'express';

const app = express();
app.use(middleware());
\`\`\`

## Configuration

\`\`\`javascript
const config = {
  // configuration options
};
app.use(middleware(config));
\`\`\`

## API

### middleware(config)

Express middleware factory.

**Parameters:**
- `config` (object) - Configuration options

**Returns:** Express middleware function

## Express Integration

Works with Express.js and compatible frameworks:

\`\`\`javascript
app.use(middleware(config));

app.get('/api/endpoint', (req, res, next) => {
  // Middleware available in req
});
\`\`\`

## Related Packages

- [@sequential/server-utilities](../server-utilities) - Server utilities
- [@sequential/response-formatting](../response-formatting) - Response formatting

## License

MIT
```

## Guidelines

### What to Include

1. **Package Title**: `# @sequential/package-name`
2. **One-line Description**: Clear, concise summary
3. **Installation**: Standard npm install command
4. **Usage**: Basic code example showing primary use case
5. **API**: Method signatures and descriptions
6. **Related Packages**: Links to dependent/related packages
7. **License**: MIT (standard for ecosystem)

### What to Avoid

- Long, verbose descriptions
- Implementation details
- Internal architecture specifics
- Comments in code examples
- Redundant API documentation

### Best Practices

1. Keep descriptions to 1-2 sentences
2. Use simple, concrete examples
3. Link related packages with relative paths `../package-name`
4. Maintain consistent formatting and structure
5. Focus on what users need to know, not implementation

### File Structure

Every package should have:
- `README.md` - Package documentation (this file)
- `package.json` - Package metadata and dependencies
- `src/` or `dist/` - Source or compiled code
- `LICENSE` - MIT license (optional, inherited from monorepo)

### Updating READMEs

When making changes to a package:
1. Update the description in README.md to match new functionality
2. Add/remove API methods if interface changes
3. Update usage examples if they change
4. Keep the template structure consistent

## Examples

See the following packages for well-formatted README examples:

- [@sequential/app-code-editor](../app-code-editor) - Desktop app template
- [@sequential/data-access-layer](../data-access-layer) - Repository template
- [@sequential/desktop-server](../desktop-server) - Service template
- [@sequential/error-handling](../error-handling) - Utility template
- [@sequential/param-validation](../param-validation) - Middleware template
