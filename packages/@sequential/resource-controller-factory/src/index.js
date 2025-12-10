import { asyncHandler } from '@sequentialos/handler-wrappers';
import { formatResponse, formatError } from '@sequentialos/response-formatting';
import { requireResource, parsePagination } from '@sequentialos/route-helpers';

export function createResourceController(config) {
  const {
    name,
    pluralName = name + 's',
    repository,
    requiredFields = [],
    optionalFields = [],
    asyncHandler: customAsyncHandler = asyncHandler
  } = config;

  return {
    list: asyncHandler(async (req, res) => {
      const { limit, offset } = parsePagination(req);
      const items = await repository.query({ limit, offset });
      res.json(formatResponse({
        [pluralName]: items,
        pagination: { limit, offset }
      }));
    }),

    get: asyncHandler(async (req, res) => {
      const item = await repository.get(req.resourceId);
      requireResource(item, name, req.resourceId);
      res.json(formatResponse({ [name]: item }));
    }),

    create: asyncHandler(async (req, res) => {
      const missing = requiredFields.filter(f => !req.body || !req.body[f]);
      if (missing.length > 0) {
        return res.status(400).json(formatError(400, {
          code: 'MISSING_FIELDS',
          message: `Missing required fields: ${missing.join(', ')}`
        }));
      }

      const data = {};
      requiredFields.forEach(f => data[f] = req.body[f]);
      optionalFields.forEach(f => {
        if (req.body && req.body[f] !== undefined) {
          data[f] = req.body[f];
        }
      });

      const item = await repository.create(data);
      res.status(201).json(formatResponse({ [name]: item }));
    }),

    update: asyncHandler(async (req, res) => {
      const existing = await repository.get(req.resourceId);
      requireResource(existing, name, req.resourceId);

      const data = {};
      const updatableFields = [...requiredFields, ...optionalFields];
      updatableFields.forEach(f => {
        if (req.body && req.body[f] !== undefined) {
          data[f] = req.body[f];
        }
      });

      const item = await repository.update(req.resourceId, data);
      res.json(formatResponse({ [name]: item }));
    }),

    delete: asyncHandler(async (req, res) => {
      const existing = await repository.get(req.resourceId);
      requireResource(existing, name, req.resourceId);
      await repository.delete(req.resourceId);
      res.json(formatResponse({ success: true }));
    }),

    patch: asyncHandler(async (req, res) => {
      const existing = await repository.get(req.resourceId);
      requireResource(existing, name, req.resourceId);

      const data = {};
      const patchableFields = [...requiredFields, ...optionalFields];
      patchableFields.forEach(f => {
        if (req.body && req.body[f] !== undefined) {
          data[f] = req.body[f];
        }
      });

      const item = await repository.update(req.resourceId, data);
      res.json(formatResponse({ [name]: item }));
    })
  };
}

export function registerResourceRoutes(app, config) {
  const {
    path,
    repository,
    controller,
    parseIdMiddleware
  } = config;

  const ctrl = controller || createResourceController({
    name: config.name,
    pluralName: config.pluralName,
    repository,
    requiredFields: config.requiredFields || [],
    optionalFields: config.optionalFields || []
  });

  app.get(path, ctrl.list);
  app.post(path, ctrl.create);
  app.get(`${path}/:id`, parseIdMiddleware || ((req, res, next) => next()), ctrl.get);
  app.put(`${path}/:id`, parseIdMiddleware || ((req, res, next) => next()), ctrl.update);
  app.patch(`${path}/:id`, parseIdMiddleware || ((req, res, next) => next()), ctrl.patch);
  app.delete(`${path}/:id`, parseIdMiddleware || ((req, res, next) => next()), ctrl.delete);
}

