export function injectDependencies(...deps) {
  return (req, res, next) => {
    const container = req.app.get('container') || res.app.get('container');
    req.deps = {};
    deps.forEach(dep => {
      req.deps[dep] = container.resolve(dep);
    });
    next();
  };
}

export function resolveDeps(container, ...deps) {
  const resolved = {};
  deps.forEach(dep => {
    resolved[dep] = container.resolve(dep);
  });
  return resolved;
}
