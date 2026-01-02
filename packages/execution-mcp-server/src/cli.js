import readline from 'readline';
import logger from 'sequential-logging';
import { mcpServer } from './mcp-server.js';
import { hotReloadManager } from 'hot-reload-manager';
import { serverLifecycle } from './server-lifecycle.js';

const args = process.argv.slice(2);
const command = args[0];

async function runServer() {
  logger.info('Starting MCP Server for Sequential Ecosystem...');

  try {
    const result = await mcpServer.startup();
    logger.info('MCP Server ready:', result);

    hotReloadManager.start();
    logger.info('Hot reload manager started');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('\nMCP Server Commands:');
    console.log('  /status    - Get server status');
    console.log('  /start     - Start desktop-server');
    console.log('  /stop      - Stop desktop-server');
    console.log('  /restart   - Restart desktop-server');
    console.log('  /shutdown  - Shutdown MCP server');
    console.log('');

    const promptCommand = () => {
      rl.question('> ', async (input) => {
        const trimmed = input.trim().toLowerCase();

        switch (trimmed) {
          case '/status':
            console.log(JSON.stringify(serverLifecycle.getStatus(), null, 2));
            break;

          case '/start':
            try {
              const result = await serverLifecycle.start();
              console.log(JSON.stringify(result, null, 2));
            } catch (err) {
              console.error('Error:', err.message);
            }
            break;

          case '/stop':
            try {
              const result = await serverLifecycle.stop();
              console.log(JSON.stringify(result, null, 2));
            } catch (err) {
              console.error('Error:', err.message);
            }
            break;

          case '/restart':
            try {
              const result = await serverLifecycle.restart();
              console.log(JSON.stringify(result, null, 2));
            } catch (err) {
              console.error('Error:', err.message);
            }
            break;

          case '/shutdown':
            await mcpServer.shutdown();
            rl.close();
            process.exit(0);
            break;

          case '':
            break;

          default:
            console.log('Unknown command. Type /status, /start, /stop, /restart, or /shutdown');
        }

        promptCommand();
      });
    };

    promptCommand();

    process.on('SIGINT', async () => {
      console.log('\nShutting down...');
      rl.close();
      await mcpServer.shutdown();
      process.exit(0);
    });

  } catch (err) {
    logger.error('Failed to start MCP server:', err);
    process.exit(1);
  }
}

async function runCommand(cmd) {
  try {
    await mcpServer.initialize();

    switch (cmd) {
      case 'status':
        console.log(JSON.stringify(serverLifecycle.getStatus(), null, 2));
        break;

      case 'start':
        const startResult = await serverLifecycle.start();
        console.log(JSON.stringify(startResult, null, 2));
        await new Promise(r => setTimeout(r, 2000));
        process.exit(0);
        break;

      case 'stop':
        const stopResult = await serverLifecycle.stop();
        console.log(JSON.stringify(stopResult, null, 2));
        process.exit(0);
        break;

      case 'restart':
        const restartResult = await serverLifecycle.restart();
        console.log(JSON.stringify(restartResult, null, 2));
        await new Promise(r => setTimeout(r, 2000));
        process.exit(0);
        break;

      default:
        console.error(`Unknown command: ${cmd}`);
        process.exit(1);
    }
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

if (command) {
  runCommand(command);
} else {
  runServer();
}
