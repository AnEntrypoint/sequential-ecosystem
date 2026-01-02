import { spawn } from 'child_process';
import logger from 'sequential-logging';
import { SERVER_CONFIG } from 'core-config';

export class ServerLifecycle {
  constructor() {
    this.process = null;
    this.isRunning = false;
    this.port = SERVER_CONFIG.PORT || 8003;
    this.host = SERVER_CONFIG.HOST || 'localhost';
    this.startTime = null;
    this.restartCount = 0;
    this.startupAttempts = 0;
  }

  async start() {
    if (this.isRunning) {
      logger.warn('[ServerLifecycle] Server already running, skipping start');
      return {
        success: true,
        message: 'Server already running',
        status: 'running',
        uptime: Date.now() - this.startTime
      };
    }

    this.startupAttempts += 1;
    logger.info('[ServerLifecycle] Starting desktop-server...');

    return new Promise((resolve, reject) => {
      try {
        this.process = spawn('node', [
          'packages/desktop-server/src/server.js'
        ], {
          cwd: process.cwd(),
          stdio: ['ignore', 'pipe', 'pipe'],
          env: {
            ...process.env,
            PORT: this.port,
            HOST: this.host,
            NODE_OPTIONS: '--max-old-space-size=4096'
          }
        });

        let readyBuffer = '';
        let errorOccurred = false;
        let setupTimeout;

        const onReady = () => {
          if (setupTimeout) clearTimeout(setupTimeout);
          this.isRunning = true;
          this.startTime = Date.now();
          logger.info(`[ServerLifecycle] Desktop-server started on ${this.host}:${this.port}`);

          if (this.process.stdout) {
            this.process.stdout.removeListener('data', stdoutHandler);
          }
          if (this.process.stderr) {
            this.process.stderr.removeListener('data', stderrHandler);
          }

          resolve({
            success: true,
            message: 'Server started successfully',
            status: 'running',
            port: this.port,
            host: this.host,
            pid: this.process.pid,
            startTime: new Date(this.startTime).toISOString()
          });
        };

        const stdoutHandler = (data) => {
          readyBuffer += data.toString();
          if (readyBuffer.includes('desktop server running') || readyBuffer.includes('listening')) {
            onReady();
          }
        };

        const stderrHandler = (data) => {
          const msg = data.toString();
          logger.error('[ServerLifecycle] Startup error:', msg);
          if (!errorOccurred) {
            errorOccurred = true;
            if (setupTimeout) clearTimeout(setupTimeout);
            reject(new Error(`Server startup failed: ${msg.slice(0, 200)}`));
          }
        };

        this.process.stdout.on('data', stdoutHandler);
        this.process.stderr.on('data', stderrHandler);

        this.process.on('error', (err) => {
          logger.error('[ServerLifecycle] Process error:', err);
          if (!errorOccurred) {
            errorOccurred = true;
            if (setupTimeout) clearTimeout(setupTimeout);
            reject(err);
          }
        });

        this.process.on('exit', (code, signal) => {
          if (this.isRunning) {
            this.isRunning = false;
            logger.warn(`[ServerLifecycle] Process exited: code=${code}, signal=${signal}`);
          }
        });

        setupTimeout = setTimeout(() => {
          if (!this.isRunning && !errorOccurred) {
            this.isRunning = true;
            this.startTime = Date.now();
            onReady();
          }
        }, 3000);

      } catch (err) {
        logger.error('[ServerLifecycle] Failed to spawn server:', err);
        reject(err);
      }
    });
  }

  async stop() {
    if (!this.process || !this.isRunning) {
      logger.warn('[ServerLifecycle] Server not running, skipping stop');
      return {
        success: true,
        message: 'Server not running',
        status: 'stopped'
      };
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        logger.warn('[ServerLifecycle] Force killing server after 5s');
        this.process.kill('SIGKILL');
      }, 5000);

      this.process.on('exit', () => {
        clearTimeout(timeout);
        this.isRunning = false;
        const uptime = this.startTime ? Date.now() - this.startTime : 0;
        logger.info('[ServerLifecycle] Desktop-server stopped');
        resolve({
          success: true,
          message: 'Server stopped gracefully',
          status: 'stopped',
          uptime: Math.floor(uptime / 1000)
        });
      });

      logger.info('[ServerLifecycle] Stopping desktop-server gracefully...');
      this.process.kill('SIGTERM');
    });
  }

  async restart() {
    logger.info('[ServerLifecycle] Restarting desktop-server...');
    this.restartCount += 1;

    try {
      await this.stop();
      await new Promise(resolve => setTimeout(resolve, 500));
      const result = await this.start();
      return {
        ...result,
        restartCount: this.restartCount
      };
    } catch (err) {
      logger.error('[ServerLifecycle] Restart failed:', err);
      throw err;
    }
  }

  getStatus() {
    const uptime = this.isRunning && this.startTime ? Date.now() - this.startTime : 0;
    return {
      isRunning: this.isRunning,
      status: this.isRunning ? 'running' : 'stopped',
      port: this.port,
      host: this.host,
      pid: this.process?.pid || null,
      uptime: Math.floor(uptime / 1000),
      startTime: this.startTime ? new Date(this.startTime).toISOString() : null,
      restartCount: this.restartCount,
      startupAttempts: this.startupAttempts,
      heapUsedMB: process.memoryUsage().heapUsed / 1024 / 1024,
      rssMB: process.memoryUsage().rss / 1024 / 1024
    };
  }
}

export const serverLifecycle = new ServerLifecycle();
