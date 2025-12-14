export function registerSequentialOsRoutes(app, container) {
  app.post('/api/sequential-os/execute', async (req, res) => {
    try {
      const { command, cwd, env } = req.body;

      if (!command) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_COMMAND', message: 'Command is required' },
          meta: { timestamp: new Date().toISOString() }
        });
      }

      const { execSync } = await import('child_process');

      try {
        const stdout = execSync(command, {
          encoding: 'utf-8',
          cwd: cwd || process.cwd(),
          env: { ...process.env, ...env },
          shell: '/bin/bash'
        });

        res.json({
          success: true,
          data: { stdout, code: 0 },
          meta: { timestamp: new Date().toISOString() }
        });
      } catch (error) {
        res.status(400).json({
          success: false,
          error: { code: 'COMMAND_FAILED', message: error.message },
          meta: { timestamp: new Date().toISOString() }
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: error.message },
        meta: { timestamp: new Date().toISOString() }
      });
    }
  });

  app.get('/api/sequential-os/status', (req, res) => {
    res.json({
      success: true,
      data: { status: 'ready' },
      meta: { timestamp: new Date().toISOString() }
    });
  });
}

export default { registerSequentialOsRoutes };
