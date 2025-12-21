# @sequentialos/route-helpers

Route helper utilities for Express routes in Sequential OS.

## Installation

This package is part of the Sequential OS monorepo and is available locally:

```javascript
import { requireResource, parsePagination, normalizeId, buildResourceUrl, parseSort } from '@sequentialos/route-helpers';
```

## API

### `requireResource(req, resourceName)`

Ensure a resource exists in the request object. Throws a 400 validation error if missing.

```javascript
import { requireResource } from '@sequentialos/route-helpers';

app.get('/api/tasks/:id', (req, res) => {
  const taskId = requireResource(req.params, 'id');
  // taskId is guaranteed to exist or an error was thrown
});
```

### `parsePagination(query)`

Parse pagination parameters from query string with sensible defaults and limits.

```javascript
import { parsePagination } from '@sequentialos/route-helpers';

app.get('/api/tasks', (req, res) => {
  const { page, pageSize, offset } = parsePagination(req.query);
  // Defaults: page=1, pageSize=20
  // Max pageSize: 100
  // Min page: 1
});
```

### `normalizeId(id, format)`

Normalize ID format between kebab-case and snake_case.

```javascript
import { normalizeId } from '@sequentialos/route-helpers';

const snakeCase = normalizeId('my-task-id', 'snake_case');  // 'my_task_id'
const kebabCase = normalizeId('my_task_id', 'kebab-case');  // 'my-task-id'
const defaultKebab = normalizeId('my_task_id');              // 'my-task-id' (default)
```

### `buildResourceUrl(baseUrl, resourceId)`

Build resource-specific URLs safely.

```javascript
import { buildResourceUrl } from '@sequentialos/route-helpers';

const url = buildResourceUrl('/api/tasks', 'task-123');  // '/api/tasks/task-123'
const base = buildResourceUrl('/api/tasks');              // '/api/tasks'
```

### `parseSort(sortParam)`

Parse sort parameter into field and direction.

```javascript
import { parseSort } from '@sequentialos/route-helpers';

const { field, direction } = parseSort('-createdAt');  // { field: 'createdAt', direction: 'desc' }
const { field, direction } = parseSort('+name');       // { field: 'name', direction: 'asc' }
const { field, direction } = parseSort('priority');    // { field: 'priority', direction: 'asc' }
```

## Features

- Pure functions with minimal side effects
- Works with Express req/res objects
- Properly formatted data output
- Graceful handling of invalid inputs
- Integrates with `@sequentialos/error-handling` for validation errors

## License

MIT
