export function createWebSocketRateLimiter(config = {}) {
  const { cleanupIntervalMs = 60000, maxConnectionsPerIp = 10 } = config;
  const WS_CONNECTION_MAP = new Map();

  setInterval(() => {
    const now = Date.now();
    WS_CONNECTION_MAP.forEach((connections, ip) => {
      const validConnections = connections.filter(c => c.ws.readyState === 1);
      if (validConnections.length === 0) {
        WS_CONNECTION_MAP.delete(ip);
      } else {
        WS_CONNECTION_MAP.set(ip, validConnections);
      }
    });
  }, cleanupIntervalMs);

  return {
    checkLimit(ip) {
      if (!WS_CONNECTION_MAP.has(ip)) {
        WS_CONNECTION_MAP.set(ip, []);
      }

      const connections = WS_CONNECTION_MAP.get(ip);

      return {
        ip,
        isAllowed: () => connections.length < maxConnectionsPerIp,
        getRemainingConnections: () => Math.max(0, maxConnectionsPerIp - connections.length),
        add: (ws) => {
          const conns = WS_CONNECTION_MAP.get(ip);
          if (conns.length >= maxConnectionsPerIp) {
            return false;
          }
          conns.push({ ws, timestamp: Date.now() });
          return true;
        },
        remove: (ws) => {
          const conns = WS_CONNECTION_MAP.get(ip);
          const index = conns.findIndex(c => c.ws === ws);
          if (index !== -1) {
            conns.splice(index, 1);
            if (conns.length === 0) WS_CONNECTION_MAP.delete(ip);
          }
        }
      };
    },

    getStats() {
      return {
        totalIps: WS_CONNECTION_MAP.size,
        totalConnections: Array.from(WS_CONNECTION_MAP.values()).reduce((sum, conns) => sum + conns.length, 0),
        connectionsByIp: Object.fromEntries(
          Array.from(WS_CONNECTION_MAP.entries()).map(([ip, conns]) => [ip, conns.length])
        )
      };
    }
  };
}
