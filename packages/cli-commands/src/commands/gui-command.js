import path from 'path';
import { createCLICommand } from '@sequential/cli-handler';
import { existsSync } from 'fs';
import logger from '@sequential/sequential-logging';
import { delay, withRetry } from '@sequential/async-patterns';

export async function guiCommand(options, __dirname) {
  try {
    const { spawn } = await import('child_process');
    const desktopServerPath = path.join(__dirname, 'packages/desktop-server');
    const zellousPath = path.join(__dirname, 'packages/zellous');
    const serverPath = path.join(desktopServerPath, 'src/server.js');

    logger.info('\n🚀 Sequential Desktop - Startup\n');

    if (!existsSync(desktopServerPath)) {
      throw new Error(`Desktop server not found at ${desktopServerPath}`);
    }

    if (!existsSync(serverPath)) {
      throw new Error(`Server not found at ${serverPath}`);
    }

    process.env.ECOSYSTEM_PATH = process.cwd();
    process.env.PORT = options.port;

    const procs = [];

    logger.info('Starting Sequential Desktop server...');
    const desktopProc = spawn('node', [serverPath], {
      cwd: desktopServerPath,
      stdio: 'inherit',
      env: { ...process.env }
    });
    procs.push({ name: 'Sequential Desktop', proc: desktopProc });

    if (options.zellous !== false && existsSync(zellousPath)) {
      const zellousServerPath = path.join(zellousPath, 'server.js');
      if (existsSync(zellousServerPath)) {
        logger.info('[Zellous] Static files served via desktop server, WebSocket on port 8004');
      }
    }

    const shutdown = (signal) => {
      logger.info(`\n\nShutting down (${signal})...`);
      procs.forEach(({name, proc}) => {
        logger.info(`  Stopping ${name}...`);
        proc.kill('SIGINT');
      });
      setTimeout(() => process.exit(0), 1000);
    };

    procs.forEach(({name, proc}) => {
      proc.on('exit', (code) => {
        logger.error(`\n${name} exited with code ${code}`);
        shutdown('process exit');
      });

      proc.on('error', (error) => {
        logger.error(`\n${name} error:`, error.message);
        shutdown('process error');
      });
    });

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

  } catch (e) {
    logger.error('\n✗ Failed to start Sequential Desktop');
    logger.error(`  ${e instanceof Error ? e.message : String(e)}\n`);
    logger.error('Troubleshooting:');
    logger.error('  1. Check dependencies: cd packages/desktop-server && npm install');
    logger.error('  2. Verify apps are installed');
    logger.error('  3. Check logs above for specific errors\n');
    process.exit(1);
  }
}
