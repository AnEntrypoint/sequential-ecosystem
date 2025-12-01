# @sequential/data-access-layer

Data access layer providing repository pattern implementations for task, flow, tool, and file operations.

## Installation

```bash
npm install @sequential/data-access-layer
```

## Usage

```javascript
import {{ TaskRepository }} from '@sequential/data-access-layer';

const repo = new TaskRepository({{ dataDir: './data' }});
const items = await repo.list();
const item = await repo.get('item-id');
await repo.create({{ id: 'new-id', data: {{}} }});
await repo.update('item-id', {{ /* updates */ }});
await repo.delete('item-id');
```

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
