import { AsyncLocalStorage } from 'async_hooks';

const contextStorage = new AsyncLocalStorage();

export function createExecutionContext(config = {}) {
  const context = {
    appId: config.appId || null,
    userId: config.userId || null,
    sessionToken: config.sessionToken || null,
    correlationId: config.correlationId || generateCorrelationId(),
    parentExecutionId: config.parentExecutionId || null,
    executionId: config.executionId || generateExecutionId(),
    metadata: config.metadata || {},
    timestamp: new Date().toISOString(),
    depth: config.depth || 0
  };

  return context;
}

export function setExecutionContext(context, callback) {
  return contextStorage.run(context, callback);
}

export function getExecutionContext() {
  return contextStorage.getStore() || null;
}

export function runWithContext(context, fn) {
  return new Promise((resolve, reject) => {
    contextStorage.run(context, () => {
      Promise.resolve(fn()).then(resolve).catch(reject);
    });
  });
}

export function createChildContext(config = {}) {
  const parent = getExecutionContext();
  return createExecutionContext({
    appId: config.appId || (parent ? parent.appId : null),
    userId: config.userId || (parent ? parent.userId : null),
    sessionToken: config.sessionToken || (parent ? parent.sessionToken : null),
    correlationId: parent ? parent.correlationId : generateCorrelationId(),
    parentExecutionId: parent ? parent.executionId : null,
    executionId: generateExecutionId(),
    metadata: Object.assign({}, parent ? parent.metadata : {}, config.metadata || {}),
    depth: parent ? (parent.depth + 1) : 0
  });
}

export function withContext(context) {
  return (fn) => {
    return async (...args) => {
      return setExecutionContext(context, () => fn.apply(this, args));
    };
  };
}

export function getContextValue(path, defaultValue) {
  const context = getExecutionContext();
  if (!context) return defaultValue;

  const parts = path.split('.');
  let current = context;
  for (const part of parts) {
    current = current[part];
    if (current === undefined) return defaultValue;
  }
  return current;
}

export function setContextMetadata(key, value) {
  const context = getExecutionContext();
  if (context) {
    context.metadata[key] = value;
  }
}

export function getCorrelationId() {
  return getContextValue('correlationId');
}

export function getExecutionId() {
  return getContextValue('executionId');
}

export function getAppId() {
  return getContextValue('appId');
}

export function getUserId() {
  return getContextValue('userId');
}

export function getSessionToken() {
  return getContextValue('sessionToken');
}

function generateCorrelationId() {
  return 'corr_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

function generateExecutionId() {
  return 'exec_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}
