import RealtimeClient from '@sequentialos/realtime-sync';

export function createRealtimeSubscription(wsUrl, appId, options = {}) {
  const baseUrl = new URL(wsUrl).origin;
  const client = new RealtimeClient(appId, baseUrl);

  if (options.autoConnect !== false) {
    client.connect().catch(e => console.error('Failed to connect:', e));
  }

  return {
    async subscribe(channel, handler) {
      return client.subscribe(channel, handler);
    },

    async broadcast(channel, data) {
      client.broadcast(channel, 'update', data);
    },

    async disconnect() {
      client.disconnect();
    },

    isConnected() {
      return client.isConnectedStatus();
    },

    getSubscriptions() {
      return client.getChannels();
    }
  };
}
