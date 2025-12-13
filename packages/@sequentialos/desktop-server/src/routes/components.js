export async function registerComponentRoutes(app, container) {
  const stateManager = container.resolve('StateManager');

  app.get('/api/components', async (req, res) => {
    try {
      const components = await stateManager.getAll('component');
      const result = components.map(comp => ({
        id: comp.id,
        ...comp
      }));
      res.json({ success: true, data: result });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/components/:id', async (req, res) => {
    try {
      const component = await stateManager.get('component', req.params.id);
      if (!component) {
        return res.status(404).json({ success: false, error: 'Component not found' });
      }
      res.json({ success: true, data: { id: req.params.id, ...component } });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/components', async (req, res) => {
    try {
      const { name, jsxCode, description = '' } = req.body;
      if (!name || !jsxCode) {
        return res.status(400).json({ success: false, error: 'name and jsxCode required' });
      }
      const id = name.toLowerCase().replace(/\s+/g, '-');
      await stateManager.set('component', id, {
        id,
        name,
        jsxCode,
        description,
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      });
      res.json({ success: true, data: { id, name, jsxCode, description } });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/components/:id', async (req, res) => {
    try {
      const { name, jsxCode, description } = req.body;
      const existing = await stateManager.get('component', req.params.id);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Component not found' });
      }
      const updated = {
        ...existing,
        ...(name && { name }),
        ...(jsxCode && { jsxCode }),
        ...(description !== undefined && { description }),
        updated: new Date().toISOString()
      };
      await stateManager.set('component', req.params.id, updated);
      res.json({ success: true, data: { id: req.params.id, ...updated } });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/components/:id', async (req, res) => {
    try {
      const existing = await stateManager.get('component', req.params.id);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Component not found' });
      }
      await stateManager.delete('component', req.params.id);
      res.json({ success: true, data: { id: req.params.id } });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
}
