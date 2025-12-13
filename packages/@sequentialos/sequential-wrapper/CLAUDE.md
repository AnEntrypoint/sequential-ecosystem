# sequential-wrapper

## Project Overview

**sequential-wrapper** (v2.0.0) is a zero-code SDK wrapping framework that transforms any JavaScript/TypeScript SDK into HTTP services with auto-detection, pause/resume for long operations, and declarative configuration.

**Core Value**: Generic SDK-to-HTTP proxy that works with any JS library without modification or built-in dependencies.

## Architecture

### Three-Layer Design

1. **Client Layer** (`src/client.js`): JavaScript Proxy that captures method chains and serializes them for HTTP transport
2. **Server Layer** (`src/server.js`): Dynamically loads SDKs, executes method chains, handles async/await
3. **Auto-Detection** (`src/auto-detect.js`): Intelligently detects SDK initialization patterns and required credentials

### How It Works

```
Client: mySDK.from('users').select('*')
   ↓ (Proxy captures chain)
HTTP POST → Server
   ↓ (Server executes)
Server: instance.from('users').select('*')
   ↓ (Returns result)
Client ← Response
```

## Key Files

```
sequential-wrapper/
├── wrap-sdk.js              # CLI for generating SDK service scaffolds
├── src/
│   ├── client.js            # ESM: Proxy creation & chain execution
│   ├── client.cjs           # CommonJS version of client
│   ├── server.js            # ESM: Request processing & SDK execution
│   ├── server.cjs           # CommonJS version of server
│   ├── auto-detect.js       # SDK pattern & credential detection
│   └── env.js               # Runtime environment detection
├── package.json             # Main exports & dependencies
└── README.md                # User-facing documentation
```

### File Details

**wrap-sdk.js** (CLI tool, 300 lines)
- Generates service directories with config.json, index.ts, deno.json, README
- Auto-detects credentials needed for given SDK
- Entry point: `#!/usr/bin/env node`
- Usage: `npx wrap-sdk <library-name> [--port 3100] [--output ./services] [--force]`

**src/client.js** (159 lines)
- `createSdkProxy(config)`: Main entry point for creating proxies
- `buildProxy(chain, config)`: Recursive proxy builder using JS Proxy API
- `executeChain(chain, config)`: Sends chain to server via fetch
- Supports shorthand: `"module:factory"` or `"service/name"`

**src/server.js** (344 lines)
- `processSdkRequest(requestData, sdkConfig)`: Main request handler
- `initializeModule(config)`: Dynamically requires/imports SDK and initializes it
- `executeMethodChain(instance, chain)`: Executes captured chain on SDK instance
- `createDenoHandler()`, `createExpressMiddleware()`: Framework adapters
- Handles both service-specific (`/api/proxy/:service`) and generic (`/api/sdk-proxy`) endpoints

**src/auto-detect.js** (255 lines)
- `detectInitializationPattern(module)`: Finds factory functions (createClient, create, init, etc.)
- `detectCredentials(moduleName)`: Maps library names to required env vars (e.g., supabase → SUPABASE_URL, SUPABASE_KEY)
- `resolveConfig(input, loadedModule)`: Normalizes string/object configs, applies defaults
- `validateConfig(config)`: Checks for required fields, warns about issues
- Supports 15+ popular SDKs with hardcoded patterns

**src/env.js** (Not read, but referenced)
- Likely contains `detectEnvironment()` and `getFetch()` for runtime detection

## Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Run wrap-sdk CLI locally
npm start -- supabase

# Run tests (if available)
npm test
npm run test:cjs
```

### Adding Support for New SDKs

The auto-detection should handle most SDKs automatically. For custom cases:

1. **Auto-detection**: `src/auto-detect.js:detectCredentials()` - Add credential patterns
2. **Initialization**: `src/auto-detect.js:detectInitializationPattern()` - Add factory name if non-standard
3. **Generate service**: `npx wrap-sdk <new-sdk-name>`

### Testing Approach

- Manual testing via generated services
- Client tests in `test-client.js` (ESM) and `test-client-cjs.cjs` (CommonJS)
- No formal test framework currently used
- Test against real SDK instances (Supabase, OpenAI examples in README)

## Common Tasks

### Generate a New SDK Service
```bash
npx wrap-sdk openai --port 3101 --output ./my-services
cd my-services/openai
deno run --allow-all index.ts
```

### Use Client to Call SDK
```javascript
import { createSdkProxy } from 'sequential-wrapper/client';

const sdk = createSdkProxy({
  module: '@supabase/supabase-js',
  factory: 'createClient',
  args: ['URL', 'KEY'],
  endpoint: 'http://localhost:3000/api/sdk-proxy'
});

const { data } = await sdk.from('users').select('*');
```

### Add Express Endpoint
```javascript
import express from 'express';
import { processSdkRequest } from 'sequential-wrapper/server';

app.post('/api/sdk-proxy', async (req, res) => {
  const result = await processSdkRequest(req.body);
  res.status(result.status).json(result.body);
});
```

### Debug Chain Execution

Server-side: Add logging in `executeMethodChain()` (src/server.js:9-30)
Client-side: Add logging in `executeChain()` before fetch (src/client.js:111-134)

## Important Patterns & Gotchas

### Proxy Chain Mechanics
- **Property access**: `sdk.from('users')` → `{ type: 'get', property: 'from' }` then `{ type: 'call', property: 'from', args: ['users'] }`
- **Promises**: Chain executes only when `.then`, `.catch`, or `.finally` is called, or when awaited
- **Empty chains**: Cannot call function on empty chain (error in src/client.js:70)

### Module Loading
- **Node.js**: Uses dynamic `require()` or `createRequire()` for ESM
- **Deno**: Uses dynamic `import()`
- **Class vs Factory**: Auto-detects via `isClass()` regex `/^class\s/`
- **Async factories**: Checks `fn.constructor.name === 'AsyncFunction'`

### Credential Detection
Hardcoded in `detectCredentials()` (src/auto-detect.js:70-110):
- Supabase: `SUPABASE_URL`, `SUPABASE_KEY`
- OpenAI: `OPENAI_API_KEY`
- Anthropic: `ANTHROPIC_API_KEY`
- Stripe: `STRIPE_SECRET_KEY`
- Fallback: `<MODULENAME>_API_KEY`, `_TOKEN`, `_SECRET`

### Response Format
- Always wrapped: `{ data: result }` (src/server.js:32-45)
- Errors: `{ error: { message, code, status } }`
- Status codes: 200 (success), 400 (bad request), 404 (not found), 500 (server error)

### Runtime Support
- **ESM/CommonJS**: Dual exports in package.json
- **Node.js**: >= 14.0.0
- **Deno**: Native support via deno.json imports
- **Bun**: Supported (mentioned in keywords)

## Configuration Schema

### Client Config
```javascript
{
  module: 'sdk-package-name',      // NPM package name
  factory: 'createClient',         // Factory function or class name
  args: ['arg1', 'arg2'],          // Constructor/factory arguments
  endpoint: 'http://localhost:3000/api/sdk-proxy',
  headers: { /* optional */ },
  service: 'supabase'              // Optional: use service endpoint
}
```

### Server Config (Generated by wrap-sdk)
```json
{
  "library": "sdk-name",
  "port": 3100,
  "initialization": { "auto": true, "timeout": 5000 },
  "credentials": { "API_KEY": "keystore:api_key" },
  "pause": { "enabled": true, "timeout": 30000 },
  "retry": { "enabled": true, "maxAttempts": 3 },
  "cache": { "enabled": false, "ttl": 0 }
}
```

## Code Style & Conventions

- **ESM by default**: All source files use `import`/`export`
- **No semicolons**: Consistent across codebase (except a few in wrap-sdk.js)
- **Error handling**: Always wrap errors with context (code, status, message)
- **Async/await**: Preferred over raw promises
- **Exports**: Both named exports and CommonJS compatibility via `module.exports` checks

## Dependencies

### Production
- `express` ^4.18.2 - HTTP server framework
- `cors` ^2.8.5 - CORS middleware
- `dotenv` ^16.3.1 - Environment variable loading
- `node-fetch` ^3.3.2 - Fetch polyfill for Node.js
- `tasker-utils` (imported in wrap-sdk.js for `nowISO()`)

### Peer (Optional)
- `@supabase/supabase-js` ^2.49.4
- `openai` >=4.0.0

### Development
- `nodemon` ^3.0.1 - Auto-reload during development

## Known Limitations

1. **No built-in serialization**: Complex objects (Functions, Symbols, etc.) in args may not serialize
2. **Single-instance per request**: Each request creates new SDK instance (unless cached)
3. **No streaming support**: All responses must complete (pause/resume mentioned but not fully implemented)
4. **No TypeScript**: Pure JavaScript implementation
5. **Limited validation**: Auto-detection is heuristic-based, may fail for unusual SDKs

## When Making Changes

### Adding New Auto-Detection Pattern
1. Update `detectInitializationPattern()` in src/auto-detect.js
2. Add tests for the pattern
3. Update README with supported SDK example

### Modifying Proxy Behavior
1. Edit `buildProxy()` in src/client.js
2. Ensure backward compatibility with existing chains
3. Test with both sync and async SDK methods

### Changing Response Format
1. Update `formatResponse()` in src/server.js
2. Update client `executeChain()` to handle new format
3. Document in README and this file

### Supporting New Runtime
1. Add detection to `detectEnvironment()` in src/env.js
2. Add runtime-specific handler in src/server.js
3. Test with runtime's native fetch/HTTP server

## External References

- Package registry: npm (as `sequential-wrapper`)
- Runtime: Node.js >=14, Deno, Bun
- Testing: Manual via generated services
- CI/CD: Not configured (no .github/workflows)

## Quick Reference Commands

```bash
# Generate service
npx wrap-sdk <library> [--port N] [--output DIR] [--force]

# Install package
npm install sequential-wrapper

# Import client
import { createSdkProxy } from 'sequential-wrapper/client';

# Import server
import { processSdkRequest } from 'sequential-wrapper/server';

# Run dev server
npm run dev

# Test
npm test         # ESM test
npm run test:cjs # CommonJS test
```
