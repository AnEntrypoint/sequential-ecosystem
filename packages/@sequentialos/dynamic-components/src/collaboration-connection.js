// WebSocket connection management
export class CollaborationConnection {
  constructor(appId = 'default') {
    this.appId = appId;
    this.ws = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = new Map();
  }

  connect(wsUrl) {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.emit('connected', { timestamp: Date.now() });
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.emit('message', message);
          } catch (e) {
            console.error('Failed to parse message:', e);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.emit('error', error);
          reject(error);
        };

        this.ws.onclose = () => {
          this.isConnected = false;
          this.emit('disconnected');
          this.attemptReconnect(wsUrl);
        };
      } catch (e) {
        reject(e);
      }
    });
  }

  attemptReconnect(wsUrl) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000);
      setTimeout(() => this.connect(wsUrl), delay);
    }
  }

  send(message) {
    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify(message));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.isConnected = false;
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const idx = callbacks.indexOf(callback);
      if (idx > -1) callbacks.splice(idx, 1);
    }
  }

  emit(event, data) {
    const callbacks = this.listeners.get(event) || [];
    for (const callback of callbacks) {
      callback(data);
    }
  }
}
