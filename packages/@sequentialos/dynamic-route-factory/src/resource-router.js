export class ResourceRouter {
  constructor(app, basePath = '/api') {
    this.app = app;
    this.basePath = basePath;
    this.resources = new Map();
  }

  register(resource, config) {
    this.resources.set(resource, config);
    this._applyResource(resource, config);
  }

  _applyResource(resource, config) {
    const { handlers, middleware = [], path = `/${resource}` } = config;

    for (const [method, handler] of Object.entries(handlers || {})) {
      const fullPath = `${this.basePath}${path}`;
      const allMiddleware = [...middleware];

      if (typeof handler === 'function') {
        allMiddleware.push(handler);
      }

      switch (method.toLowerCase()) {
        case 'list':
        case 'getall':
          this.app.get(fullPath, ...allMiddleware);
          break;
        case 'get':
          this.app.get(`${fullPath}/:id`, ...allMiddleware);
          break;
        case 'create':
          this.app.post(fullPath, ...allMiddleware);
          break;
        case 'update':
          this.app.put(`${fullPath}/:id`, ...allMiddleware);
          break;
        case 'delete':
          this.app.delete(`${fullPath}/:id`, ...allMiddleware);
          break;
        default:
          const [routeMethod, routePath] = method.split(' ');
          this.app[routeMethod.toLowerCase()](`${fullPath}${routePath || ''}`, ...allMiddleware);
      }
    }
  }

  batch(resources) {
    for (const [name, config] of Object.entries(resources)) {
      this.register(name, config);
    }
  }

  getRegistered() {
    return Array.from(this.resources.keys());
  }
}
