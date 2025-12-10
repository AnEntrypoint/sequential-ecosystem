# SDK HTTP Wrapper

A lightweight, generic service wrapper that lets you use any JavaScript/TypeScript SDK on the server while making API calls from a client.

## Features

- ✅ 100% Generic - works with any JavaScript/TypeScript SDK
- ✅ Proxy any SDK method chain from client to server
- ✅ Works with promises and async/await
- ✅ Supports both ESM and CommonJS
- ✅ Framework-agnostic (supports Express, Deno, and more)
- ✅ Zero built-in SDK dependencies - only load what you need

## Installation

```bash
npm install sdk-http-wrapper
```

## Quick Start

### Server Setup (Express)

```javascript
// ESM
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { processSdkRequest }  from "npm:sdk-http-wrapper@1.0.10/server";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Add the SDK proxy endpoint
app.post('/api/sdk-proxy', async (req, res) => {
  const result = await processSdkRequest(req.body);
  res.status(result.status).json(result.body);
});

// Service-specific endpoints
app.post('/api/proxy/:service', async (req, res) => {
  try {
    const { service } = req.params;
    const result = await processSdkRequest({
      ...req.body,
      service
    });
    res.status(result.status).json(result.body);
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
});

app.listen(port, () => {
  console.log(`SDK HTTP Wrapper server running on port ${port}`);
  console.log(`Generic endpoint: http://localhost:${port}/api/sdk-proxy`);
  console.log(`Service endpoints: http://localhost:${port}/api/proxy/:service`);
});
```

### CommonJS Server Setup

```javascript
// CommonJS
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { processSdkRequest } = require('sdk-http-wrapper/server');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Rest of the implementation is the same as ESM version
```

### Deno Server Setup

```javascript
import { createDenoHandler } from 'sdk-http-wrapper/server';

const handler = createDenoHandler();

Deno.serve({ port: 3000 }, handler);

console.log('SDK Proxy Deno server running on port 3000');
console.log('Main endpoint: http://localhost:3000/api/sdk-proxy');
console.log('Service-specific endpoints: http://localhost:3000/api/proxy/:service');
```

### Client Usage

```javascript
// ESM import
import { createSdkProxy } from 'sdk-http-wrapper/client';

// Create a proxy for any SDK
const mySDK = createSdkProxy({
  module: 'sdk-package-name',     // NPM package name
  factory: 'createSDKInstance',   // Factory function or class name
  args: ['arg1', 'arg2'],         // Arguments for factory function
  endpoint: 'http://localhost:3000/api/sdk-proxy'
});

// Use it like the actual SDK
const result = await mySDK.someMethod().anotherMethod('param');
```

### CommonJS Support

```javascript
// CommonJS require
const { createSdkProxy } = require('sdk-http-wrapper/client');

// Create a proxy for any SDK
const mySDK = createSdkProxy({
  module: 'sdk-package-name',
  factory: 'createSDKInstance',
  args: ['arg1', 'arg2'],
  endpoint: 'http://localhost:3000/api/sdk-proxy'
});

// Use it just like the ESM version
const result = await mySDK.someMethod().anotherMethod('param');
```

## Running the Server

The package includes ready-to-use server implementations:

```bash
# Start Express with ESM
npm start

# Or with the provided scripts
node express-server.js    # ESM Express version
node express-server.cjs   # CommonJS Express version

# Start with Deno
deno run --allow-net --allow-env deno-server.js
```

Output when running the Express server:
```
SDK HTTP Wrapper server running on port 3000
Generic endpoint: http://localhost:3000/api/sdk-proxy
Service endpoints: http://localhost:3000/api/proxy/:service
```

## How It Works

1. The client captures method chains using JavaScript's Proxy
2. When you await results, the chain is sent to the server
3. The server dynamically loads the requested SDK module
4. The method chain is executed on the server
5. Results are returned to the client

## Configuration

### Client Configuration

The `createSdkProxy` function accepts a configuration object with these properties:

- `module` (string): The npm package name of the SDK
- `factory` (string): The factory function or class name 
- `args` (array): Arguments to pass to the factory function
- `endpoint` (string): The URL of the SDK proxy endpoint
- `headers` (object, optional): Additional headers for the request
- `service` (string, optional): Predefined service name (e.g., 'supabase', 'openai')

You can also use the shorthand string format:
```javascript
// "module:factory" format
const sdk = createSdkProxy("sdk-package-name:factoryName", {
  args: ['arg1', 'arg2']
});

// Service format
const supabase = createSdkProxy("service/supabase", {
  args: ['YOUR_URL', 'YOUR_KEY']
});
```

### Service Shortcuts

```javascript
import { services } from 'sdk-http-wrapper/client';

// Quickly create service-specific proxies
const supabase = services.supabase({
  args: ['YOUR_SUPABASE_URL', 'YOUR_SUPABASE_KEY']
});

const openai = services.openai({
  args: [{ apiKey: 'YOUR_OPENAI_KEY' }]
});
```

## Example Use Cases

### Supabase

```javascript
const supabase = createSdkProxy({
  module: '@supabase/supabase-js',
  factory: 'createClient',
  args: ['YOUR_SUPABASE_URL', 'YOUR_SUPABASE_KEY'],
  endpoint: 'http://localhost:3000/api/sdk-proxy'
});

const { data } = await supabase.from('users').select('*');
```

### OpenAI

```javascript
const openai = createSdkProxy({
  module: 'openai',
  factory: 'OpenAI',
  args: [{ apiKey: 'YOUR_OPENAI_KEY' }],
  endpoint: 'http://localhost:3000/api/sdk-proxy'
});

const completion = await openai.chat.completions.create({
  model: 'gpt-3.5-turbo',
  messages: [{ role: 'user', content: 'Hello!' }]
});
```

## File Structure

```
sdk-http-wrapper/
├── src/
│   ├── client.js      # ESM client implementation
│   ├── client.cjs     # CommonJS client implementation
│   ├── server.js      # ESM server implementation (Express & Deno)
│   ├── server.cjs     # CommonJS server implementation
│   └── env.js         # Environment detection utilities
├── express-server.js  # Ready-to-use ESM Express server
├── express-server.cjs # Ready-to-use CommonJS Express server
├── deno-server.js     # Ready-to-use Deno server
├── test-client.js     # ESM test client
├── test-client-cjs.cjs # CommonJS test client
└── tests/             # Deno-specific tests
    ├── test-supabase-deno.js    # Supabase tests for Deno
    └── run-with-server.js       # Test runner with server management
```

## Multi-Environment Support

### Node.js
Provides both ESM and CommonJS implementations with Express integration.

### Deno
Includes a dedicated Deno server implementation and tests. 
See [README-deno.md](README-deno.md) for Deno-specific instructions.

### Browser
The client can be bundled for browser usage, connecting to a server backend.

## License

MIT 
