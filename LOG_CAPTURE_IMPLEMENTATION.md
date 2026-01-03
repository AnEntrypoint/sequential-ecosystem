# MCP Server Log Capture and Management Implementation

## Overview

Successfully implemented comprehensive log capture and management for the MCP server. The implementation captures all stdout/stderr from the running desktop-server process and provides MCP tools to retrieve and manage logs.

## Architecture

### New Components

#### 1. LogManager (`/packages/execution-mcp-server/src/log-manager.js`)

Core log management service with a rotating buffer:

- **Constructor**: `LogManager(maxLines = 100)` - Creates a log manager with configurable buffer size
- **Key Methods**:
  - `addLog(line, level = 'info')` - Adds timestamped log entries with automatic rotation
  - `startCapture()` - Starts capturing mode and clears previous logs
  - `stopCapture()` - Stops capturing mode (logs still accessible)
  - `getLogs(limit = null)` - Retrieves logs with optional limit
  - `getFormattedLogs(limit = null)` - Returns formatted log strings
  - `clear()` - Clears all logs
  - `getStats()` - Returns buffer statistics

**Buffer Management**:
- Maintains last 100 log entries by default
- Automatic FIFO rotation when capacity exceeded
- Tracks buffer fullness and level distribution

**Log Entry Structure**:
```javascript
{
  timestamp: "2026-01-03T06:11:03.478Z",
  level: "stdout" | "stderr",
  message: "log message text"
}
```

**Statistics**:
```javascript
{
  totalLines: number,
  maxLines: number,
  isFull: boolean,
  isCapturing: boolean,
  levelCounts: { stdout: number, stderr: number }
}
```

### Integration Points

#### 2. ServerLifecycle Enhancement

Modified `/packages/execution-mcp-server/src/server-lifecycle.js`:

- **On Start**: Calls `logManager.startCapture()` to begin log collection
- **Dual Stream Handlers**:
  - Startup phase: Captures logs while looking for ready signals
  - Runtime phase: Continues capturing logs independently
- **On Stop**: Calls `logManager.stopCapture()` to flag end of session
- **Process Output**: All stdout/stderr from desktop-server spawned process is captured

### MCP Tools Integration

#### 3. New MCP Tools in mcp-tools.js

Two new MCP tools for log management:

##### `get_server_logs`
- **Description**: Get latest server logs from the running process
- **Input Parameters**:
  - `limit` (optional, number): Number of latest log lines (default: all)
  - `level` (optional, enum): Filter by level - 'all' | 'stdout' | 'stderr'
- **Response**:
  ```javascript
  {
    success: true,
    logs: [
      {
        timestamp: "ISO string",
        level: "stdout|stderr",
        message: "text"
      }
    ],
    count: number,
    stats: {
      totalLines: number,
      maxLines: number,
      isFull: boolean,
      isCapturing: boolean,
      levelCounts: { stdout: number, stderr: number }
    }
  }
  ```

##### `clear_server_logs`
- **Description**: Clear server log history
- **Input Parameters**: None
- **Response**:
  ```javascript
  {
    success: true,
    message: "Server logs cleared",
    stats: { /* stats object */ }
  }
  ```

## Implementation Details

### Log Capture Flow

1. **Process Start**:
   - `ServerLifecycle.start()` spawns desktop-server with `stdio: ['ignore', 'pipe', 'pipe']`
   - `logManager.startCapture()` initializes capture mode and clears previous logs

2. **Startup Detection**:
   - Initial stdout handler looks for "desktop server running" or "listening"
   - Simultaneously, all output is captured via `logManager.addLog()`

3. **Runtime Logging**:
   - Once server is ready, handlers switch to continuous capture mode
   - No output is lost - capture continues for entire server lifetime

4. **Log Access**:
   - MCP clients can call `get_server_logs` at any time
   - Latest logs are always available in memory
   - Optional filtering by level and limit parameter

5. **Buffer Rotation**:
   - Default capacity: 100 log lines
   - FIFO rotation: oldest logs discarded when full
   - Stats indicate fullness: `isFull` boolean

### Key Design Decisions

1. **In-Memory Only**: No file persistence required
   - Logs cleared on server restart (clean state)
   - Suitable for diagnostics and troubleshooting
   - Prevents disk space issues

2. **Level Tracking**: Separates stdout and stderr
   - Allows filtering by error vs info streams
   - Counts tracked in stats

3. **Timestamps**: ISO 8601 format
   - Machine-readable and sortable
   - Enables temporal analysis

4. **Rotate-on-Demand**: Simple FIFO rotation
   - O(1) push operation
   - O(1) shift operation
   - No overhead during normal operation

5. **Capture Toggle**: `startCapture()` clears logs
   - Provides clean state after restarts
   - `stopCapture()` is informational only

## Testing Results

### Unit Tests
- Log entry creation with timestamps: PASS
- Buffer rotation at 100 lines: PASS
- Filtering by level: PASS
- Formatted output: PASS
- Stats calculation: PASS
- Clear functionality: PASS

### Integration Tests
- LogManager properly imported in ServerLifecycle: PASS
- LogManager properly imported in MCPTools: PASS
- MCP tool definitions include new tools: PASS
- Tool handlers execute correctly: PASS
- Data structures match specification: PASS

### MCP Tool Tests
- `get_server_logs()` with no params: PASS (returns all logs)
- `get_server_logs({ limit: 10 })`: PASS (returns last 10)
- `get_server_logs({ level: 'stderr' })`: PASS (filters by level)
- Combined params: PASS
- `clear_server_logs()`: PASS (clears and returns stats)
- Multiple operations in sequence: PASS

## File Structure

```
packages/execution-mcp-server/
├── src/
│   ├── log-manager.js          (NEW) - Core log management
│   ├── server-lifecycle.js     (MODIFIED) - Capture integration
│   ├── mcp-tools.js            (MODIFIED) - New MCP tools
│   ├── index.js                (MODIFIED) - Export LogManager
│   ├── mcp-server.js           (unchanged)
│   ├── mcp-resources.js        (unchanged)
│   └── anthropic-server-fixed.js (unchanged)
└── package.json                (MODIFIED) - Added ./logs export
```

## Usage Examples

### Via MCP Client

```javascript
// Get all logs
const result1 = await client.tools.call('get_server_logs', {});
console.log(`${result1.count} log lines captured`);

// Get last 20 lines
const result2 = await client.tools.call('get_server_logs', {
  limit: 20
});

// Get only errors
const result3 = await client.tools.call('get_server_logs', {
  level: 'stderr'
});

// Clear logs
const result4 = await client.tools.call('clear_server_logs', {});
```

### Direct Import

```javascript
import { logManager } from 'execution-mcp-server/logs';

logManager.startCapture();
logManager.addLog('My log message', 'stdout');
const stats = logManager.getStats();
const logs = logManager.getLogs(10);
```

## Performance Characteristics

- **addLog()**: O(1) amortized (FIFO rotation is O(n) but rare)
- **getLogs()**: O(k) where k is number of logs returned
- **getStats()**: O(n) where n is total logs (single pass)
- **Memory**: Fixed ~10KB per log entry + overhead
- **Default capacity**: 100 lines ~ 1MB max memory

## Future Enhancements

Possible improvements not in initial scope:

1. **File Persistence**: Write logs to disk file with rotation
2. **Log Levels**: Extend beyond stdout/stderr (info, debug, warn, error)
3. **Pattern Matching**: Search/filter logs by regex
4. **Streaming**: WebSocket stream of live logs
5. **Historical Archive**: Keep older log sessions
6. **Compression**: Compress older entries in buffer

## Backward Compatibility

- No breaking changes to existing MCP tools
- LogManager is optional singleton export
- ServerLifecycle continues to work without log consumption
- Logs are non-blocking - don't affect server operation

## Notes

- Log capture starts fresh on each server start
- Capture doesn't interfere with normal server operation
- All server output is captured, not filtered
- ISO timestamps enable precise ordering and analysis
- Stats provide visibility into buffer health
