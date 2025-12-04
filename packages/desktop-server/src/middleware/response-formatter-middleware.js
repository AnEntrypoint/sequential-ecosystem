import { formatResponse } from '@sequential/response-formatting';

export function responseFormatterMiddleware(req, res, next) {
  const originalJson = res.json.bind(res);

  res.json = function(data) {
    if (!data || typeof data !== 'object') {
      return originalJson(data);
    }

    if (data.success !== undefined && data.data !== undefined) {
      return originalJson(data);
    }

    if (data.success === false && data.error !== undefined) {
      return originalJson(data);
    }

    return originalJson(formatResponse(data));
  };

  next();
}
