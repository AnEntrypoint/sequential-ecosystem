export function detectEnvironment() {
  if (typeof window === 'undefined') {
    return { baseUrl: process.env.API_URL || 'http://localhost:8003', wsUrl: process.env.WS_URL || 'ws://localhost:8003' };
  }

  const { protocol, hostname, port } = window.location;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  const apiPort = port || (protocol === 'https:' ? 443 : 80);

  const baseUrl = `${protocol}//${hostname}${port && port !== '80' && port !== '443' ? ':' + port : ''}`;
  const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${wsProtocol}//${hostname}${port && port !== '80' && port !== '443' ? ':' + port : ''}`;

  return {
    baseUrl,
    wsUrl,
    isLocalhost,
    hostname,
    port: port ? parseInt(port) : null
  };
}

export function initializeGlobalEnv() {
  const env = detectEnvironment();
  if (typeof window !== 'undefined') {
    window.__SEQUENTIAL_ENV__ = env;
  }
  return env;
}

export function getEnvironment() {
  if (typeof window !== 'undefined' && window.__SEQUENTIAL_ENV__) {
    return window.__SEQUENTIAL_ENV__;
  }
  return detectEnvironment();
}
