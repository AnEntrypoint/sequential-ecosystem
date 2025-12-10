import path from 'path';
import { createCLICommand } from '@sequentialos/cli-handler';
import { existsSync } from 'fs';
import logger from '@sequentialos/sequential-logging';

export const guiCommand = createCLICommand(async (options, __dirname) => {
  const { spawn } = await import('child_process');
  const desktopServerPath = path.join(__dirname, 'packages/desktop-server');
  const zellousPath = path.join(__dirname, 'packages/zellous');
  const serverPath = path.join(desktopServerPath, 'src/server.js');

  logger.info('\n🚀 Sequential Desktop - Startup\n');
  if (!existsSync(desktopServerPath)) throw new Error(`Desktop server not found at ${desktopServerPath}`);
  if (!existsSync(serverPath)) throw new Error(`Server not found at ${serverPath}`);

  process.env.ECOSYSTEM_PATH = process.cwd();
  process.env.PORT = options.port;
  const procs = [];

  logger.info('Starting Sequential Desktop server...');
  const desktopProc = spawn('node', [serverPath], { cwd: desktopServerPath, stdio: 'inherit', env: { ...process.env } });
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
});
