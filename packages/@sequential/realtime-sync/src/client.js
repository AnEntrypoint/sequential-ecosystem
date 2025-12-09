const RECONNECT_DELAYS = [1000, 2000, 5000, 10000, 30000];

export class RealtimeClient {
  constructor(appId, baseUrl = '/') {
    this.appId = appId;
    this.baseUrl = baseUrl;
    this.ws = null;
    this.listeners = new Map();
    this.channels = new Set();
    this.reconnectAttempts = 0;
    this.messageQueue = [];
    this.isConnected = false;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      try {
        const protocol = this.baseUrl.includes('https') ? 'wss:' : 'ws:';
        const host = typeof window !== 'undefined' ? window.location.host : 'localhost:8003';
        const wsUrl = `${protocol}//${host}/ws/realtime/${this.appId}`;

        this.ws = new WebSocket(wsUrl);
        this.ws.onopen = async () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          await this.flushMessageQueueAsync();
          resolve();
        };

        this.ws.onmessage = (evt) => this.handleMessage(JSON.parse(evt.data));
        this.ws.onerror = (err) => reject(err);
        this.ws.onclose = () => this.attemptReconnect();
      } catch (e) {
        reject(e);
      }
    });
  }

  handleMessage(msg) {
    const { channel, type, data, id } = msg;
    const listeners = this.listeners.get(channel) || [];
    listeners.forEach(cb => {
      try {
        cb({ type, data, id, channel });
      } catch (e) {
        console.error(`Listener error on ${channel}:`, e);
      }
    });
  }

  attemptReconnect() {
    this.isConnected = false;
    if (this.reconnectAttempts >= RECONNECT_DELAYS.length) {
      return;
    }
    const delay = RECONNECT_DELAYS[this.reconnectAttempts++];
    setTimeout(() => {
      this.connect().catch(e => console.error('Reconnect failed:', e));
    }, delay);
  }

  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const msg = this.messageQueue.shift();
      this.send(msg);
    }
  }

  async flushMessageQueueAsync() {
    while (this.messageQueue.length > 0 && this.isConnected && this.ws) {
      const msg = this.messageQueue.shift();
      this.ws.send(JSON.stringify(msg));
      await new Promise(resolve => setTimeout(resolve, 5));
    }
  }

  send(msg) {
    if (!this.isConnected || !this.ws) {
      this.messageQueue.push(msg);
      return;
    }
    this.ws.send(JSON.stringify(msg));
  }

  broadcast(channel, type, data) {
    this.send({ channel, type, data, direction: 'out' });
  }

  subscribe(channel, listener) {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, []);
      this.channels.add(channel);
      this.send({ channel, action: 'subscribe' });
    }
    this.listeners.get(channel).push(listener);
    return () => this.unsubscribe(channel, listener);
  }

  unsubscribe(channel, listener) {
    const cbs = this.listeners.get(channel);
    if (!cbs) return;
    const idx = cbs.indexOf(listener);
    if (idx >= 0) cbs.splice(idx, 1);
    if (cbs.length === 0) {
      this.channels.delete(channel);
      this.send({ channel, action: 'unsubscribe' });
    }
  }

  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(handler);
    return () => this.off(event, handler);
  }

  off(event, handler) {
    if (!this.listeners.has(event)) return;
    const handlers = this.listeners.get(event);
    const idx = handlers.indexOf(handler);
    if (idx >= 0) handlers.splice(idx, 1);
  }

  emit(event, data) {
    const handlers = this.listeners.get(event) || [];
    handlers.forEach(h => {
      try {
        h(data);
      } catch (e) {
        console.error(`Handler error on ${event}:`, e);
      }
    });
  }

  getChannels() {
    return Array.from(this.channels);
  }

  disconnect() {
    this.close();
  }

  isConnectedStatus() {
    return this.isConnected;
  }
}

export default RealtimeClient;
