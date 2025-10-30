import { createServer } from 'http';
import fs from 'fs';
import path from 'path';
import { getAvailableTasks } from './utils.js';

/**
 * Start the Sequential Ecosystem system
 * @returns {Promise<{port: number, server: Object}>}
 */
export async function startSystem() {
  console.log('🚀 Starting Sequential Ecosystem System...');
  
  const port = process.env.PORT || 3000;
  
  const server = createServer(async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }
    
    try {
      const url = new URL(req.url, `http://localhost:${port}`);
      const pathname = url.pathname;
      
      console.log(`${req.method} ${pathname}`);
      
      // Root endpoint - API info
      if (pathname === '/' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          message: 'Sequential Ecosystem API',
          version: '1.0.0',
          status: 'running',
          endpoints: {
            tasks: '/tasks',
            status: '/status'
          }
        }));
        return;
      }
      
      // Status endpoint
      if (pathname === '/status' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'running',
          uptime: process.uptime(),
          timestamp: new Date().toISOString(),
          port
        }));
        return;
      }
      
      // Handle task execution
      if (pathname.startsWith('/tasks/') && req.method === 'POST') {
        const taskName = pathname.replace('/tasks/', '');
        const taskPath = `./packages/tasker-sequential/taskcode/endpoints/${taskName}.js`;
        
        try {
          // Check if task exists
          if (!fs.existsSync(taskPath)) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: false,
              error: `Task '${taskName}' not found`,
              availableTasks: getAvailableTasks()
            }));
            return;
          }
          
          // Import task dynamically
          const taskModule = await import(`file://${path.resolve(taskPath)}`);
          const taskFunction = taskModule.default || taskModule;
          
          // Read request body
          const body = await new Promise((resolve) => {
            let data = '';
            req.on('data', chunk => data += chunk);
            req.on('end', () => resolve(data));
          });
          const input = body ? JSON.parse(body) : {};
          
          // Execute task
          console.log(`🚀 Executing task: ${taskName}`);
          const result = await taskFunction(input);
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result));
          return;
          
        } catch (error) {
          console.error('Task execution error:', error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: error.message,
            task: taskName
          }));
        }
      }
      
      // 404 for unknown routes
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: 'Not found',
        path: pathname
      }));
      
    } catch (error) {
      console.error('Request handling error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: 'Internal server error'
      }));
    }
  });
  
  return new Promise((resolve) => {
    server.listen(port, () => {
      console.log(`✅ System started successfully`);
      console.log(`📡 Server running on http://localhost:${port}`);
      console.log('📚 Available endpoints:');
      console.log('  GET  /              - API info');
      console.log('  GET  /status        - System status');
      console.log('  POST /tasks/{name}  - Execute task');
      
      resolve({ port, server });
    });
  });
}
