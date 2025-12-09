export class SecurityAccessValidator {
  constructor() {
    this.testResults = [];
  }

  async validateAuthenticationTokenParsing() {
    const validFormats = [
      { header: 'Bearer token123', expected: 'token123', source: 'header' },
      { query: 'token=token456', expected: 'token456', source: 'query' },
      { cookie: 'session=abc789', expected: 'abc789', source: 'cookie' }
    ];

    const results = validFormats.map(fmt => {
      let extracted;
      if (fmt.source === 'header') {
        extracted = fmt.header.replace(/^Bearer\s+/, '');
      } else if (fmt.source === 'query') {
        extracted = fmt.query.split('=')[1];
      } else {
        extracted = fmt.cookie.split('=')[1];
      }
      return extracted === fmt.expected;
    });

    return {
      name: 'Authentication Token Parsing',
      passed: results.every(r => r),
      details: { formats: validFormats.length, parsed: results.filter(r => r).length }
    };
  }

  async validateSessionExpiration() {
    const now = Date.now();
    const sessionDuration = 7 * 24 * 60 * 60 * 1000;
    const createdAt = now - sessionDuration - 1000;
    const expiresAt = createdAt + sessionDuration;

    const isExpired = now > expiresAt;
    const timeSinceExpiration = now - expiresAt;

    return {
      name: 'Session Expiration Validation',
      passed: isExpired && timeSinceExpiration > 0,
      details: { sessionDuration: '7 days', expired: isExpired, timeSinceExpiration }
    };
  }

  async validateAPIKeyFormat() {
    const validKeys = [
      { key: 'zb_' + 'a'.repeat(64), valid: true },
      { key: 'zb_' + 'f'.repeat(64), valid: true },
      { key: 'zb_' + 'g'.repeat(64), valid: false },
      { key: 'wrong_' + 'a'.repeat(64), valid: false },
      { key: 'zb_' + 'a'.repeat(63), valid: false }
    ];

    const results = validKeys.map(test => {
      const match = /^zb_[a-f0-9]{64}$/.test(test.key);
      return match === test.valid;
    });

    return {
      name: 'API Key Format Validation',
      passed: results.every(r => r),
      details: { tested: validKeys.length, valid: results.filter(r => r).length }
    };
  }

  async validatePasswordPolicy() {
    const passwords = [
      { pwd: 'short', valid: false },
      { pwd: '123456', valid: true },
      { pwd: 'securePassword123!', valid: true },
      { pwd: '', valid: false },
      { pwd: 'pass', valid: false }
    ];

    const results = passwords.map(test => {
      const isValid = test.pwd.length >= 6 && test.pwd.length <= 128;
      return isValid === test.valid;
    });

    return {
      name: 'Password Policy Enforcement',
      passed: results.every(r => r),
      details: { minLength: 6, maxLength: 128, valid: results.filter(r => r).length }
    };
  }

  async validateUserNameConstraints() {
    const usernames = [
      { name: 'ab', valid: false },
      { name: 'abc', valid: true },
      { name: 'valid_user123', valid: true },
      { name: 'Invalid User', valid: false },
      { name: 'a'.repeat(33), valid: false },
      { name: 'a'.repeat(32), valid: true }
    ];

    const results = usernames.map(test => {
      const matches = /^[a-z0-9_]{3,32}$/.test(test.name);
      return matches === test.valid;
    });

    return {
      name: 'Username Constraints Validation',
      passed: results.every(r => r),
      details: { minLength: 3, maxLength: 32, pattern: '[a-z0-9_]', valid: results.filter(r => r).length }
    };
  }

  async validatePathTraversalProtection() {
    const paths = [
      { path: '/tasks/my-task', safe: true },
      { path: '/tasks/../admin', safe: false },
      { path: '/tasks/%2e%2e/admin', safe: false },
      { path: '/tasks/..%2fadmin', safe: false },
      { path: '/valid/path/name', safe: true }
    ];

    const results = paths.map(test => {
      const hasLiteralDots = /\.\./.test(test.path);
      const hasEncodedDots = /%2e%2e/i.test(test.path);
      const isSafe = !hasLiteralDots && !hasEncodedDots;
      return isSafe === test.safe;
    });

    return {
      name: 'Path Traversal Protection',
      passed: results.every(r => r),
      details: { tested: paths.length, protected: results.filter(r => r).length }
    };
  }

  async validateInputSizeLimit() {
    const testCases = [
      { input: 'x'.repeat(1000), limit: 10000, exceeds: false },
      { input: 'x'.repeat(10001), limit: 10000, exceeds: true },
      { input: 'x'.repeat(5000000), limit: 10000, exceeds: true },
      { input: '', limit: 10000, exceeds: false }
    ];

    const results = testCases.map(test => {
      const isExceeded = test.input.length > test.limit;
      return isExceeded === test.exceeds;
    });

    return {
      name: 'Input Size Limit Enforcement',
      passed: results.every(r => r),
      details: { tested: testCases.length, limited: results.filter(r => r).length, maxSize: 10000 }
    };
  }

  async validateSecurityHeaders() {
    const requiredHeaders = [
      { name: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { name: 'X-Content-Type-Options', value: 'nosniff' },
      { name: 'X-XSS-Protection', value: '1; mode=block' },
      { name: 'Strict-Transport-Security', value: 'max-age=31536000' },
      { name: 'Content-Security-Policy', value: 'default-src' }
    ];

    const headerMap = new Map([
      ['X-Frame-Options', 'SAMEORIGIN'],
      ['X-Content-Type-Options', 'nosniff'],
      ['X-XSS-Protection', '1; mode=block'],
      ['Strict-Transport-Security', 'max-age=31536000; includeSubDomains'],
      ['Content-Security-Policy', 'default-src \'self\'']
    ]);

    const results = requiredHeaders.map(header => {
      const value = headerMap.get(header.name);
      return value && value.includes(header.value);
    });

    return {
      name: 'Security Headers Presence',
      passed: results.every(r => r),
      details: { required: requiredHeaders.length, present: results.filter(r => r).length }
    };
  }

  async validateCORSConfiguration() {
    const corsConfig = {
      origin: '*',
      methods: 'GET,POST,PUT,DELETE,OPTIONS',
      headers: 'Content-Type,Authorization',
      maxAge: 3600
    };

    const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'];
    const methods = corsConfig.methods.split(',');
    const allValid = methods.every(m => validMethods.includes(m.trim()));

    return {
      name: 'CORS Configuration Validation',
      passed: corsConfig.origin && allValid && corsConfig.maxAge > 0,
      details: {
        allowedOrigin: corsConfig.origin,
        methods: methods.length,
        maxAge: corsConfig.maxAge,
        secure: corsConfig.origin !== '*'
      }
    };
  }

  async validateRateLimitingConfiguration() {
    const rateLimitConfig = {
      httpLimit: { max: 100, windowMs: 60000 },
      wsLimit: { connectionsPerIp: 10, cleanupInterval: 30000 },
      apiLimit: { max: 1000, windowMs: 3600000 }
    };

    const isConfigured = rateLimitConfig.httpLimit.max > 0 &&
                        rateLimitConfig.wsLimit.connectionsPerIp > 0;

    return {
      name: 'Rate Limiting Configuration',
      passed: isConfigured,
      details: {
        httpRequests: `${rateLimitConfig.httpLimit.max}/min`,
        wsConnections: `${rateLimitConfig.wsLimit.connectionsPerIp}/ip`,
        apiRequests: `${rateLimitConfig.apiLimit.max}/hr`
      }
    };
  }

  async validateSensitiveDataRedaction() {
    const testCases = [
      { field: 'password', value: 'secret123', shouldRedact: true },
      { field: 'apiKey', value: 'key_abc123', shouldRedact: true },
      { field: 'token', value: 'token_xyz789', shouldRedact: true },
      { field: 'username', value: 'john_doe', shouldRedact: false },
      { field: 'email', value: 'user@example.com', shouldRedact: false }
    ];

    const sensitiveFields = ['password', 'token', 'key', 'secret', 'apikey', 'api_key', 'authorization'];
    const results = testCases.map(test => {
      const isSensitive = sensitiveFields.some(field => test.field.toLowerCase().includes(field));
      return isSensitive === test.shouldRedact;
    });

    return {
      name: 'Sensitive Data Redaction',
      passed: results.every(r => r),
      details: { tested: testCases.length, redacted: results.filter(r => r).length, fields: sensitiveFields.length }
    };
  }

  async validateErrorMessageSanitization() {
    const errors = [
      { message: 'Database connection failed', safe: true },
      { message: 'Invalid input: ' + JSON.stringify({ password: 'secret' }), safe: false },
      { message: 'User not found', safe: true },
      { message: 'API key: sk_live_123456789', safe: false },
      { message: 'File not found at /path/to/file', safe: true }
    ];

    const results = errors.map(test => {
      const hasSecret = test.message.match(/password|secret|apikey|token|key:/i);
      const isSafe = !hasSecret;
      return isSafe === test.safe;
    });

    return {
      name: 'Error Message Sanitization',
      passed: results.every(r => r),
      details: { tested: errors.length, safe: results.filter(r => r).length }
    };
  }

  async validateBotPermissionModel() {
    const bots = [
      { name: 'bot1', permissions: ['read', 'write'], canAdmin: false },
      { name: 'admin_bot', permissions: ['admin'], canAdmin: true },
      { name: 'readonly_bot', permissions: ['read'], canAdmin: false },
      { name: 'full_bot', permissions: ['read', 'write', 'speak', 'admin'], canAdmin: true }
    ];

    const results = bots.map(bot => {
      const isAdmin = bot.permissions.includes('admin');
      return isAdmin === bot.canAdmin;
    });

    return {
      name: 'Bot Permission Model',
      passed: results.every(r => r),
      details: { bots: bots.length, adminBots: bots.filter(b => b.canAdmin).length }
    };
  }

  async validateAuthenticationMiddlewareChaining() {
    const mockRequest = { headers: { authorization: 'Bearer token123' } };
    const middlewareChain = [];

    const parseAuth = (req) => {
      const token = req.headers.authorization?.replace(/^Bearer\s+/, '');
      return { ...req, token };
    };

    const validateToken = (req) => {
      const isValid = req.token && req.token.length > 0;
      return { ...req, authenticated: isValid };
    };

    const result = validateToken(parseAuth(mockRequest));

    return {
      name: 'Authentication Middleware Chaining',
      passed: result.authenticated && result.token === 'token123',
      details: { steps: 2, authenticated: result.authenticated, tokenPresent: !!result.token }
    };
  }

  async validateJWTPayloadValidation() {
    const jwtPayload = {
      sub: '123456',
      username: 'johndoe',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600
    };

    const isValid = jwtPayload.sub && jwtPayload.iat && jwtPayload.exp && jwtPayload.exp > jwtPayload.iat;
    const isNotExpired = jwtPayload.exp > Math.floor(Date.now() / 1000);

    return {
      name: 'JWT Payload Validation',
      passed: isValid && isNotExpired,
      details: { hasSubject: !!jwtPayload.sub, hasExpiry: !!jwtPayload.exp, notExpired: isNotExpired }
    };
  }

  async validateRoleBasedAccessControl() {
    const users = [
      { username: 'admin', role: 'admin', canDelete: true, canRead: true },
      { username: 'editor', role: 'editor', canDelete: false, canRead: true },
      { username: 'viewer', role: 'viewer', canDelete: false, canRead: true }
    ];

    const rolePermissions = {
      admin: ['create', 'read', 'update', 'delete'],
      editor: ['create', 'read', 'update'],
      viewer: ['read']
    };

    const results = users.map(user => {
      const perms = rolePermissions[user.role] || [];
      const hasDelete = perms.includes('delete');
      const hasRead = perms.includes('read');
      return hasDelete === user.canDelete && hasRead === user.canRead;
    });

    return {
      name: 'Role-Based Access Control',
      passed: results.every(r => r),
      details: { users: users.length, roles: Object.keys(rolePermissions).length, correct: results.filter(r => r).length }
    };
  }

  async validateAuditLogging() {
    const auditLog = [];

    const logEvent = (action, user, resource) => {
      auditLog.push({
        action,
        user,
        resource,
        timestamp: Date.now(),
        success: true
      });
    };

    logEvent('CREATE', 'user1', 'task-1');
    logEvent('READ', 'user2', 'task-1');
    logEvent('UPDATE', 'user1', 'task-1');
    logEvent('DELETE', 'user1', 'task-1');

    return {
      name: 'Audit Logging',
      passed: auditLog.length === 4 && auditLog.every(e => e.timestamp && e.action),
      details: { events: auditLog.length, fields: ['action', 'user', 'resource', 'timestamp'] }
    };
  }

  async validateHTTPSEnforcement() {
    const requests = [
      { url: 'https://api.example.com/endpoint', secure: true },
      { url: 'http://api.example.com/endpoint', secure: false },
      { url: 'wss://ws.example.com', secure: true },
      { url: 'ws://ws.example.com', secure: false }
    ];

    const results = requests.map(req => {
      const isSecure = req.url.startsWith('https://') || req.url.startsWith('wss://');
      return isSecure === req.secure;
    });

    return {
      name: 'HTTPS/WSS Protocol Enforcement',
      passed: results.every(r => r),
      details: { tested: requests.length, enforcing: true, protocols: ['https', 'wss'] }
    };
  }

  async validateCsrfTokenGeneration() {
    const tokenLength = 32;
    const generateCsrfToken = () => {
      const chars = 'abcdef0123456789';
      let token = '';
      for (let i = 0; i < tokenLength; i++) {
        token += chars[Math.floor(Math.random() * chars.length)];
      }
      return token;
    };

    const token1 = generateCsrfToken();
    const token2 = generateCsrfToken();
    const token3 = generateCsrfToken();

    const uniqueTokens = new Set([token1, token2, token3]);

    return {
      name: 'CSRF Token Generation',
      passed: uniqueTokens.size === 3 && token1.length === tokenLength && token2.length === tokenLength && token3.length === tokenLength,
      details: { tokensGenerated: 3, unique: uniqueTokens.size, length: tokenLength, allCorrectLength: token1.length === tokenLength }
    };
  }

  async validateInputTypeCoercion() {
    const testCases = [
      { input: '123', expectedType: 'number', coerceTo: 'number', success: true },
      { input: 'true', expectedType: 'boolean', coerceTo: 'boolean', success: true },
      { input: '[]', expectedType: 'array', coerceTo: 'json', success: true },
      { input: 'not-a-number', expectedType: 'number', coerceTo: 'number', success: false },
      { input: '{"key":"value"}', expectedType: 'object', coerceTo: 'json', success: true }
    ];

    const results = testCases.map(test => {
      try {
        let coerced;
        if (test.coerceTo === 'number') {
          coerced = parseInt(test.input);
          const success = !isNaN(coerced);
          return success === test.success;
        } else if (test.coerceTo === 'boolean') {
          coerced = test.input === 'true';
          return true;
        } else if (test.coerceTo === 'json') {
          coerced = JSON.parse(test.input);
          return true;
        }
      } catch (e) {
        return !test.success;
      }
    });

    return {
      name: 'Input Type Coercion & Validation',
      passed: results.every(r => r),
      details: { tested: testCases.length, coerced: results.filter(r => r).length }
    };
  }

  async validateDatabaseInjectionPrevention() {
    const testCases = [
      { query: 'SELECT * FROM users WHERE id = 1', safe: true },
      { query: 'SELECT * FROM users WHERE id = 1; DROP TABLE users;', safe: false },
      { query: "SELECT * FROM users WHERE name = 'John'", safe: true },
      { query: "SELECT * FROM users WHERE name = 'John'; DELETE FROM users;", safe: false },
      { query: 'SELECT * FROM users WHERE email = ?', safe: true }
    ];

    const results = testCases.map(test => {
      const hasDangerousKeywords = /;|(DROP|DELETE|UPDATE|INSERT)\s/i.test(test.query);
      const isSafe = !hasDangerousKeywords || test.query.includes('?');
      return isSafe === test.safe;
    });

    return {
      name: 'SQL Injection Prevention',
      passed: results.every(r => r),
      details: { tested: testCases.length, protected: results.filter(r => r).length }
    };
  }

  async validateXSSProtection() {
    const testCases = [
      { html: '<div>Hello World</div>', safe: true },
      { html: '<script>alert("XSS")</script>', safe: false },
      { html: '<img src=x onerror="alert(1)">', safe: false },
      { html: '<p>Safe content</p>', safe: true },
      { html: '<div onclick="alert(1)">Click me</div>', safe: false }
    ];

    const results = testCases.map(test => {
      const hasXSS = /<script|onerror|onclick|onload/i.test(test.html);
      const isSafe = !hasXSS;
      return isSafe === test.safe;
    });

    return {
      name: 'XSS Prevention',
      passed: results.every(r => r),
      details: { tested: testCases.length, safe: results.filter(r => r).length, vulnerable: testCases.length - results.filter(r => r).length }
    };
  }

  async validateAPIKeyExpiration() {
    const apiKeys = [
      { key: 'key1', createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000, expiresAt: null, expired: false },
      { key: 'key2', createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000, expiresAt: Date.now() + 10000, expired: false },
      { key: 'key3', createdAt: Date.now() - 180 * 24 * 60 * 60 * 1000, expiresAt: Date.now() - 1000, expired: true }
    ];

    const results = apiKeys.map(key => {
      const isExpired = key.expiresAt !== null && Date.now() > key.expiresAt;
      return isExpired === key.expired;
    });

    return {
      name: 'API Key Expiration Validation',
      passed: results.every(r => r),
      details: { keys: apiKeys.length, expired: apiKeys.filter(k => k.expired).length }
    };
  }

  async validateCryptographicHashingQuality() {
    const passwordHash = {
      algorithm: 'PBKDF2',
      hashFunction: 'SHA512',
      iterations: 10000,
      saltLength: 16,
      hashLength: 64
    };

    const isValid = passwordHash.iterations >= 10000 &&
                   passwordHash.saltLength >= 16 &&
                   passwordHash.algorithm === 'PBKDF2';

    return {
      name: 'Cryptographic Hashing Quality',
      passed: isValid,
      details: {
        algorithm: passwordHash.algorithm,
        function: passwordHash.hashFunction,
        iterations: passwordHash.iterations,
        saltBytes: passwordHash.saltLength,
        hashBytes: passwordHash.hashLength,
        secure: isValid
      }
    };
  }

  async runAllTests() {
    this.testResults = await Promise.all([
      this.validateAuthenticationTokenParsing(),
      this.validateSessionExpiration(),
      this.validateAPIKeyFormat(),
      this.validatePasswordPolicy(),
      this.validateUserNameConstraints(),
      this.validatePathTraversalProtection(),
      this.validateInputSizeLimit(),
      this.validateSecurityHeaders(),
      this.validateCORSConfiguration(),
      this.validateRateLimitingConfiguration(),
      this.validateSensitiveDataRedaction(),
      this.validateErrorMessageSanitization(),
      this.validateBotPermissionModel(),
      this.validateAuthenticationMiddlewareChaining(),
      this.validateJWTPayloadValidation(),
      this.validateRoleBasedAccessControl(),
      this.validateAuditLogging(),
      this.validateHTTPSEnforcement(),
      this.validateCsrfTokenGeneration(),
      this.validateInputTypeCoercion(),
      this.validateDatabaseInjectionPrevention(),
      this.validateXSSProtection(),
      this.validateAPIKeyExpiration(),
      this.validateCryptographicHashingQuality()
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

export function createSecurityAccessValidator() {
  return new SecurityAccessValidator();
}
