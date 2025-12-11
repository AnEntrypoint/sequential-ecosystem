import { createErrorResponse } from '@sequentialos/error-handling';

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

export function registerKitHandlers(app, kit) {
  app.get('/api/sequential-os/status', asyncHandler(async (req, res) => {
    const status = await kit.status();
    res.json(status);
  }));

  app.post('/api/sequential-os/run', asyncHandler(async (req, res) => {
    const { instruction } = req.body;
    if (!instruction) {
      return res.status(400).json(createErrorResponse('INVALID_INPUT', 'instruction is required'));
    }
    const result = await kit.run(instruction);
    res.json(result);
  }));

  app.post('/api/sequential-os/exec', asyncHandler(async (req, res) => {
    const { instruction } = req.body;
    if (!instruction) {
      return res.status(400).json(createErrorResponse('INVALID_INPUT', 'instruction is required'));
    }
    const result = await kit.exec(instruction);
    res.json({ output: result, success: true });
  }));

  app.get('/api/sequential-os/history', asyncHandler(async (req, res) => {
    const history = await kit.history();
    res.json(history);
  }));

  app.post('/api/sequential-os/checkout', asyncHandler(async (req, res) => {
    const { ref } = req.body;
    if (!ref) {
      return res.status(400).json(createErrorResponse('INVALID_INPUT', 'ref is required'));
    }
    await kit.checkout(ref);
    res.json({ success: true, ref });
  }));

  app.get('/api/sequential-os/tags', asyncHandler(async (req, res) => {
    const tags = kit.tags();
    res.json(tags);
  }));

  app.post('/api/sequential-os/tag', asyncHandler(async (req, res) => {
    const { name, ref } = req.body;
    if (!name) {
      return res.status(400).json(createErrorResponse('INVALID_INPUT', 'name is required'));
    }
    kit.tag(name, ref);
    res.json({ success: true, name, ref });
  }));
}
