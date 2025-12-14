export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
export function getQueryParam(req, name, defaultValue) {
  return req.query[name] !== undefined ? req.query[name] : defaultValue;
}
export function parseResourceId(paramName) {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!id) return res.status(400).json({ success: false, error: { message: `${paramName} is required` } });
    req.resourceId = id;
    next();
  };
}
export function requireResource(resource, resourceType, resourceId) {
  if (!resource) {
    throw new Error(`${resourceType} ${resourceId} not found`);
  }
}
export function parsePagination(req, defaults = {}) {
  const limit = Math.min(parseInt(req.query.limit) || defaults.limit || 50, 1000);
  const offset = parseInt(req.query.offset) || defaults.offset || 0;
  return { limit, offset };
}
export default { asyncHandler, getQueryParam, parseResourceId, requireResource, parsePagination };
