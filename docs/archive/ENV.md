# Environment Configuration Reference

This document describes all environment variables used throughout the Sequential Ecosystem. Configuration is validated on startup via `@sequential/core-config` with type-safe coercion and clear error messages.

## Quick Start

```bash
# Most users can simply start with defaults
npm run dev

# Or set specific values
PORT=8000 NODE_ENV=production npm start
```

## Configuration Categories

### Core Server Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `PORT` | port | 3000 | HTTP server port (1-65535) |
| `HOST` | string | localhost | HTTP server hostname |
| `NODE_ENV` | enum | development | Environment: `development`, `production`, or `test` |
| `DEBUG` | boolean | false | Enable debug logging throughout the ecosystem |
| `PROTOCOL` | enum | http | Protocol: `http` or `https` |
| `HOSTNAME` | string | localhost | Server hostname for connections |

### CORS Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `CORS_ORIGIN` | string | * | CORS allowed origin (e.g., `http://localhost:3000`) |
| `CORS_CREDENTIALS` | boolean | false | Allow credentials in CORS requests |

### Request Handling

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `REQUEST_LOG_THRESHOLD` | number | 1000 | Log requests slower than N milliseconds |
| `REQUEST_SIZE_LIMIT` | string | 50mb | Max request body size (e.g., `100mb`, `1gb`) |
| `REQUEST_TIMEOUT` | number | 30000 | Request timeout in milliseconds |

### Rate Limiting

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `RATE_LIMIT_WINDOW` | number | 60000 | Rate limit window in milliseconds (1 minute) |
| `RATE_LIMIT_MAX` | number | 100 | Max requests per window per IP |
| `RATE_LIMIT_CLEANUP` | number | 120000 | Cleanup interval for expired entries (2 minutes) |
| `WS_MAX_CONNECTIONS_PER_IP` | number | 10 | Max WebSocket connections per IP address |
| `WS_CLEANUP_INTERVAL_MS` | number | 300000 | WebSocket cleanup interval (5 minutes) |

### File Operations

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `ECOSYSTEM_PATH` | string | cwd | Root ecosystem path |
| `VFS_DIR` | string | .vfs | Virtual filesystem directory |
| `MAX_FILE_SIZE_BYTES` | number | 10485760 | Max uploadable file size (10MB default) |
| `MAX_FILE_NAME_LENGTH` | number | 255 | Max filename length |
| `MAX_TASK_NAME_LENGTH` | number | 100 | Max task name length |

### Hot Reload

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `HOT_RELOAD` | boolean | true | Enable file watching and hot reload |

### Task Execution

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `TASK_EXECUTION_TIMEOUT_MS` | number | 300000 | Task execution timeout (5 minutes) |

### Service Configuration

Services can run on different ports for testing and distributed deployments.

#### Deno Executor

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `DENO_EXECUTOR_PORT` | port | 3100 | Deno executor service port |
| `DENO_EXECUTOR_URL` | string | http://localhost:3100 | Deno executor service URL |
| `DENO_EXECUTOR_TIMEOUT` | number | 30000 | Deno executor timeout (ms) |

#### Stack Processor

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `STACK_PROCESSOR_PORT` | port | 3101 | Stack processor service port |
| `STACK_PROCESSOR_URL` | string | http://localhost:3101 | Stack processor service URL |
| `STACK_PROCESSOR_TIMEOUT` | number | 30000 | Stack processor timeout (ms) |
| `STACK_PROCESSOR_LOCK_TIMEOUT` | number | 60000 | Stack processor lock timeout (ms) |

#### Task Executor

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `TASK_EXECUTOR_PORT` | port | 3102 | Task executor service port |
| `TASK_EXECUTOR_URL` | string | http://localhost:3102 | Task executor service URL |
| `TASK_EXECUTOR_TIMEOUT` | number | 30000 | Task executor timeout (ms) |

#### Google APIs

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `GAPI_PORT` | port | 3103 | Google API service port |
| `GAPI_URL` | string | http://localhost:3103 | Google API service URL |
| `GAPI_TIMEOUT` | number | 30000 | Google API timeout (ms) |
| `GAPI_KEY` | string | - | Google API key |
| `GAPI_ADMIN_EMAIL` | string | - | Google admin email for delegation |

#### Keystore

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `KEYSTORE_PORT` | port | 3104 | Keystore service port |
| `KEYSTORE_URL` | string | http://localhost:3104 | Keystore service URL |
| `KEYSTORE_TIMEOUT` | number | 30000 | Keystore timeout (ms) |

#### Supabase

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `SUPABASE_PORT` | port | 3105 | Supabase service port |
| `SUPABASE_URL` | string | - | Supabase project URL (required for Supabase adapter) |
| `SUPABASE_SERVICE_KEY` | string | - | Supabase service role key |
| `SUPABASE_ANON_KEY` | string | - | Supabase anonymous key |
| `SUPABASE_TIMEOUT` | number | 30000 | Supabase timeout (ms) |

#### OpenAI

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `OPENAI_PORT` | port | 3106 | OpenAI service port |
| `OPENAI_URL` | string | http://localhost:3106 | OpenAI service URL |
| `OPENAI_TIMEOUT` | number | 30000 | OpenAI timeout (ms) |
| `OPENAI_API_KEY` | string | - | OpenAI API key |

#### Web Search

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `WEBSEARCH_PORT` | port | 3107 | Web search service port |
| `WEBSEARCH_URL` | string | http://localhost:3107 | Web search service URL |
| `WEBSEARCH_TIMEOUT` | number | 30000 | Web search timeout (ms) |
| `WEBSEARCH_API_KEY` | string | - | Web search API key |

#### Admin Debug

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `ADMIN_DEBUG_PORT` | port | 3108 | Admin debug service port |
| `ADMIN_DEBUG_URL` | string | http://localhost:3108 | Admin debug service URL |
| `ADMIN_DEBUG_TIMEOUT` | number | 30000 | Admin debug timeout (ms) |

### Sequential-Specific Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `SEQUENTIAL_MACHINE_WORK` | string | - | Sequential machine work directory |
| `SEQUENTIAL_MACHINE_DIR` | string | - | Sequential machine state directory |
| `DATABASE_URL` | string | - | Database connection URL (e.g., `sqlite://./tasks.db`, `postgres://...`) |
| `ZELLOUS_DATA` | string | - | Zellous WebRTC data directory |

### Logging Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `OP_LOG_MAX_SIZE` | number | 10000 | Operations log max entries |
| `REQUEST_LOG_MAX_SIZE` | number | 10000 | Request log max entries |
| `DEFAULT_LOG_LIMIT` | number | 100 | Default log query limit |

### Caching

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `CACHE_TTL_MS` | number | 300000 | Cache time-to-live (5 minutes) |

### Generic Service Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `SERVICE_BASE_URL` | string | - | Base URL for generic service clients |
| `SERVICE_AUTH_TOKEN` | string | - | Authentication token for service clients |
| `USER_AGENT_MAX_LENGTH` | number | 500 | Max user agent header length |

## Type Coercion Rules

The configuration validator automatically converts environment variables to the appropriate type:

### String
- Direct string value

### Number
- Parsed with `Number()`, must be valid integer or float
- Error: "must be a valid number, got "value""

### Boolean
- Converts `true`, `1`, `yes` to `true`
- All other values to `false`

### Port
- Parsed as number and validated 1-65535
- Error: "must be a valid port number (1-65535), got "value""

### URL
- Must be valid according to JavaScript `URL` constructor
- Error: "must be a valid URL, got "value""

### Enum
- Must match one of allowed values
- Error: "must be one of value1, value2, got "value""

## Validation on Startup

When the application starts, all environment variables are validated according to their schemas. Invalid values will cause startup to fail with a clear error message listing:

1. The invalid variable name
2. The error reason
3. The expected type and description
4. A complete list of all expected variables organized by category

### Example Error Output

```
❌ ENVIRONMENT CONFIGURATION ERROR

❌ PORT: must be a valid port number (1-65535), got "invalid" (HTTP server port)

📖 Expected environment variables:

Core Server:
  PORT (optional, default: 3000)
    └─ HTTP server port
  HOST (optional, default: localhost)
    └─ HTTP server host
...
```

## Development Examples

### Local Development (SQLite)

```bash
# Defaults work fine - SQLite, localhost, port 3000
npm run dev
```

### Production (Supabase + Environment)

```bash
export NODE_ENV=production
export PORT=8000
export SUPABASE_URL=https://project.supabase.co
export SUPABASE_SERVICE_KEY=your-key-here
export OPENAI_API_KEY=sk-...
npm start
```

### Testing

```bash
export NODE_ENV=test
export PORT=9999
export DEBUG=true
npm test
```

### Multi-Service Deployment

```bash
# Desktop Server
PORT=8003 npm start

# Service in separate terminal
PORT=3101 npm run start:stack-processor

# Another service
PORT=3102 npm run start:task-executor
```

## Environment Variable Sources

Configuration is read from:

1. **Environment variables** (`process.env`) - highest priority
2. **Defaults in schema** - fallback values if env var not set

To check current configuration at runtime:

```javascript
import { validator } from '@sequential/core-config';
const config = validator.getAll();
console.log(config.PORT);  // 3000 or whatever is set
```

## Migration from Hardcoded Values

Legacy code uses direct `process.env` access:

```javascript
// Old way (avoid)
const port = process.env.PORT || 3000;
const timeout = parseInt(process.env.TIMEOUT) || 30000;

// New way
import { validator } from '@sequential/core-config';
const port = validator.get('PORT');        // Already parsed as number
const timeout = validator.get('TIMEOUT');  // Already parsed
```

## Troubleshooting

### Port Already in Use

```bash
lsof -i :3000  # Find process using port
PORT=3001 npm start  # Use different port
```

### Service Connection Failed

```bash
# Check if service is running
curl http://localhost:3102/health

# Verify environment variable
echo $TASK_EXECUTOR_URL

# Set explicit URL if needed
export TASK_EXECUTOR_URL=http://192.168.1.100:3102
```

### Debug Mode

```bash
DEBUG=true npm start  # Enable debug logging
```

## Adding New Configuration

To add new environment variables:

1. Add schema definition in `packages/core-config/src/schema.js`
2. Import and use via `validator.get(key)`
3. Update this documentation

Example:

```javascript
// In schema.js envSchema object
MY_FEATURE_ENABLED: {
  type: EnvType.BOOLEAN,
  required: false,
  default: false,
  description: 'Enable my feature'
}

// Usage in code
import { validator } from '@sequential/core-config';
if (validator.get('MY_FEATURE_ENABLED')) { ... }
```
