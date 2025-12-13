import { formatError } from '@sequentialos/response-formatting';

export function parseResourceId(paramName = 'id') {
  return (req, res, next) => {
    const idStr = req.params[paramName];
    const id = parseInt(idStr);
    if (isNaN(id)) {
      return res.status(400).json(formatError(400, {
        code: 'INVALID_ID',
        message: `Invalid ${paramName} format`
      }));
    }
    req.resourceId = id;
    next();
  };
}

export function requireResource(result, resourceName, id) {
  if (!result) {
    const error = new Error(`${resourceName} not found`);
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }
  return result;
}

export function requireFields(req, ...fields) {
  const missing = fields.filter(f => !req.body || !req.body[f]);
  if (missing.length > 0) {
    const error = new Error(`Missing required fields: ${missing.join(', ')}`);
    error.status = 400;
    error.code = 'MISSING_FIELDS';
    throw error;
  }
}

export function parsePagination(req, defaults = { limit: 50, offset: 0 }) {
  const limit = Math.min(
    Math.max(parseInt(req.query.limit || defaults.limit), 1),
    1000
  );
  const offset = Math.max(parseInt(req.query.offset || defaults.offset), 0);
  return { limit, offset };
}

export function parseFilter(req, allowedFields = []) {
  const filter = {};
  for (const field of allowedFields) {
    if (req.query[field] !== undefined) {
      filter[field] = req.query[field];
    }
  }
  return filter;
}

export function parseSort(req, defaultField = 'id', defaultOrder = 'asc') {
  const field = req.query.sort || defaultField;
  const order = (req.query.order || defaultOrder).toLowerCase();

  if (!['asc', 'desc'].includes(order)) {
    const error = new Error('Sort order must be asc or desc');
    error.status = 400;
    error.code = 'INVALID_SORT_ORDER';
    throw error;
  }

  return { field, order };
}
