import { RouteFactory } from './route-factory.js';

export class CrudRouteFactory extends RouteFactory {
  generateCRUD(resource, handlers = {}) {
    const path = `/${resource}`;
    const routes = [];

    if (handlers.list || handlers.getAll) {
      routes.push(this.get(path, handlers.list || handlers.getAll));
    }

    if (handlers.create) {
      routes.push(this.post(path, handlers.create));
    }

    if (handlers.get) {
      routes.push(this.get(`${path}/:id`, handlers.get));
    }

    if (handlers.update) {
      routes.push(this.put(`${path}/:id`, handlers.update));
    }

    if (handlers.delete) {
      routes.push(this.delete(`${path}/:id`, handlers.delete));
    }

    return routes;
  }

  withValidation(route, validators = {}) {
    const enhanced = { ...route };
    if (validators.body || validators.params || validators.query) {
      const originalHandlers = enhanced.handlers;
      enhanced.handlers = [
        (req, res, next) => {
          if (validators.body && req.body) {
            const error = validators.body(req.body);
            if (error) return res.status(400).json({ success: false, error });
          }
          if (validators.params && req.params) {
            const error = validators.params(req.params);
            if (error) return res.status(400).json({ success: false, error });
          }
          if (validators.query && req.query) {
            const error = validators.query(req.query);
            if (error) return res.status(400).json({ success: false, error });
          }
          next();
        },
        ...originalHandlers
      ];
    }
    return enhanced;
  }

  withAuth(route, authFn) {
    const enhanced = { ...route };
    const originalHandlers = enhanced.handlers;
    enhanced.handlers = [
      (req, res, next) => {
        if (!authFn(req)) {
          return res.status(401).json({ success: false, error: 'Unauthorized' });
        }
        next();
      },
      ...originalHandlers
    ];
    return enhanced;
  }

  withErrorBoundary(route, errorHandler) {
    const enhanced = { ...route };
    const originalHandlers = enhanced.handlers;
    enhanced.handlers = originalHandlers.map(handler => {
      return async (req, res, next) => {
        try {
          await handler(req, res, next);
        } catch (error) {
          if (errorHandler) {
            errorHandler(error, req, res);
          } else {
            next(error);
          }
        }
      };
    });
    return enhanced;
  }
}
