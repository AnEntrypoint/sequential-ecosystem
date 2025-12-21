# @sequentialos/es-module-utils

ES module utilities for `__dirname` and `__filename` replacement in ES modules.

## Features

- **Simple API**: Clean replacement for CommonJS globals
- **Node 18+**: Uses modern URL API
- **Zero dependencies**: Only uses Node.js built-ins

## Installation

```bash
npm install @sequentialos/es-module-utils
```

## Usage

### Get directory name

```javascript
import { getDirname } from '@sequentialos/es-module-utils';

const __dirname = getDirname(import.meta.url);
console.log(__dirname); // /path/to/current/directory
```

### Get filename

```javascript
import { getFilename } from '@sequentialos/es-module-utils';

const __filename = getFilename(import.meta.url);
console.log(__filename); // /path/to/current/directory/file.js
```

### Get both at once

```javascript
import { getModulePaths } from '@sequentialos/es-module-utils';

const { __dirname, __filename } = getModulePaths(import.meta.url);
```

## API

### `getDirname(importMetaUrl)`

Get directory name from `import.meta.url`.

**Parameters:**
- `importMetaUrl` (string): The `import.meta.url` from the calling module

**Returns:** `string` - Directory path of the module

### `getFilename(importMetaUrl)`

Get filename from `import.meta.url`.

**Parameters:**
- `importMetaUrl` (string): The `import.meta.url` from the calling module

**Returns:** `string` - File path of the module

### `getModulePaths(importMetaUrl)`

Get both dirname and filename from `import.meta.url`.

**Parameters:**
- `importMetaUrl` (string): The `import.meta.url` from the calling module

**Returns:** `Object` - Object with `__dirname` and `__filename` properties

## Migration from CommonJS

**Before (CommonJS):**
```javascript
// CommonJS
const path = require('path');
const __dirname = __dirname; // Built-in global
const __filename = __filename; // Built-in global
```

**After (ES Module):**
```javascript
// ES Module
import path from 'path';
import { getDirname } from '@sequentialos/es-module-utils';

const __dirname = getDirname(import.meta.url);
```

## Requirements

- Node.js 18.0.0 or higher (for URL API support)
