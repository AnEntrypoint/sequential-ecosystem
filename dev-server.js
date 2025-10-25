#!/usr/bin/env node

/**
 * Hot reload development server for tasker-sequential
 *
 * Features:
 * - Watches for file changes in src/ directories
 * - Auto-reloads modules on change
 * - Supports both SQLite and Supabase backends
 * - Live task execution and debugging
 *
 * Usage:
 *   node dev-server.js [--sqlite|--supabase] [--port 3000] [--watch-dir src]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Parse command line arguments
const args = process.argv.slice(2);
const config = {
  backend: 'sqlite',
  port: 3000,
  watchDirs: ['packages/tasker-sequential/supabase/functions', 'packages/tasker-adaptor-supabase/src'],
  dbPath: './tasks-dev.db'
};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--sqlite') {
    config.backend = 'sqlite';
  } else if (args[i] === '--supabase') {
    config.backend = 'supabase';
  } else if (args[i] === '--port') {
    config.port = parseInt(args[++i]);
  } else if (args[i] === '--watch-dir') {
    config.watchDirs = [args[++i]];
  }
}

console.log('🚀 Starting development server');
console.log(`📝 Backend: ${config.backend}`);
console.log(`🔌 Port: ${config.port}`);
console.log(`👁️  Watching: ${config.watchDirs.join(', ')}`);

// Module cache for hot reloading
const moduleCache = new Map();

/**
 * Clear module from require cache and reload
 */
function clearModuleCache(modulePath) {
  delete require.cache[require.resolve(modulePath)];
  moduleCache.delete(modulePath);
  console.log(`🔄 Reloaded: ${modulePath}`);
}

/**
 * Watch directory for changes
 */
function watchDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.warn(`⚠️  Directory not found: ${dir}`);
    return;
  }

  fs.watch(dir, { recursive: true }, (eventType, filename) => {
    if (filename && (filename.endsWith('.js') || filename.endsWith('.ts'))) {
      const fullPath = path.join(dir, filename);
      console.log(`📝 File changed: ${filename}`);

      // Clear module cache and trigger reload
      try {
        clearModuleCache(fullPath);
        console.log(`✅ Reloaded successfully`);
      } catch (error) {
        console.error(`❌ Reload failed: ${error.message}`);
      }
    }
  });
}

/**
 * Create development server
 */
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    // Health check
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'ok',
        backend: config.backend,
        timestamp: new Date().toISOString()
      }));
      return;
    }

    // Task submission
    if (req.url === '/task/submit' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const taskData = JSON.parse(body);
          console.log(`📤 Task submitted: ${taskData.task_identifier}`);

          // Dynamic import based on backend
          let adapter;
          if (config.backend === 'sqlite') {
            const { SQLiteAdapter } = await import('./packages/tasker-adaptor-supabase/src/adapters/sqlite.js');
            adapter = new SQLiteAdapter(config.dbPath);
          } else {
            const { SupabaseAdapter } = await import('./packages/tasker-adaptor-supabase/src/adapters/supabase.js');
            adapter = new SupabaseAdapter(
              process.env.SUPABASE_URL,
              process.env.SUPABASE_SERVICE_KEY,
              process.env.SUPABASE_ANON_KEY
            );
          }

          await adapter.init();

          // Create task run
          const taskRun = await adapter.createTaskRun({
            task_identifier: taskData.task_identifier,
            status: 'pending',
            input: taskData.input
          });

          console.log(`✅ Task created: ID ${taskRun.id}`);

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            taskRunId: taskRun.id,
            data: { result: { taskRunId: taskRun.id } }
          }));

          await adapter.close();
        } catch (error) {
          console.error('Task submission error:', error);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message }));
        }
      });
      return;
    }

    // Task status
    if (req.url.startsWith('/task/status/') && req.method === 'GET') {
      const taskId = parseInt(req.url.split('/').pop());

      let adapter;
      if (config.backend === 'sqlite') {
        const { SQLiteAdapter } = await import('./packages/tasker-adaptor-supabase/src/adapters/sqlite.js');
        adapter = new SQLiteAdapter(config.dbPath);
      } else {
        const { SupabaseAdapter } = await import('./packages/tasker-adaptor-supabase/src/adapters/supabase.js');
        adapter = new SupabaseAdapter(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_SERVICE_KEY,
          process.env.SUPABASE_ANON_KEY
        );
      }

      await adapter.init();
      const taskRun = await adapter.getTaskRun(taskId);
      await adapter.close();

      if (!taskRun) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Task not found' }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(taskRun));
      return;
    }

    // Default response
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
});

// Start watching for changes
config.watchDirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  watchDirectory(fullPath);
});

// Start server
server.listen(config.port, () => {
  console.log(`\n✅ Development server running on http://localhost:${config.port}`);
  console.log(`📊 Health check: GET /health`);
  console.log(`📤 Submit task: POST /task/submit`);
  console.log(`📋 Task status: GET /task/status/:id`);
  console.log(`\n🎯 Ready for development. Files are being watched for changes.\n`);
});

server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
