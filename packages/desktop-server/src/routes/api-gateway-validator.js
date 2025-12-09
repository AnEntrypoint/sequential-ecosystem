export class APIGatewayValidator {
  constructor() {
    this.testResults = [];
  }

  async validateBasicRouting() {
    const routes = new Map();
    const registered = [];

    const registerRoute = (method, path, handler) => {
      const key = `${method}:${path}`;
      routes.set(key, handler);
      registered.push(key);
    };

    const dispatch = (method, path) => {
      const key = `${method}:${path}`;
      return routes.has(key);
    };

    registerRoute('GET', '/api/users', () => []);
    registerRoute('POST', '/api/users', () => ({}));
    registerRoute('GET', '/api/users/:id', () => ({}));

    const canGet = dispatch('GET', '/api/users');
    const canPost = dispatch('POST', '/api/users');
    const canDelete = dispatch('DELETE', '/api/users');

    return {
      name: 'Basic Routing',
      passed: canGet && canPost && !canDelete && routes.size === 3,
      details: { routesRegistered: routes.size, canGet, canPost, canDelete }
    };
  }

  async validatePathParameterExtraction() {
    const extractParams = (pattern, path) => {
      const patternParts = pattern.split('/');
      const pathParts = path.split('/');
      const params = {};

      if (patternParts.length !== pathParts.length) return null;

      for (let i = 0; i < patternParts.length; i++) {
        if (patternParts[i].startsWith(':')) {
          params[patternParts[i].substring(1)] = pathParts[i];
        } else if (patternParts[i] !== pathParts[i]) {
          return null;
        }
      }

      return params;
    };

    const params1 = extractParams('/api/users/:id/posts/:postId', '/api/users/123/posts/456');
    const params2 = extractParams('/api/users/:id', '/api/users/789');
    const params3 = extractParams('/api/users/:id', '/api/items/789');

    return {
      name: 'Path Parameter Extraction',
      passed: params1?.id === '123' && params1?.postId === '456' && params2?.id === '789' && params3 === null,
      details: { params1: params1 ? 'extracted' : 'failed', params2: params2 ? 'extracted' : 'failed', params3: params3 ? 'extracted' : 'failed' }
    };
  }

  async validateMiddlewareChaining() {
    const middlewares = [];
    let executionOrder = [];

    const registerMiddleware = (name) => {
      middlewares.push(name);
    };

    const executeMiddlewares = async (req) => {
      for (const mw of middlewares) {
        executionOrder.push(mw);
        await Promise.resolve();
      }
    };

    registerMiddleware('auth');
    registerMiddleware('validation');
    registerMiddleware('logging');
    registerMiddleware('compression');

    await executeMiddlewares({});

    const correctOrder = executionOrder[0] === 'auth' && executionOrder[1] === 'validation' &&
                        executionOrder[2] === 'logging' && executionOrder[3] === 'compression';

    return {
      name: 'Middleware Chaining',
      passed: correctOrder && middlewares.length === 4,
      details: { middlewares: middlewares.length, executionOrder, correctOrder }
    };
  }

  async validateErrorHandling() {
    let errorsCaught = 0;
    let recoveredCount = 0;

    const handlers = [
      () => { throw new Error('Handler 1 error'); },
      () => ({ success: true }),
      () => { throw new Error('Handler 3 error'); },
      () => ({ success: true })
    ];

    const executeWithErrorHandling = async (handler) => {
      try {
        return await handler();
      } catch (e) {
        errorsCaught++;
        return { error: e.message };
      }
    };

    const results = [];
    for (const handler of handlers) {
      const result = await executeWithErrorHandling(handler);
      if (result.error) {
        results.push({ error: true });
      } else if (result.success) {
        recoveredCount++;
        results.push({ success: true });
      }
    }

    return {
      name: 'Error Handling',
      passed: errorsCaught === 2 && recoveredCount === 2 && results.length === 4,
      details: { errorsCaught, recovered: recoveredCount, total: handlers.length }
    };
  }

  async validateRequestTransformation() {
    const transformRequest = (req) => {
      return {
        ...req,
        headers: { ...req.headers, 'x-transformed': 'true' },
        body: typeof req.body === 'string' ? JSON.parse(req.body) : req.body,
        meta: { timestamp: Date.now(), version: '1.0' }
      };
    };

    const req = {
      method: 'POST',
      path: '/api/test',
      headers: { 'content-type': 'application/json' },
      body: '{"key":"value"}'
    };

    const transformed = transformRequest(req);

    return {
      name: 'Request Transformation',
      passed: transformed['x-transformed'] === undefined && transformed.headers['x-transformed'] === 'true' &&
              typeof transformed.body === 'object' && transformed.meta.version === '1.0',
      details: { bodyParsed: typeof transformed.body === 'object', metaAdded: !!transformed.meta, headersEnhanced: !!transformed.headers['x-transformed'] }
    };
  }

  async validateResponseFormatting() {
    const formatResponse = (status, data, error = null) => {
      return {
        status,
        success: status < 400,
        data: status < 400 ? data : null,
        error: error ? { message: error, code: `ERR_${status}` } : null,
        timestamp: Date.now()
      };
    };

    const success = formatResponse(200, { id: 1, name: 'test' });
    const notFound = formatResponse(404, null, 'Not found');
    const error = formatResponse(500, null, 'Internal server error');

    return {
      name: 'Response Formatting',
      passed: success.success === true && success.data.id === 1 &&
              notFound.success === false && notFound.error.code === 'ERR_404' &&
              error.success === false && error.error.code === 'ERR_500',
      details: { formattedResponses: 3, successFormat: success.success, errorFormat: notFound.success }
    };
  }

  async validateRateLimiting() {
    const rateLimiter = new Map();

    const checkRateLimit = (clientId, maxRequests = 10, windowMs = 1000) => {
      const now = Date.now();
      if (!rateLimiter.has(clientId)) {
        rateLimiter.set(clientId, { count: 1, resetTime: now + windowMs });
        return true;
      }

      const entry = rateLimiter.get(clientId);
      if (now > entry.resetTime) {
        entry.count = 1;
        entry.resetTime = now + windowMs;
        return true;
      }

      if (entry.count < maxRequests) {
        entry.count++;
        return true;
      }

      return false;
    };

    let allowedCount = 0;
    let blockedCount = 0;

    for (let i = 0; i < 15; i++) {
      if (checkRateLimit('client1', 10)) {
        allowedCount++;
      } else {
        blockedCount++;
      }
    }

    return {
      name: 'Rate Limiting',
      passed: allowedCount === 10 && blockedCount === 5,
      details: { allowed: allowedCount, blocked: blockedCount, limit: 10 }
    };
  }

  async validateCaching() {
    const cache = new Map();
    const cacheKey = (method, path) => `${method}:${path}`;

    const cacheMiddleware = (req, res, next) => {
      const key = cacheKey(req.method, req.path);
      if (cache.has(key)) {
        return { fromCache: true, data: cache.get(key) };
      }
      const result = { data: 'fresh', fromCache: false };
      if (req.method === 'GET') cache.set(key, result.data);
      return result;
    };

    const req1 = { method: 'GET', path: '/api/users' };
    const req2 = { method: 'GET', path: '/api/users' };
    const req3 = { method: 'POST', path: '/api/users' };

    const res1 = cacheMiddleware(req1, null, null);
    const res2 = cacheMiddleware(req2, null, null);
    const res3 = cacheMiddleware(req3, null, null);

    return {
      name: 'Caching',
      passed: res1.fromCache === false && res2.fromCache === true && res3.fromCache === false,
      details: { cacheSize: cache.size, hitRate: res2.fromCache ? 'yes' : 'no' }
    };
  }

  async validateAuthenticationMiddleware() {
    const validTokens = new Set(['token-123', 'token-456', 'token-789']);

    const authMiddleware = (req) => {
      const token = req.headers?.authorization?.replace('Bearer ', '');
      if (!token) return { authenticated: false, error: 'Missing token' };
      if (!validTokens.has(token)) return { authenticated: false, error: 'Invalid token' };
      return { authenticated: true, userId: token.split('-')[1] };
    };

    const req1 = { headers: { authorization: 'Bearer token-123' } };
    const req2 = { headers: { authorization: 'Bearer invalid-token' } };
    const req3 = { headers: {} };

    const result1 = authMiddleware(req1);
    const result2 = authMiddleware(req2);
    const result3 = authMiddleware(req3);

    return {
      name: 'Authentication Middleware',
      passed: result1.authenticated === true && result2.authenticated === false && result3.authenticated === false,
      details: { authenticated: result1.authenticated, invalidToken: result2.error, missingToken: result3.error }
    };
  }

  async validateRequestValidation() {
    const validateSchema = (data, schema) => {
      const errors = [];

      for (const [key, rules] of Object.entries(schema)) {
        if (rules.required && !(key in data)) {
          errors.push(`${key} is required`);
        }
        if (rules.type && typeof data[key] !== rules.type) {
          errors.push(`${key} must be ${rules.type}`);
        }
        if (rules.minLength && data[key]?.length < rules.minLength) {
          errors.push(`${key} must be at least ${rules.minLength} characters`);
        }
      }

      return errors;
    };

    const schema = {
      name: { required: true, type: 'string', minLength: 3 },
      email: { required: true, type: 'string' },
      age: { type: 'number' }
    };

    const valid = { name: 'John', email: 'john@example.com', age: 30 };
    const invalid1 = { name: 'Jo', email: 'john@example.com' };
    const invalid2 = { email: 'john@example.com', age: 30 };

    const errors1 = validateSchema(valid, schema);
    const errors2 = validateSchema(invalid1, schema);
    const errors3 = validateSchema(invalid2, schema);

    return {
      name: 'Request Validation',
      passed: errors1.length === 0 && errors2.length >= 1 && errors3.length >= 1,
      details: { validErrors: errors1.length, invalid1Errors: errors2.length, invalid2Errors: errors3.length }
    };
  }

  async validateCORSHandling() {
    const corsMiddleware = (req, origin, allowedOrigins) => {
      const headers = {};
      if (allowedOrigins.includes(origin)) {
        headers['Access-Control-Allow-Origin'] = origin;
        headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE';
        headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization';
      }
      return headers;
    };

    const allowedOrigins = ['http://localhost:3000', 'https://example.com'];

    const headers1 = corsMiddleware({}, 'http://localhost:3000', allowedOrigins);
    const headers2 = corsMiddleware({}, 'https://malicious.com', allowedOrigins);
    const headers3 = corsMiddleware({}, 'https://example.com', allowedOrigins);

    return {
      name: 'CORS Handling',
      passed: headers1['Access-Control-Allow-Origin'] === 'http://localhost:3000' &&
              !headers2['Access-Control-Allow-Origin'] &&
              headers3['Access-Control-Allow-Origin'] === 'https://example.com',
      details: { allowedOrigins: allowedOrigins.length, corsHeadersSet: Object.keys(headers1).length, maliciousBlocked: !headers2['Access-Control-Allow-Origin'] }
    };
  }

  async validateContentNegotiation() {
    const formatters = {
      'application/json': (data) => JSON.stringify(data),
      'application/xml': (data) => `<root>${JSON.stringify(data)}</root>`,
      'text/plain': (data) => Object.entries(data).map(([k, v]) => `${k}: ${v}`).join('\n')
    };

    const selectFormatter = (acceptHeader) => {
      const contentType = acceptHeader?.split(',')[0].trim();
      return formatters[contentType] || formatters['application/json'];
    };

    const data = { id: 1, name: 'test' };
    const formatter1 = selectFormatter('application/json');
    const formatter2 = selectFormatter('application/xml');
    const formatter3 = selectFormatter('text/plain');

    const result1 = formatter1(data);
    const result2 = formatter2(data);
    const result3 = formatter3(data);

    return {
      name: 'Content Negotiation',
      passed: result1.includes('"id"') && result2.includes('<root>') && result3.includes('id:'),
      details: { jsonFormatted: result1.includes('"id"'), xmlFormatted: result2.includes('<root>'), plainFormatted: result3.includes('id:') }
    };
  }

  async validateVersionedAPI() {
    const routes = {
      v1: new Map(),
      v2: new Map()
    };

    routes.v1.set('/users', () => ({ format: 'simple', users: [] }));
    routes.v2.set('/users', () => ({ format: 'detailed', users: [], meta: { total: 0 } }));

    const getRoute = (version, path) => {
      return routes[version]?.get(path);
    };

    const v1Handler = getRoute('v1', '/users');
    const v2Handler = getRoute('v2', '/users');

    const v1Result = v1Handler ? v1Handler() : null;
    const v2Result = v2Handler ? v2Handler() : null;

    return {
      name: 'Versioned API',
      passed: v1Result.format === 'simple' && v2Result.format === 'detailed' &&
              !v1Result.meta && v2Result.meta,
      details: { v1Format: v1Result?.format, v2Format: v2Result?.format, versionsSupported: 2 }
    };
  }

  async validateCompressionMiddleware() {
    let compressed = 0;
    const data = 'x'.repeat(1000);

    const compressionMiddleware = (data, shouldCompress = false) => {
      if (shouldCompress && data.length > 100) {
        compressed++;
        return { compressed: true, size: Math.ceil(data.length * 0.3), original: data.length };
      }
      return { compressed: false, size: data.length, original: data.length };
    };

    const result1 = compressionMiddleware(data, true);
    const result2 = compressionMiddleware(data, false);
    const result3 = compressionMiddleware('short', true);

    return {
      name: 'Compression Middleware',
      passed: result1.compressed === true && result2.compressed === false && result3.compressed === false,
      details: { compressionApplied: compressed, reductionRatio: Math.round((1 - result1.size / result1.original) * 100) + '%' }
    };
  }

  async validateTimeoutHandling() {
    const timeoutMiddleware = (handler, timeoutMs) => {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Timeout')), timeoutMs);
        Promise.resolve(handler()).then(
          (result) => { clearTimeout(timer); resolve(result); },
          (err) => { clearTimeout(timer); reject(err); }
        );
      });
    };

    let results = [];

    try {
      await timeoutMiddleware(() => Promise.resolve({ data: 'ok' }), 1000);
      results.push('success');
    } catch (e) {
      results.push('timeout');
    }

    try {
      await timeoutMiddleware(() => new Promise(r => {}), 100);
      results.push('success');
    } catch (e) {
      results.push('timeout');
    }

    return {
      name: 'Timeout Handling',
      passed: results[0] === 'success' && results[1] === 'timeout',
      details: { results }
    };
  }

  async validateWebSocketUpgrade() {
    const upgradeProtocol = (headers) => {
      if (headers['upgrade'] === 'websocket' && headers['connection']?.includes('Upgrade')) {
        return { upgraded: true, protocol: 'websocket' };
      }
      return { upgraded: false, protocol: 'http' };
    };

    const req1 = { headers: { upgrade: 'websocket', connection: 'Upgrade' } };
    const req2 = { headers: { upgrade: 'websocket', connection: 'Keep-Alive' } };
    const req3 = { headers: { upgrade: 'http2', connection: 'Upgrade' } };

    const result1 = upgradeProtocol(req1.headers);
    const result2 = upgradeProtocol(req2.headers);
    const result3 = upgradeProtocol(req3.headers);

    return {
      name: 'WebSocket Upgrade',
      passed: result1.upgraded === true && result2.upgraded === false && result3.upgraded === false,
      details: { validUpgrades: 1, invalidUpgrades: 2 }
    };
  }

  async validateLoadBalancing() {
    const servers = ['server1', 'server2', 'server3'];
    let roundRobinIndex = 0;

    const selectServer = () => {
      const server = servers[roundRobinIndex % servers.length];
      roundRobinIndex++;
      return server;
    };

    const selected = [];
    for (let i = 0; i < 9; i++) {
      selected.push(selectServer());
    }

    const even = selected.filter(s => s === 'server1').length === 3 &&
                 selected.filter(s => s === 'server2').length === 3 &&
                 selected.filter(s => s === 'server3').length === 3;

    return {
      name: 'Load Balancing (Round-Robin)',
      passed: even,
      details: { servers: servers.length, requests: selected.length, distribution: 'equal' }
    };
  }

  async validateCircuitBreakerPattern() {
    let failureCount = 0;
    const threshold = 5;
    let state = 'CLOSED';

    const circuitBreaker = async (handler) => {
      if (state === 'OPEN') {
        throw new Error('Circuit breaker is OPEN');
      }

      try {
        const result = await handler();
        failureCount = 0;
        state = 'CLOSED';
        return result;
      } catch (e) {
        failureCount++;
        if (failureCount >= threshold) {
          state = 'OPEN';
        }
        throw e;
      }
    };

    let successCount = 0;

    for (let i = 0; i < 7; i++) {
      try {
        await circuitBreaker(() => {
          if (i < 5) throw new Error('Failure');
          return { success: true };
        });
        successCount++;
      } catch (e) {
        if (e.message !== 'Circuit breaker is OPEN') successCount++;
      }
    }

    return {
      name: 'Circuit Breaker Pattern',
      passed: state === 'OPEN' && failureCount >= threshold,
      details: { failures: failureCount, threshold, state, successCount }
    };
  }

  async validateMetricsCollection() {
    const metrics = {
      requests: 0,
      responses: 0,
      errors: 0,
      totalDuration: 0
    };

    const metricsMiddleware = (handler) => {
      metrics.requests++;
      const start = Date.now();
      try {
        const result = handler();
        metrics.responses++;
        return result;
      } catch (e) {
        metrics.errors++;
        throw e;
      } finally {
        metrics.totalDuration += Date.now() - start;
      }
    };

    for (let i = 0; i < 10; i++) {
      try {
        metricsMiddleware(() => {
          if (i >= 8) throw new Error('Handler error');
          return {};
        });
      } catch (e) {
      }
    }

    return {
      name: 'Metrics Collection',
      passed: metrics.requests === 10 && metrics.responses === 8 && metrics.errors === 2,
      details: { requests: metrics.requests, responses: metrics.responses, errors: metrics.errors }
    };
  }

  async runAllTests() {
    this.testResults = await Promise.all([
      this.validateBasicRouting(),
      this.validatePathParameterExtraction(),
      this.validateMiddlewareChaining(),
      this.validateErrorHandling(),
      this.validateRequestTransformation(),
      this.validateResponseFormatting(),
      this.validateRateLimiting(),
      this.validateCaching(),
      this.validateAuthenticationMiddleware(),
      this.validateRequestValidation(),
      this.validateCORSHandling(),
      this.validateContentNegotiation(),
      this.validateVersionedAPI(),
      this.validateCompressionMiddleware(),
      this.validateTimeoutHandling(),
      this.validateWebSocketUpgrade(),
      this.validateLoadBalancing(),
      this.validateCircuitBreakerPattern(),
      this.validateMetricsCollection()
    ]);

    return this.testResults;
  }

  getSummary() {
    const passed = this.testResults.filter(t => t.passed).length;
    const total = this.testResults.length;
    return {
      total,
      passed,
      failed: total - passed,
      percentage: Math.round((passed / total) * 100),
      tests: this.testResults
    };
  }
}

export function createAPIGatewayValidator() {
  return new APIGatewayValidator();
}
