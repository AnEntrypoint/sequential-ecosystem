import { asyncHandler } from '@sequentialos/error-handling';

export class RouteFactory {
  constructor(config = {}) {
    this.basePath = config.basePath || '/api';
    this.middleware = config.middleware || [];
    this.errorHandler = config.errorHandler;
  }

  createRoute(method, path, handlers = []) {
    return {
      method: method.toLowerCase(),
      path: `${this.basePath}${path}`,
      handlers: Array.isArray(handlers) ? handlers : [handlers]
    };
  }

  get(path, handlers) {
    return this.createRoute('get', path, handlers);
  }

  post(path, handlers) {
    return this.createRoute('post', path, handlers);
  }

  put(path, handlers) {
    return this.createRoute('put', path, handlers);
  }

  patch(path, handlers) {
    return this.createRoute('patch', path, handlers);
  }

  delete(path, handlers) {
    return this.createRoute('delete', path, handlers);
  }

  registerRoutes(app, routes) {
    const processed = Array.isArray(routes) ? routes : [routes];
    for (const route of processed) {
      this._register(app, route);
    }
  }

  _register(app, route) {
    const { method, path, handlers } = route;
    const allHandlers = [...this.middleware];

    for (const handler of handlers) {
      if (typeof handler === 'function') {
        if (handler.constructor.name === 'AsyncFunction') {
          allHandlers.push(asyncHandler(handler));
        } else {
          allHandlers.push(handler);
        }
      }
    }

    app[method](path, ...allHandlers);
  }

  batch(routes) {
    return {
      basePath: this.basePath,
      middleware: this.middleware,
      routes: Array.isArray(routes) ? routes : [routes]
    };
  }

  registerBatch(app, batch) {
    for (const route of batch.routes) {
      this._register(app, route);
    }
  }
}
