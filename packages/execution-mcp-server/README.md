# Execution MCP Server

A comprehensive Model Context Protocol (MCP) server for managing task execution, flow orchestration, and tool invocation in the sequential-ecosystem.

## Overview

The execution-mcp-server provides a complete MCP interface for:
- **Resource Management**: Dynamic listing and reading of tasks, flows, and tools
- **Execution Control**: Execute tasks, flows, and tools with unified interface
- **Server Lifecycle**: Start, stop, and restart the desktop-server
- **Monitoring**: Track execution history and server status
- **Hot Reload**: Automatic registry updates on file changes

## Architecture

### Components

1. **MCP Server** (`mcp-server.js`)
   - JSON-RPC 2.0 protocol implementation
   - Resource and tool registration
   - Request routing and error handling

2. **MCP Resources** (`mcp-resources.js`)
   - Dynamic resource listing (tasks, flows, tools)
   - Resource content reading with metadata
   - URI-based resource access

3. **MCP Tools** (`mcp-tools.js`)
   - 11 execution tools with unified interface
   - Task/flow/tool execution handlers
   - Entity listing and history retrieval
   - Server lifecycle management

4. **Server Lifecycle** (`server-lifecycle.js`)
   - Desktop-server process management
   - Graceful start/stop/restart
   - Process state tracking and metrics
   - Port and configuration management

## Installation

The MCP server is included in the sequential-ecosystem workspaces.

```bash
npm install
```

## Usage

### Interactive Mode

Start the MCP server with interactive CLI:

```bash
npm run mcp
```

Available commands:
- `/status` - Get server status
- `/start` - Start desktop-server
- `/stop` - Stop desktop-server
- `/restart` - Restart desktop-server
- `/shutdown` - Shutdown MCP server

### CLI Commands

```bash
npm run mcp:status    # Get current server status
npm run mcp:start     # Start desktop-server
npm run mcp:stop      # Stop desktop-server
npm run mcp:restart   # Restart desktop-server
```

### HTTP Server (Claude Code Compatible)

Start the HTTP JSON-RPC 2.0 server for Claude Code and other clients:

```bash
npm run mcp:http      # Start HTTP server on port 9000
```

The HTTP server implements JSON-RPC 2.0 protocol and accepts POST requests:

```bash
curl -X POST http://localhost:9000 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize"}'
```

**Port Configuration**:
- Default: `9000` (for Claude Code integration)
- Configure via: `PORT_MCP=9001 npm run mcp:http`

**Claude Code Integration**:
Configure Claude Code to connect to this server at `http://localhost:9000` for full access to tasks, flows, and tools.

### Direct Import

```javascript
import { mcpServer, serverLifecycle } from 'execution-mcp-server';

// Initialize MCP server
await mcpServer.initialize();

// Get server info
const info = mcpServer.getServerInfo();

// List resources
const resources = await mcpServer.listResources();

// List tools
const tools = await mcpServer.listTools();

// Call tool
const result = await mcpServer.callTool('execute_task', {
  taskName: 'example-task',
  input: { foo: 'bar' }
});

// Manage server lifecycle
await serverLifecycle.start();
await serverLifecycle.stop();
await serverLifecycle.restart();
```

## MCP Protocol

### Resources

All resources are accessed via URIs:

```
task://{taskName}       - Task resource
flow://{flowName}       - Flow resource
tool://{category}:{name} - Tool resource
```

#### Resource List Response

```json
{
  "resources": [
    {
      "uri": "task://hello-world",
      "name": "hello-world",
      "description": "Execute task: hello-world",
      "mimeType": "application/json",
      "metadata": {
        "type": "task",
        "loadedAt": "2026-01-02T20:16:36.686Z"
      }
    }
  ]
}
```

### Tools

The server exposes 11 MCP tools:

1. **execute_task**
   - Execute a task by name with input parameters
   - Inputs: `taskName`, `input`, `timeout`

2. **execute_flow**
   - Execute a flow by name with input parameters
   - Inputs: `flowName`, `input`, `timeout`

3. **execute_tool**
   - Execute a tool by category and name
   - Inputs: `category`, `toolName`, `input`

4. **list_tasks**
   - List all available tasks
   - No inputs required

5. **list_flows**
   - List all available flows
   - No inputs required

6. **list_tools**
   - List all available tools
   - No inputs required

7. **get_execution_history**
   - Get execution history for task or flow
   - Inputs: `entityType`, `limit`

8. **get_server_status**
   - Get desktop-server status and metrics
   - No inputs required

9. **start_server**
   - Start the desktop-server
   - No inputs required

10. **stop_server**
    - Stop the desktop-server gracefully
    - No inputs required

11. **restart_server**
    - Restart the desktop-server
    - No inputs required

## HTTP JSON-RPC 2.0 Server

The HTTP server provides a complete JSON-RPC 2.0 interface for remote MCP clients, including Claude Code.

### Features
- Full JSON-RPC 2.0 protocol compliance
- POST-only interface for maximum compatibility
- Automatic MCP server initialization
- Graceful shutdown via signal handlers
- Configurable port via `PORT_MCP` environment variable

### Response Format

All responses follow JSON-RPC 2.0 specification:

**Success Response**:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": { ... }
}
```

**Error Response**:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32603,
    "message": "Error description"
  }
}
```

### HTTP Server Code

Located in `src/http-server.js`:
- Creates Node.js HTTP server
- Parses incoming JSON-RPC 2.0 requests
- Delegates to MCPServer for protocol handling
- Returns properly formatted JSON responses
- Handles parse errors and internal errors gracefully

## JSON-RPC Interface

### Methods

#### initialize
Start up the MCP server and load registries.

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {}
}
```

#### resources/list
List all available resources.

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "resources/list",
  "params": {}
}
```

#### resources/read
Read a specific resource content.

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "resources/read",
  "params": {
    "uri": "task://hello-world"
  }
}
```

#### tools/list
List all available tools.

```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/list",
  "params": {}
}
```

#### tools/call
Call a tool with arguments.

```json
{
  "jsonrpc": "2.0",
  "id": 5,
  "method": "tools/call",
  "params": {
    "name": "list_tasks",
    "arguments": {}
  }
}
```

#### shutdown
Shut down the MCP server.

```json
{
  "jsonrpc": "2.0",
  "id": 6,
  "method": "shutdown",
  "params": {}
}
```

## Configuration

Configuration is managed through environment variables:

```bash
PORT=3000              # Desktop-server port (default: 3000)
HOST=localhost         # Desktop-server host (default: localhost)
HOT_RELOAD=true        # Enable hot reload (default: true)
NODE_ENV=development   # Environment (default: development)
DEBUG=false            # Debug logging (default: false)
```

## Testing

### Unit Tests

```bash
node packages/execution-mcp-server/src/test-harness.js
```

Tests:
- MCP server initialization
- Server info retrieval
- Resource listing and reading
- Tool definitions and execution
- JSON-RPC protocol handling
- Server lifecycle status

### Functional Tests

```bash
node packages/execution-mcp-server/src/functional-test.js
```

Tests:
- Resource operations
- Tool listing and definitions
- Entity listing (tasks, flows, tools)
- JSON-RPC protocol
- Execution history
- Server status endpoint

All tests pass and verify complete functionality.

## Integration

### With Desktop Server

The MCP server manages the desktop-server lifecycle:

```javascript
import { serverLifecycle } from 'execution-mcp-server';

// Start desktop-server (runs on port 3000)
await serverLifecycle.start();

// Server is now running and accessible via HTTP

// Stop desktop-server
await serverLifecycle.stop();

// Restart desktop-server
await serverLifecycle.restart();

// Get current status
const status = serverLifecycle.getStatus();
```

### With Registries

Automatic integration with file-first registries:

```javascript
import { taskRegistry, flowRegistry, toolRegistry } from 'task-registry';

// Registries are loaded automatically
// Hot reload updates are reflected immediately
// Resource URIs directly map to registry entries
```

### With Execution Services

Unified execution interface:

```javascript
import { mcpTools } from 'execution-mcp-server';

// Execute a task
const taskResult = await mcpTools.executeTask('task-name', { input: 'value' });

// Execute a flow
const flowResult = await mcpTools.executeFlow('flow-name', { input: 'value' });

// Execute a tool
const toolResult = await mcpTools.executeTool('category', 'tool-name', { input: 'value' });
```

## Memory Management

- Execution history limited to 100 items per service
- Automatic garbage collection triggered when heap > 80%
- Desktop-server spawned with `--max-old-space-size=4096`
- Efficient resource listing with minimal memory overhead

## Error Handling

All errors follow the standard error format:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32603,
    "message": "Internal server error"
  }
}
```

Error codes:
- `-32700`: Invalid JSON-RPC version
- `-32601`: Unknown method
- `-32603`: Internal server error
- `TOOL_EXECUTION_ERROR`: Tool-specific execution error

## Performance

- Resource listing: O(n) where n = number of registered entities
- Tool execution: < 100ms overhead for tool dispatch
- Server startup: 2-3 seconds with registry loading
- Memory usage: ~60-70MB base + execution history
- Concurrent requests: Fully supported via Promise.all

## Security

- No stack traces sent to clients
- Path validation via `fs.realpathSync()` for file operations
- No hardcoded secrets or credentials
- Tool execution sandboxed via separate services
- CORS configurable via environment

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
fuser -k 3000/tcp

# Or use a different port
PORT=8080 npm run mcp
```

### Registry Not Loading

```bash
# Enable debug logging
DEBUG=true npm run mcp

# Check file permissions
ls -la ./tasks/ ./flows/ ./tools/
```

### Server Startup Timeout

```bash
# Increase startup timeout and check logs
npm run mcp:start

# Check desktop-server logs
NODE_OPTIONS='--max-old-space-size=4096' npm run server
```

## API Reference

See inline documentation in:
- `mcp-server.js` - MCP protocol and JSON-RPC
- `mcp-resources.js` - Resource management
- `mcp-tools.js` - Tool definitions and execution
- `server-lifecycle.js` - Process lifecycle management

## License

MIT

## See Also

- [Desktop Server](../desktop-server) - HTTP API server
- [Execution Service Unified](../execution-service-unified) - Unified execution
- [Task Registry](../task-registry) - Task management
- [Flow Registry](../flow-registry) - Flow management
- [Tool Registry](../tool-registry) - Tool management
