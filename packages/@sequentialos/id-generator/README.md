# @sequentialos/id-generator

ID generation utilities for Sequential OS.

## Installation

```bash
npm install @sequentialos/id-generator
```

## Usage

```javascript
import { generateId, generateBatch } from '@sequentialos/id-generator';

// Generate a simple ID
const id = generateId();
// => 'a3k9m2x7p'

// Generate an ID with a prefix
const taskId = generateId('task');
// => 'task_a3k9m2x7p'

// Generate an ID with custom length
const longId = generateId('user', 12);
// => 'user_h8j2k9m4n7p3'

// Generate multiple IDs at once
const ids = generateBatch(5, 'task');
// => ['task_a3k9m2x7p', 'task_h8j2k9m4n', ...]
```

## API

### `generateId(prefix = '', length = 9)`

Generate a random ID with optional prefix.

**Parameters:**
- `prefix` (string, optional): Prefix for the ID (e.g., 'task', 'user')
- `length` (number, optional): Length of the random portion (default: 9)

**Returns:** Generated ID string

### `generateBatch(count, prefix = '', length = 9)`

Generate multiple IDs with the same prefix.

**Parameters:**
- `count` (number): Number of IDs to generate
- `prefix` (string, optional): Prefix for all IDs
- `length` (number, optional): Length of the random portion (default: 9)

**Returns:** Array of generated ID strings

## Features

- Cryptographically secure random generation
- URL-safe characters only
- Excludes similar-looking characters (0/O, 1/l/I) for readability
- Customizable ID length
- Optional prefixes for namespacing
- Batch generation support

## License

MIT
