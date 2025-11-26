# Real-time Integration Plan - Sequential Ecosystem + Zellous

## Completed

### 1. Zellous Integration ✅
- Added zellous as submodule to `packages/zellous`
- Refactored zellous into library-capable architecture:
  - `lib/zellous-core.js` - Core event-driven collaboration engine
  - `lib/default-handlers.js` - Modular message handlers
  - `lib/index.js` - Convenient API exports
- Published as reusable library with exports:
  - `zellous` - Main library
  - `zellous/core` - Core only
  - `zellous/handlers` - Message handlers
  - `zellous/server` - Standalone server

### 2. Architecture Design ✅
- Designed Zellous OS.js integration via `ZellousServiceProvider`
- Event-driven architecture for real-time updates
- Room-based collaboration model
- WebSocket endpoint: `/zellous/ws`
- REST API: `/api/zellous/*`

## In Progress

### 3. OS.js Integration
**File**: `packages/osjs-webdesktop/src/server/zellous-provider.js`

**Features**:
- WebSocket endpoint for real-time connections
- Room management API
- Broadcast events to OS.js desktop
- Session persistence via zellous storage

**Next Steps**:
1. Add ZellousServiceProvider to OS.js providers list
2. Create client-side zellous connector for OS.js apps
3. Test WebSocket connectivity

## Remaining Tasks

### 4. Team Session/Room System
**Goal**: Create persistent team workspaces

**Implementation**:
```javascript
// Room types
{
  id: 'team-xyz',
  type: 'team',
  persistent: true,
  metadata: {
    tasks: ['task-1', 'task-2'],
    members: ['user-1', 'user-2'],
    vfsAccess: ['task-1/run', 'task-1/task', 'global']
  }
}
```

**Features**:
- Persistent rooms that don't cleanup
- Task-scoped rooms (one room per task run)
- Team rooms (multi-task collaboration)
- Global lobby

**Files to Create**:
- `packages/osjs-webdesktop/src/client/services/TeamService.js`
- `packages/osjs-webdesktop/src/client/apps/TeamRooms/`

### 5. Real-time Task Collaboration
**Goal**: Multiple users can watch/interact with running tasks

**Features**:
- Join task execution room
- See real-time console output
- View VFS changes as they happen
- Pause/resume/stop controls (if authorized)
- Chat/PTT in context of task

**Implementation**:
```javascript
// Custom zellous handler
zellous.registerHandler('task_event', async (client, msg) => {
  // Broadcast task events to room
  const { taskId, event, data } = msg;
  await zellous.sendToRoom(`task:${taskId}`, {
    type: 'task_event',
    event,
    data,
    timestamp: Date.now()
  });
});
```

**Files to Create**:
- `packages/osjs-webdesktop/src/client/apps/TaskCollab/`
- `packages/sequential-runner/lib/realtime-bridge.js`

### 6. File Upload to Task Scopes via OS.js
**Goal**: Drag files from OS.js into task VFS scopes

**Features**:
- Drag-drop from OS.js File Manager to task VFS
- Upload dialog with scope selector (run/task/global)
- Real-time upload progress
- Broadcast file additions to room

**Implementation**:
```javascript
// OS.js VFS integration
const taskVFS = core.make('osjs/task-vfs');

// Listen for zellous file uploads
zellous.on('fileShared', async ({ roomId, metadata }) => {
  if (roomId.startsWith('task:')) {
    const taskId = roomId.split(':')[1];
    // Copy to task VFS
    await taskVFS.copyToScope(taskId, metadata.path, 'run');
  }
});
```

**Files to Create**:
- `packages/osjs-webdesktop/src/client/apps/TaskFileUploader/`
- Update `TaskVFSAdapter` with zellous integration

### 7. Persistent Session Storage
**Goal**: Sessions survive server restarts

**Status**: Already implemented in zellous storage layer

**Integration Needed**:
- Link OS.js sessions with zellous sessions
- Restore room memberships on reconnect
- Sync VFS watch states

**Files to Update**:
- `packages/osjs-webdesktop/src/server/session-provider.js`

### 8. Expressive OS.js-native GUI
**Goal**: Create intuitive, self-explanatory desktop apps

**Apps to Create**:

#### A. Task Runner App
- Simple, visual task launcher
- Input form auto-generated from config
- Real-time execution progress
- VFS viewer integrated
- Join collaboration room button

#### B. Team Rooms App
- List of active rooms
- Create/join rooms
- See members, tasks, activity
- Integrated chat/PTT
- Shared whiteboard/notes

#### C. Task Monitor App
- Dashboard of running tasks
- Real-time logs
- VFS changes feed
- Quick actions (pause/stop)

#### D. Collaboration Panel
- Always-on sidebar
- Current room members
- Quick chat
- PTT controls
- Active tasks

**Files to Create**:
- `packages/osjs-webdesktop/src/client/apps/TaskRunner/`
- `packages/osjs-webdesktop/src/client/apps/TeamRooms/`
- `packages/osjs-webdesktop/src/client/apps/TaskMonitor/`
- `packages/osjs-webdesktop/src/client/apps/CollabPanel/`

### 9. Real-time VFS Synchronization
**Goal**: File changes broadcast to all session members

**Architecture**:
```
Task creates file
  ↓
TaskVFS emits 'file:write' event
  ↓
Zellous broadcasts to room
  ↓
All room members receive update
  ↓
OS.js File Manager refreshes
```

**Implementation**:
```javascript
// In TaskVFS
this.on('file:write', (event) => {
  const zellous = core.make('zellous');
  zellous.sendToRoom(`task:${this.taskId}`, {
    type: 'vfs_change',
    action: 'write',
    ...event
  });
});

// In OS.js client
zellous.on('vfs_change', (data) => {
  const fileManager = desktop.getApplication('FileManager');
  fileManager?.refresh(data.path);
});
```

**Files to Update**:
- `packages/sequential-runner/taskcode/vfs.js`
- `packages/osjs-webdesktop/src/server/task-vfs-adapter.js`
- `packages/osjs-webdesktop/src/client/apps/FileManager/`

## Integration Checklist

### Phase 1: Core Integration (Next)
- [ ] Add ZellousServiceProvider to OS.js
- [ ] Create client-side zellous library for OS.js apps
- [ ] Test WebSocket connection
- [ ] Create basic Team Rooms app
- [ ] Test room creation/joining

### Phase 2: VFS Integration
- [ ] Connect TaskVFS events to zellous
- [ ] Broadcast file changes to rooms
- [ ] Update File Manager to listen for changes
- [ ] Add file upload via zellous
- [ ] Test real-time file sync

### Phase 3: Task Collaboration
- [ ] Create task execution rooms
- [ ] Stream task output to rooms
- [ ] Add collaboration controls
- [ ] Create Task Runner app
- [ ] Test multi-user task watching

### Phase 4: Polish & UX
- [ ] Create Task Monitor dashboard
- [ ] Add Collaboration Panel sidebar
- [ ] Design consistent icon set
- [ ] Add keyboard shortcuts
- [ ] Write user documentation

## API Design

### Zellous Room Types
```javascript
{
  'lobby': {                    // Global lobby
    type: 'lobby',
    persistent: true
  },
  'team:xyz': {                 // Team workspace
    type: 'team',
    persistent: true,
    members: ['user-1', 'user-2'],
    tasks: []
  },
  'task:my-task': {             // Task-level (all runs)
    type: 'task',
    persistent: true,
    taskId: 'my-task'
  },
  'task:my-task:run-123': {     // Specific run
    type: 'task-run',
    persistent: false,
    taskId: 'my-task',
    runId: 'run-123'
  }
}
```

### Events

#### Server → Client
```javascript
// Room events
{ type: 'room_joined', roomId, currentUsers }
{ type: 'user_joined', userId, username }
{ type: 'user_left', userId }

// Task events
{ type: 'task_started', taskId, runId }
{ type: 'task_output', taskId, runId, line }
{ type: 'task_completed', taskId, runId, result }
{ type: 'task_error', taskId, runId, error }

// VFS events
{ type: 'vfs_change', taskId, scope, action, path, size }

// Collaboration
{ type: 'text_message', userId, username, content }
{ type: 'audio_data', userId, data }
{ type: 'file_shared', userId, filename, path }
```

#### Client → Server
```javascript
{ type: 'join_room', roomId }
{ type: 'create_team', name, description }
{ type: 'add_task_to_team', teamId, taskId }
{ type: 'run_task', taskId, input }
{ type: 'upload_to_vfs', taskId, scope, path, data }
```

## File Structure

```
packages/
├── osjs-webdesktop/
│   ├── src/
│   │   ├── server/
│   │   │   ├── zellous-provider.js       # ✅ Created
│   │   │   └── task-vfs-adapter.js       # ✅ Exists
│   │   └── client/
│   │       ├── services/
│   │       │   ├── ZellousService.js     # 📝 To create
│   │       │   └── TeamService.js        # 📝 To create
│   │       └── apps/
│   │           ├── TaskRunner/           # 📝 To create
│   │           ├── TeamRooms/            # 📝 To create
│   │           ├── TaskMonitor/          # 📝 To create
│   │           └── CollabPanel/          # 📝 To create
│   └── config/
│       └── providers-server.js           # 📝 Add ZellousServiceProvider
├── zellous/
│   ├── lib/
│   │   ├── index.js                      # ✅ Created
│   │   ├── zellous-core.js               # ✅ Created
│   │   └── default-handlers.js           # ✅ Created
│   └── server/
│       ├── storage.js                    # ✅ Exists
│       └── auth.js                       # ✅ Exists
└── sequential-runner/
    ├── taskcode/
    │   └── vfs.js                        # ✅ Exists
    └── lib/
        └── realtime-bridge.js            # 📝 To create
```

## Next Immediate Steps

1. **Add zellous to OS.js providers** (5 min)
   ```javascript
   // config/providers-server.js
   const ZellousServiceProvider = require('../src/server/zellous-provider.js');
   module.exports = [
     // ... existing providers
     { provider: ZellousServiceProvider }
   ];
   ```

2. **Create client-side zellous connector** (15 min)
   - `src/client/services/ZellousService.js`
   - WebSocket connection wrapper
   - Event emitter interface

3. **Create basic Team Rooms app** (30 min)
   - UI for creating/joining rooms
   - Member list
   - Basic chat

4. **Test integration** (10 min)
   - Start OS.js desktop
   - Create a room
   - Join from multiple browser tabs
   - Verify real-time messaging

## Success Criteria

- ✅ Zellous running as library in OS.js
- ✅ Real-time room-based collaboration working
- ✅ File changes broadcast to all room members
- ✅ Tasks can be run and watched collaboratively
- ✅ Intuitive, self-explanatory GUI
- ✅ Persistent sessions across restarts

## Timeline Estimate

- Phase 1 (Core Integration): 2-3 hours
- Phase 2 (VFS Integration): 2-3 hours
- Phase 3 (Task Collaboration): 3-4 hours
- Phase 4 (Polish & UX): 4-6 hours

**Total**: 11-16 hours of focused development