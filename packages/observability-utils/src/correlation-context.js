import { randomUUID } from 'crypto';
import { AsyncLocalStorage } from 'async_hooks';

const correlationContext = new AsyncLocalStorage();

export class CorrelationId {
  constructor(id = randomUUID()) {
    this.id = id;
    this.startTime = Date.now();
    this.metadata = {};
  }

  addMetadata(key, value) {
    this.metadata[key] = value;
    return this;
  }

  duration() {
    return Date.now() - this.startTime;
  }
}

export function createCorrelationId(id) {
  return new CorrelationId(id);
}

export function setCorrelationContext(correlationId) {
  correlationContext.enterWith(correlationId);
  return correlationId;
}

export function getCorrelationContext() {
  return correlationContext.getStore();
}

export function withCorrelationContext(correlationId, fn) {
  return correlationContext.run(correlationId, fn);
}

export function correlationMiddleware(req, res, next) {
  const correlationId = createCorrelationId(
    req.headers['x-correlation-id'] || randomUUID()
  );

  correlationId.addMetadata('method', req.method);
  correlationId.addMetadata('path', req.path);
  correlationId.addMetadata('ip', req.ip);

  res.setHeader('X-Correlation-ID', correlationId.id);
  req.correlationId = correlationId;

  setCorrelationContext(correlationId);
  next();
}
