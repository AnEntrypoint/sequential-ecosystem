# Hot Reload Guide for Sequential Ecosystem Apps

Fast, productive development with automatic app reloading on file changes.

## Overview

Sequential Ecosystem includes built-in hot reload support. When developing apps locally, changes to your app files are automatically detected and pushed to connected browser instances.

**Why Hot Reload?**
- Instant feedback on code changes
- No manual browser refresh needed
- Faster development workflow
- See changes in real-time

## Setup for App Development

### 1. Start the Server with Hot Reload Enabled

By default, hot reload is enabled when running the development server:

```bash
npx sequential-ecosystem gui
```

The server watches app directories for changes and automatically broadcasts updates.

### 2. Create Your App

```bash
npx sequential-ecosystem create-app my-dev-app --template blank
```

This creates:
```
apps/my-dev-app/
├── manifest.json           # App metadata
└── dist/
    └── index.html          # App UI
```

### 3. Edit Files and See Changes

Open the app in your browser:

```
http://localhost:3001/?app=my-dev-app
```

Now edit `apps/my-dev-app/dist/index.html` - your browser will automatically reload with changes!

## How Hot Reload Works

### Server-Side (Desktop Server)

The desktop server watches for file changes:

```javascript
// Server configuration (enabled by default)
{
  hotReload: true,
  watchPaths: ['apps/', 'tasks/', 'flows/']
}
```

**Watch System:**
- Monitors `apps/`, `tasks/`, and `flows/` directories
- Detects file additions, modifications, deletions
- Debounces rapid changes (300ms)
- Broadcasts changes via WebSocket

### Client-Side (Browser)

Your app receives hot reload events:

```javascript
// Built into apps automatically
realtime.on('hot-reload', (data) => {
  // Triggered when files change
  // Reloads app or updates specific elements
});
```

**Reload Behavior:**
- HTML/CSS changes: Full page reload
- JS changes: App module reload
- Config changes: Full reload

## Supported File Types

Hot reload works for:
- ✅ HTML (index.html, templates)
- ✅ CSS (inline and linked styles)
- ✅ JavaScript (app code, modules)
- ✅ JSON (manifest.json, config)
- ✅ Images (referenced in HTML)

## Development Workflow

### Example: Building a Dashboard

```bash
# 1. Create app
npx sequential-ecosystem create-app my-dashboard --template dashboard

# 2. Open in browser
# http://localhost:3001/?app=my-dashboard

# 3. Edit HTML
# vim apps/my-dashboard/dist/index.html

# 4. Browser reloads automatically
# You see changes instantly!

# 5. Edit JavaScript
# Update <script> section in HTML

# 6. Browser reloads with new JS
# No manual refresh needed
```

### Example: Developing a Task

While hot reload is for apps, you can test tasks quickly:

```bash
# 1. Create task
npx sequential-ecosystem create-task transform-data --minimal

# 2. Edit and test in one command
npx sequential-ecosystem run transform-data --dry-run -v --input '{"test":true}'

# 3. See results immediately
# Change task code and rerun - changes apply instantly
```

## Best Practices

### 1. Keep Components Modular

```html
<!-- Good: Separate concerns -->
<div id="app">
  <div id="header"></div>
  <div id="content"></div>
  <div id="footer"></div>
</div>

<script>
function renderHeader() { /* ... */ }
function renderContent() { /* ... */ }
function renderFooter() { /* ... */ }
</script>

<!-- Bad: Tightly coupled -->
<div id="everything"><!-- complex nested structure --></div>
```

### 2. Preserve State During Reload

```javascript
// Save important state before reload
const state = {
  currentTab: localStorage.getItem('tab'),
  userInput: document.getElementById('input').value
};

// Restore after reload
function onReload() {
  localStorage.setItem('tab', state.currentTab);
  document.getElementById('input').value = state.userInput;
}
```

### 3. Use Event Handlers for Initialization

```javascript
// Good: Flexible initialization
function initApp() {
  setupEventHandlers();
  loadData();
  renderUI();
}

document.addEventListener('DOMContentLoaded', initApp);
// Can also call after hot reload

// Avoid: Inline initialization
// window.onload = () => { /* ... */ }  // Won't rerun after hot reload
```

### 4. Avoid Global State

```javascript
// Good: Encapsulated state
class App {
  constructor() {
    this.state = {};
  }
}

// Avoid: Global variables
window.globalState = {};  // Persists across reloads, causes issues
```

## Troubleshooting

### Hot Reload Not Working

**Problem**: Changes aren't showing up
- ✅ Verify server is running: `http://localhost:3001` loads
- ✅ Check browser console for errors
- ✅ Verify file is in correct location: `apps/app-id/dist/index.html`
- ✅ Check file was actually saved

**Solution**: Restart server
```bash
# Kill the process and restart
npx sequential-ecosystem gui
```

### Page Reloading Too Frequently

**Problem**: Browser keeps reloading
- ✅ Check for file watchers creating loops
- ✅ Avoid saving generated files to watched directories
- ✅ Check editor temporary files aren't being saved

**Solution**: Exclude patterns (in server config)
```javascript
// Server config
watchIgnore: ['node_modules/', '.*', '.tmp/']
```

### Changes to manifest.json Not Reflecting

**Problem**: Updated app metadata not showing
- App metadata (name, icon, window size) requires manual refresh
- Hot reload updates HTML/CSS/JS only

**Solution**: Manual browser refresh
```
Cmd+R (Mac) or Ctrl+R (Windows/Linux)
```

### Static Resources Not Updating

**Problem**: Images or referenced files not changing
- Browser caches static assets

**Solution**: Bust cache with query params
```html
<!-- Add cache-busting query string -->
<img src="logo.png?v=1" />

<!-- Or use date/timestamp -->
<img src="logo.png?t={Date.now()}" />
```

## Advanced Configuration

### Disabling Hot Reload

To run without hot reload:

```bash
# Set environment variable
HOT_RELOAD=false npx sequential-ecosystem gui
```

Or in code:

```javascript
import { createServer } from '@sequential/desktop-server';

const server = await createServer({
  hotReload: false  // Disable
});
```

### Custom Watch Paths

Configure what gets watched:

```javascript
const config = {
  hotReload: true,
  watchPaths: [
    'apps/',      // Watch all apps
    'my-folder/'  // Watch custom folder
  ],
  watchIgnore: [
    'node_modules/',
    '.*',         // Hidden files
    '*.tmp'       // Temp files
  ],
  debounceMs: 300  // Wait before reload
};
```

### Custom Reload Handlers

Handle specific file types:

```javascript
// In your app
realtime.on('hot-reload', (data) => {
  if (data.file.endsWith('.css')) {
    // Custom CSS reload logic
    console.log('CSS changed, updating styles...');
  } else if (data.file.endsWith('.js')) {
    // Custom JS reload logic
    location.reload();
  }
});
```

## Performance Considerations

### File Watch Limits

Large project directories may hit OS file descriptor limits:

```bash
# Check current limit
ulimit -n

# Increase for macOS/Linux
ulimit -n 4096
```

### Debounce Configuration

Balance responsiveness with performance:

```javascript
{
  debounceMs: 300   // Wait 300ms before broadcasting
  // Lower = more responsive but higher CPU
  // Higher = less responsive but lower CPU
}
```

## Integration with IDEs

### VS Code

Hot reload works automatically with:
- Built-in file saving
- Live Server extension
- VS Code dev containers

### Other Editors

- **Vim**: Works with `:write` command
- **Sublime**: Works with Ctrl+S save
- **Emacs**: Works with `C-x C-s` save

## Comparison: Hot Reload vs Full Reload

| Aspect | Hot Reload | Full Reload |
|--------|-----------|------------|
| Speed | Instant (~50ms) | 1-2 seconds |
| State Preserved | Depends on setup | No |
| Network | Minimal (WebSocket) | Full page (HTTP) |
| Cache Bypass | Manual | Automatic |
| Browser Console | Preserved | Cleared |

## Tips & Tricks

### 1. Multi-Device Testing

Test on multiple devices simultaneously:

```bash
# All devices connected to same server see changes
# Perfect for responsive design testing
```

### 2. Paired Development

Two developers can edit same app:

```
Developer A: edits index.html
Server: broadcasts change
Developer B: sees update instantly
```

### 3. Live Debugging

Use browser DevTools while hot reloading:

```javascript
// DevTools console stays open after reload
// Set breakpoints in debugger
// Values update as you edit code
```

## See Also

- **DX_GUIDE.md** - Developer quick start
- **TOOLS_GUIDE.md** - Tool development patterns
- **CLAUDE.md** - Project architecture

## Troubleshooting Checklist

Before asking for help:

- [ ] Server running: `http://localhost:3001` accessible
- [ ] App created: `apps/app-id/manifest.json` exists
- [ ] File edited: Verified change saved to disk
- [ ] Browser open: Dev app URL shows current version
- [ ] Console clean: No JavaScript errors in DevTools
- [ ] Network tab: WebSocket connection active (`ws://...`)

---

**Generated**: December 7, 2025
