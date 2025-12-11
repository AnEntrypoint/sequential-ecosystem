import { processSdkRequest } from './request-handler.js';
import { addCorsHeaders } from './cors-handler.js';

export function createDenoHandler(options = {}) {
  const path = options.path || '/api/sdk-proxy';
  const servicePathPrefix = options.servicePathPrefix || '/api/proxy/';

  return async (request) => {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: addCorsHeaders()
      });
    }

    if (request.method !== 'POST') {
      return false;
    }

    try {
      let result;

      if (url.pathname.startsWith(servicePathPrefix)) {
        const service = url.pathname.substring(servicePathPrefix.length);
        const requestData = await request.json();
        const modifiedRequest = {
          ...requestData,
          service
        };
        result = await processSdkRequest(modifiedRequest);
      }
      else if (url.pathname === path) {
        const requestData = await request.json();
        result = await processSdkRequest(requestData);
      }
      else {
        return false;
      }

      return new Response(JSON.stringify(result.body), {
        status: result.status,
        headers: addCorsHeaders({ 'Content-Type': 'application/json' })
      });
    } catch (err) {
      return new Response(JSON.stringify({
        error: { message: 'Internal server error', cause: err.message }
      }), {
        status: 500,
        headers: addCorsHeaders({ 'Content-Type': 'application/json' })
      });
    }
  };
}

export function createExpressMiddleware(options = {}) {
  const path = options.path || '/api/sdk-proxy';
  const servicePathPrefix = options.servicePathPrefix || '/api/proxy/';

  return async (req, res, next) => {
    if (req.method === 'OPTIONS') {
      res.set(addCorsHeaders()).status(204).end();
      return;
    }

    if (req.method !== 'POST') {
      return next();
    }

    try {
      let result;

      if (req.path.startsWith(servicePathPrefix)) {
        const service = req.path.substring(servicePathPrefix.length);
        const modifiedRequest = {
          ...req.body,
          service
        };
        result = await processSdkRequest(modifiedRequest);
      }
      else if (req.path === path) {
        result = await processSdkRequest(req.body);
      }
      else {
        return next();
      }

      return res.set(addCorsHeaders()).status(result.status).json(result.body);
    } catch (err) {
      return res.set(addCorsHeaders()).status(500).json({
        error: { message: 'Internal server error', cause: err.message }
      });
    }
  };
}
