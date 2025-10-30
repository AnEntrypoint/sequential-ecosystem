#!/usr/bin/env node

import { TaskExecutor, StackProcessor } from '../../packages/tasker-adaptor/src/index.js';
import { createAdapter } from '../../packages/tasker-adaptor/src/adapter-factory.js';
import chalk from 'chalk';

async function startSystem() {
  console.log(chalk.blue('🚀 Starting Sequential Ecosystem System...'));
  
  try {
    // Initialize adapter (default to sqlite for development)
    const adapter = await createAdapter({
      type: 'sqlite',
      path: './tasks.db'
    });
    
    // Create task executor
    const taskExecutor = new TaskExecutor(adapter);
    
    // Create stack processor
    const stackProcessor = new StackProcessor(adapter);
    
    // Start HTTP server
    const port = process.env.PORT || 3000;
    
    // Import and set up HTTP handlers
    const { createServer } = await import('http');
    
    const server = createServer(async (req, res) => {
      // Enable CORS
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }
      
      try {
        const url = new URL(req.url, `http://localhost:${port}`);
        const path = url.pathname;
        const method = req.method;
        
        console.log(chalk.cyan(`${method} ${path}`));
        
        // Route handling
        if (path === '/' && method === 'GET') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            message: 'Sequential Ecosystem API',
            version: '1.0.0',
            endpoints: {
              tasks: '/tasks',
              tools: '/tools',
              status: '/status'
            }
          }));
          return;
        }
        
        if (path === '/status' && method === 'GET') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            status: 'running',
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
          }));
          return;
        }
        
        // Handle task execution
        if (path.startsWith('/tasks/') && method === 'POST') {
          const taskName = path.replace('/tasks/', '');
          
          // Load task from file system
          const taskPath = `./packages/tasker-sequential/taskcode/endpoints/${taskName}.js`;
          
          try {
            const taskModule = await import(`file://${process.cwd()}/${taskPath}`);
            const taskFunction = taskModule.default || taskModule;
            
            // Read request body
            const body = await new Promise((resolve) => {
              let data = '';
              req.on('data', chunk => data += chunk);
              req.on('end', () => resolve(data));
            });
            
            const input = body ? JSON.parse(body) : {};
            
            // Execute task with automatic pause/resume
            const result = await taskFunction(input);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
            return;
            
          } catch (error) {
            console.error(chalk.red('Task execution error:'), error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: false,
              error: error.message,
              task: taskName
            }));
            return;
          }
        }
        
        // Handle tool calls (for external services like GAPI)
        if (path.startsWith('/tools/') && method === 'POST') {
          const toolName = path.replace('/tools/', '');
          
          // This would integrate with your wrapped services
          res.writeHead(501, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: `Tool ${toolName} not yet implemented`,
            message: 'Tools need to be integrated with tasker-wrapped-services'
          }));
          return;
        }
        
        // 404 for unknown routes
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: 'Not found',
          path: path
        }));
        
      } catch (error) {
        console.error(chalk.red('Request handling error:'), error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: 'Internal server error'
        }));
      }
    });
    
    server.listen(port, () => {
      console.log(chalk.green('✅ System started successfully'));
      console.log(chalk.cyan(`📡 Server running on http://localhost:${port}`));
      console.log(chalk.yellow('📚 Available endpoints:'));
      console.log(chalk.cyan('  GET  /              - API info'));
      console.log(chalk.cyan('  GET  /status        - System status'));
      console.log(chalk.cyan('  POST /tasks/{name}  - Execute task'));
      console.log(chalk.cyan('  POST /tools/{name}  - Call external tool'));
      console.log(chalk.blue('\n💡 Tasks are automatically loaded from packages/tasker-sequential/taskcode/endpoints/'));
    });
    
    return { port, server };
    
  } catch (error) {
    console.error(chalk.red('❌ Failed to start system:'), error);
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error(chalk.red('Uncaught Exception:'), error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('Unhandled Rejection at:'), promise, 'reason:', reason);
  process.exit(1);
});

export { startSystem };