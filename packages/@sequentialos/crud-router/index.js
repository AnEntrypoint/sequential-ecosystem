export function createCRUDRouter(app, service, basePath) {
  app.get(`${basePath}`, async (req, res) => res.json(await service.list()));
  app.post(`${basePath}`, async (req, res) => res.json(await service.create(req.body)));
  app.get(`${basePath}/:id`, async (req, res) => res.json(await service.get(req.params.id)));
  app.put(`${basePath}/:id`, async (req, res) => res.json(await service.update(req.params.id, req.body)));
  app.delete(`${basePath}/:id`, async (req, res) => res.json(await service.delete(req.params.id)));
}

export const registerCRUDRoutes = createCRUDRouter;

export default { createCRUDRouter, registerCRUDRoutes };
