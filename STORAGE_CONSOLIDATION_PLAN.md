# Unified Storage + Real-Time Architecture Plan

## Problem Statement
Current system has 4 separate pub/sub implementations, inconsistent storage patterns, and manual broadcasts that can be forgotten. Data changes are not automatically propagated in real-time.

## Solution: Single Source of Truth + Auto-Broadcast

### Core Pattern
```
ANY data change:
  Route/Service → StateManager.set/delete()
                    ↓ (automatic)
                 Persist (file/DB)
                    ↓ (automatic)
                 RealtimeSync broadcast
                    ↓ (automatic)
                 Connected clients notified
```

### Key Components

#### 1. Enhanced StateManager (NEW)
**File**: `packages/persistent-state/src/state-manager.js`

Current capabilities:
- LRU memory cache (300s TTL, 1000 item limit)
- Adapter abstraction (FileSystem/SQLite/Supabase)

New capabilities:
```javascript
class StateManager extends EventEmitter {
  // Existing
  async get(type, id)
  async set(type, id, data)
  async delete(type, id)

  // NEW: Automatic change hooks
  on('created', (type, id, data) => {})
  on('updated', (type, id, newData, changes) => {})
  on('deleted', (type, id, data) => {})

  // NEW: Query operations (trigger on:updated for filters)
  async query(type, filter) {
    const results = await this.adapter.query(type, filter);
    results.forEach(item => {
      this.memoryCache.set(`${type}:${item.id}`, item);
    });
    return results;
  }

  // NEW: Batch operations
  async setBatch(type, items) {
    for (const item of items) {
      await this.set(type, item.id, item);
    }
  }
}
```

#### 2. Unified Broadcast Middleware (NEW)
**File**: `packages/persistent-state/src/broadcast-middleware.js`

Automatically listens to StateManager events and broadcasts:
```javascript
export function setupBroadcastMiddleware(stateManager, broadcaster) {
  stateManager.on('created', (type, id, data) => {
    broadcaster.broadcast(`data:${type}`, 'created', { id, data, timestamp: nowISO() });
  });

  stateManager.on('updated', (type, id, newData, oldData) => {
    broadcaster.broadcast(`data:${type}`, 'updated', {
      id,
      data: newData,
      changes: diff(oldData, newData),
      timestamp: nowISO()
    });
  });

  stateManager.on('deleted', (type, id, oldData) => {
    broadcaster.broadcast(`data:${type}`, 'deleted', { id, data: oldData, timestamp: nowISO() });
  });
}
```

#### 3. Unified Channel Naming
All broadcasts use channel: `data:{type}`

| Channel | Data Type | Triggered by |
|---------|-----------|--------------|
| `data:runs` | Task runs | tasks.js save/complete |
| `data:flows` | Flow executions | flows.js changes |
| `data:tasks` | Task definitions | task updates |
| `data:apps` | App definitions | app creation/update |
| `data:storage` | User app storage | storage.js operations |
| `data:zellous:users` | Zellous users | user registration |
| `data:zellous:rooms` | Zellous rooms | room creation |
| `data:zellous:messages` | Zellous messages | message sends |

#### 4. Repository Pattern (Simplified)
Repositories become thin facades that delegate to StateManager:

**Before**:
```javascript
class TaskRepository {
  async saveRun(taskName, runId, data) {
    await writeFileAtomicJson(runPath, data);  // Direct I/O
  }
}

// In routes/tasks.js
await repository.saveRun(taskName, runId, result);
await stateManager.set('runs', runId, { ...result, taskName });  // DUPLICATE!
events.taskProgress(taskName, runId, 'completed');  // MANUAL BROADCAST
```

**After**:
```javascript
class TaskRepository {
  async saveRun(taskName, runId, data) {
    // Single path through StateManager
    return await stateManager.set('task-run', runId, {
      ...data,
      taskName,
      savedAt: nowISO()
    });
    // StateManager automatically:
    // 1. Persists to file
    // 2. Updates cache
    // 3. Broadcasts via 'created'/'updated' hooks
  }
}

// In routes/tasks.js
await repository.saveRun(taskName, runId, result);
// Done! No duplicate writes, no manual broadcasts
```

#### 5. Single-Phase Write
**Before**: Write to both file AND cache (2 operations, easy to miss one)
**After**: Write to StateManager (1 operation, implicit persistence + cache)

```javascript
// Single operation, automatic persistence
await stateManager.set('runs', runId, data);

// Triggers:
// 1. Persist to adapter (file/DB)
// 2. Update memory cache
// 3. Emit 'created' or 'updated' event
// 4. Middleware broadcasts via RealtimeSync
// 5. Clients receive change notification
```

### Implementation Phases

#### Phase 1: StateManager Enhancement (2 hours)
**Goal**: Add change hooks to StateManager
**Files**:
- `packages/persistent-state/src/state-manager.js` - Add EventEmitter, emit hooks
- `packages/persistent-state/src/broadcast-middleware.js` - NEW file for auto-broadcast

**Impact**: No breaking changes, purely additive

#### Phase 2: Broadcast Integration (2 hours)
**Goal**: Connect StateManager to RealtimeSync/WebSocketBroadcaster
**Files**:
- `packages/desktop-server/src/utils/initialization.js` - Setup broadcast middleware on startup
- Remove manual broadcasts from routes

**Impact**: Routes work same way, but broadcasts now automatic

#### Phase 3: Repository Consolidation (2 hours)
**Goal**: All repositories use StateManager exclusively
**Files**:
- `packages/data-access-layer/src/repositories/base-repository.js` - Change to use StateManager
- `packages/data-access-layer/src/repositories/task-repository.js` - Single write path
- `packages/data-access-layer/src/repositories/flow-repository.js` - Single write path
- `packages/data-access-layer/src/repositories/app-repository.js` - Single write path

**Removes**:
- Duplicate writes (file + cache)
- Manual broadcast calls

#### Phase 4: Routes Consistency (3 hours)
**Goal**: All routes use StateManager, no forgotten broadcasts
**Files**:
- `packages/desktop-server/src/routes/flows.js` - Add missing broadcasts (now automatic)
- `packages/desktop-server/src/routes/storage.js` - Add missing broadcasts (now automatic)
- `packages/desktop-server/src/routes/user-apps.js` - Add missing broadcasts (now automatic)

**Result**: Every data change automatically broadcast

#### Phase 5: Zellous Integration (4 hours)
**Goal**: Zellous storage uses StateManager
**Files**:
- `packages/zellous/server/storage-users.js` → Use StateManager
- `packages/zellous/server/storage-rooms.js` → Use StateManager
- `packages/zellous/server/storage-messages.js` → Use StateManager
- `packages/zellous/server/storage-files.js` → Use StateManager
- `packages/zellous/server/storage-sessions.js` → Use StateManager

**Result**:
- Zellous data changes broadcast in real-time
- Can use shared StateManager instance or namespace
- Real-time collaboration features work automatically

#### Phase 6: Client-Side Integration (2 hours)
**Goal**: Apps receive real-time updates automatically
**Files**:
- `packages/app-sdk/src/index.js` - Subscribe to `data:*` channels
- Apps/screens update on broadcast messages

**Result**: No polling, no manual refresh logic needed

### Consolidation Benefits

| Aspect | Before | After |
|--------|--------|-------|
| Pub/Sub Systems | 4 separate | 1 unified (RealtimeSync) |
| Cache Implementations | 4 separate | 1 unified (StateManager) |
| Write Paths | 3 (file, StateManager, broadcast) | 1 (StateManager) |
| Manual Broadcasts | Every route | None (automatic) |
| Forgotten Notifications | Common | Impossible |
| Real-Time Coverage | ~60% (tasks.js only) | 100% |
| New Data Type Add Time | 30 min (add broadcasting) | 2 min (just use StateManager) |

### Files to Delete (Post-Consolidation)

Not immediately, but after verification:
- `packages/zellous/server/storage-*.js` (replaced by StateManager)
- `packages/data-access-layer/src/repositories/base-repository.js` (logic moved to StateManager)
- Manual broadcast utility functions (no longer needed)

### No Backwards Incompatibility

1. **StateManager API unchanged** - existing `get/set/delete` work same way
2. **Repositories still exist** - just use StateManager internally
3. **Routes still work** - just use repositories/StateManager
4. **Broadcasts still work** - now just automatic instead of manual

### Validation Checklist

**After Phase 1**:
- [ ] StateManager emits events on set/delete
- [ ] Broadcast middleware listens to events
- [ ] Build passes, tests pass

**After Phase 2**:
- [ ] RealtimeSync receives broadcasts
- [ ] Clients receive change notifications
- [ ] No duplicate messages

**After Phase 3**:
- [ ] Repositories use StateManager
- [ ] Single write per operation
- [ ] No duplicate writes

**After Phase 4**:
- [ ] All routes use StateManager
- [ ] All data changes broadcast
- [ ] Integration tests pass

**After Phase 5**:
- [ ] Zellous uses StateManager
- [ ] Real-time collaboration works
- [ ] No data loss in migration

**After Phase 6**:
- [ ] Apps automatically update on changes
- [ ] No polling needed
- [ ] Real-time feature complete

### Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Breaking changes | Backward compatible - StateManager API unchanged |
| Data loss | Adapter-agnostic - persists same way as before |
| Performance | Broadcast middleware is thin, doesn't block persistence |
| Broadcast loops | Channel isolation + deduplication in middleware |

### Success Criteria

1. **All data changes broadcast automatically** (zero manual broadcasts needed)
2. **Single write path for all data** (no file + cache duplication)
3. **Unified pub/sub** (one broadcaster for all notifications)
4. **Real-time everywhere** (Zellous, storage, runs, flows, apps)
5. **Build passes, tests pass, no regressions**
