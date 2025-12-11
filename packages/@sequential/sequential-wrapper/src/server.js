import { detectEnvironment } from './env.js';
import { executeMethodChain, formatResponse } from './chain-executor.js';
import { initializeModule } from './module-loader.js';
import { processSdkRequest } from './request-handler.js';
import { addCorsHeaders } from './cors-handler.js';
import { createDenoHandler, createExpressMiddleware as createExpressMiddlewareImpl } from './http-handlers.js';

export { executeMethodChain, formatResponse, initializeModule, processSdkRequest, addCorsHeaders, createDenoHandler };

let createExpressMiddleware;

if (detectEnvironment() === 'node') {
  createExpressMiddleware = createExpressMiddlewareImpl;

  if (typeof process !== 'undefined' && process.argv[1] === import.meta.url) {
    try {
      const { default: express } = await import('express');
      const app = express();
      app.use(express.json());
      app.use(createExpressMiddleware());

      const port = process.env.PORT || 3000;
      app.listen(port, () => {
        console.log(`SDK Proxy server running on port ${port}`);
        console.log(`Endpoint: http://localhost:${port}/api/sdk-proxy`);
        console.log(`Service endpoints: http://localhost:${port}/api/proxy/:service`);
      });
    } catch (err) {
      console.error('Failed to start Express server:', err);
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    executeMethodChain,
    formatResponse,
    detectEnvironment,
    initializeModule,
    addCorsHeaders,
    processSdkRequest,
    createDenoHandler,
    createExpressMiddleware
  };
}
