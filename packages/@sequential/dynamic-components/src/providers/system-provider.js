import React, { createContext, useContext } from 'react';

export const SystemContext = createContext();

export function SystemProvider({
  children,
  stateManager,
  realtimeBroadcaster,
  appSDK,
  auth,
  requestContext,
  errorHandler
}) {
  const value = {
    stateManager,
    realtimeBroadcaster,
    appSDK,
    auth,
    requestContext,
    errorHandler,
    ready: !!(stateManager && realtimeBroadcaster && appSDK)
  };

  return (
    <SystemContext.Provider value={value}>
      {children}
    </SystemContext.Provider>
  );
}

export function useSystem() {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error('useSystem must be used within SystemProvider');
  }
  return context;
}

export function useStorage() {
  const { stateManager } = useSystem();
  return {
    get: (key) => stateManager.get(key),
    set: (key, value) => stateManager.set(key, value),
    delete: (key) => stateManager.delete(key),
    list: (prefix) => stateManager.list(prefix)
  };
}

export function useRealtime() {
  const { realtimeBroadcaster } = useSystem();
  return {
    broadcast: (channel, event, data) => realtimeBroadcaster.broadcast(channel, event, data),
    subscribe: (channel, handler) => realtimeBroadcaster.subscribe(channel, handler),
    unsubscribe: (channel, handler) => realtimeBroadcaster.unsubscribe(channel, handler)
  };
}

export function useAppSDK() {
  const { appSDK } = useSystem();
  return {
    callTool: (toolName, input) => appSDK.callTool(toolName, input),
    callTask: (taskName, input) => appSDK.callTask(taskName, input),
    callFlow: (flowId, input) => appSDK.callFlow(flowId, input),
    getData: (key) => appSDK.getData(key),
    setData: (key, value) => appSDK.setData(key, value),
    runCommand: (cmd) => appSDK.runCommand(cmd)
  };
}

export function useAuth() {
  const { auth } = useSystem();
  if (!auth) {
    return { authenticated: false, user: null };
  }
  return auth;
}

export function useRequestContext() {
  const { requestContext } = useSystem();
  if (!requestContext) {
    return { path: null, method: null, headers: {} };
  }
  return requestContext;
}

export function useErrorHandler() {
  const { errorHandler } = useSystem();
  return {
    logError: (error) => errorHandler?.logError?.(error),
    captureException: (error) => errorHandler?.captureException?.(error)
  };
}
