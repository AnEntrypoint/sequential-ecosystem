import { formatResponse, formatError } from '@sequential/response-formatting';
import { requireResource, parsePagination } from '@sequential/route-helpers';

export function createCRUDRouter(config) {
  const {
    repository,
    resourceName,
    pluralName = resourceName + 's',
    validation = {},
    handlers = {},
    asyncHandler = defaultAsyncHandler
  } = config;

  const router = {};

  router.list = asyncHandler(async (req, res) => {
    const { limit, offset } = parsePagination(req);
    const items = await repository.getAll();
    res.json(formatResponse({
      [pluralName]: items,
      pagination: { limit, offset, total: items.length }
    }));
  });

  router.create = asyncHandler(async (req, res) => {
    const { body } = req.validated || req;
    const item = await repository.save(body);
    res.status(201).json(formatResponse({ [resourceName]: item }));
  });

  router.get = asyncHandler(async (req, res) => {
    const id = req.resourceId || req.params.id;
    const item = await repository.get(id);
    requireResource(item, resourceName, id);
    res.json(formatResponse({ [resourceName]: item }));
  });

  router.update = asyncHandler(async (req, res) => {
    const id = req.resourceId || req.params.id;
    const existing = await repository.get(id);
    requireResource(existing, resourceName, id);
    const item = await repository.update(id, req.validated?.body || req.body);
    res.json(formatResponse({ [resourceName]: item }));
  });

  router.delete = asyncHandler(async (req, res) => {
    const id = req.resourceId || req.params.id;
    const existing = await repository.get(id);
    requireResource(existing, resourceName, id);
    await repository.delete(id);
    res.json(formatResponse({ success: true }));
  });

  Object.assign(router, handlers);

  return router;
}

export function registerCRUDRoutes(app, basePath, config) {
  const router = createCRUDRouter(config);

  app.get(basePath, router.list);
  app.post(basePath, router.create);
  app.get(`${basePath}/:id`, router.get);
  app.put(`${basePath}/:id`, router.update);
  app.patch(`${basePath}/:id`, router.update);
  app.delete(`${basePath}/:id`, router.delete);

  return router;
}

function defaultAsyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
