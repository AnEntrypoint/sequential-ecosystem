export class RealtimeConnection {
  constructor(wsUrl, roomId, options = {}) {
    this.wsUrl = wsUrl;
    this.roomId = roomId;
    this.userId = options.userId;
    this.appId = options.appId;
    this.handlers = new Map();
    this.ws = null;
    this.connected = false;
    this.autoConnect = options.autoConnect !== false;

    if (this.autoConnect) {
      this.connect();
    }
  }

  connect() {
    if (this.ws) return;

    const url = new URL(this.wsUrl);
    url.pathname = '/api/realtime/connect';
    url.searchParams.set('roomId', this.roomId);

    this.ws = new WebSocket(url.toString());

    this.ws.onopen = () => {
      this.connected = true;
      if (this.userId) {
        this.ws.send(JSON.stringify({
          type: 'auth',
          userId: this.userId,
          appId: this.appId
        }));
      }
      this.emit('connected', { roomId: this.roomId });
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (e) {
        console.error('Failed to parse message:', e);
      }
    };

    this.ws.onerror = (error) => {
      this.emit('error', error);
    };

    this.ws.onclose = () => {
      this.connected = false;
      this.ws = null;
      this.emit('disconnected');
    };
  }

  handleMessage(message) {
    const { type, ...data } = message;
    this.emit(type, data);
    this.emit('message', message);
  }

  send(type, data = {}) {
    if (!this.connected || !this.ws) {
      throw new Error('WebSocket not connected');
    }
    this.ws.send(JSON.stringify({ type, ...data }));
  }

  on(event, handler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event).push(handler);
  }

  off(event, handler) {
    if (!this.handlers.has(event)) return;
    const handlers = this.handlers.get(event);
    const index = handlers.indexOf(handler);
    if (index > -1) handlers.splice(index, 1);
  }

  emit(event, data) {
    if (!this.handlers.has(event)) return;
    this.handlers.get(event).forEach(handler => {
      try {
        handler(data);
      } catch (e) {
        console.error(`Error in ${event} handler:`, e);
      }
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}
