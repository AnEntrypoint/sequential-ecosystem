# @sequentialos/atomic-file-operations

Atomic file write operations to prevent partial writes and race conditions.

## Features

- **Atomic writes**: Uses temp file + atomic move pattern
- **Race condition prevention**: Parent directories created atomically
- **Error safety**: Cleans up temp files on failure
- **JSON support**: Built-in JSON serialization

## Installation

```bash
npm install @sequentialos/atomic-file-operations
```

## Usage

### Write file atomically

```javascript
import { writeAtomic } from '@sequentialos/atomic-file-operations';

await writeAtomic('/path/to/file.txt', 'Hello World');
await writeAtomic('/path/to/file.bin', buffer, { encoding: null });
```

### Write JSON atomically

```javascript
import { writeJsonAtomic } from '@sequentialos/atomic-file-operations';

await writeJsonAtomic('/path/to/data.json', { foo: 'bar' });
await writeJsonAtomic('/path/to/compact.json', data, { indent: 0 });
```

## API

### `writeAtomic(filePath, content, options)`

Write data to file atomically.

**Parameters:**
- `filePath` (string): Target file path
- `content` (string|Buffer): Content to write
- `options` (Object): Write options
  - `encoding` (string): File encoding (default: 'utf8')
  - `mode` (number): File mode/permissions
  - `flag` (string): File system flag

**Returns:** `Promise<void>`

### `writeJsonAtomic(filePath, data, options)`

Write JSON data to file atomically.

**Parameters:**
- `filePath` (string): Target file path
- `data` (any): Data to serialize as JSON
- `options` (Object): Write options
  - `encoding` (string): File encoding (default: 'utf8')
  - `indent` (number): JSON indentation spaces (default: 2)
  - `mode` (number): File mode/permissions
  - `flag` (string): File system flag
  - `replacer` (Function): JSON.stringify replacer function

**Returns:** `Promise<void>`

## How it works

1. Creates a temporary file with random UUID in the same directory
2. Writes content to the temporary file
3. Atomically moves the temporary file to the target path
4. Cleans up the temporary file if any error occurs

This ensures the target file is never left in a partially written state, even if the process crashes during the write operation.
