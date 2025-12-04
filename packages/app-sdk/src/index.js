export class AppSDK {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'http://localhost:8003';
    this.appId = options.appId;
    this.userId = options.userId;
    this.sessionToken = options.sessionToken;
    this.wsUrl = options.wsUrl || 'ws://localhost:8003';
  }

  async storage(action, ...args) {
    if (!this.appId) throw new Error('appId required for storage operations');

    const [key, value, scope = 'app'] = args;
    const path = `${scope}/${this.appId}/${key}`;

    if (action === 'get') {
      const res = await fetch(`${this.baseUrl}/api/storage/${path}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.value;
    }

    if (action === 'set') {
      const res = await fetch(`${this.baseUrl}/api/storage/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value })
      });
      return res.ok;
    }

    if (action === 'delete') {
      const res = await fetch(`${this.baseUrl}/api/storage/${path}`, { method: 'DELETE' });
      return res.ok;
    }
  }

  realtime(action, ...args) {
    const [roomId, options = {}] = args;

    if (action === 'connect') {
      return new RealtimeConnection(this.wsUrl, roomId, {
        userId: this.userId,
        appId: this.appId,
        ...options
      });
    }

    if (action === 'joinRoom') {
      const conn = new RealtimeConnection(this.wsUrl, roomId, {
        userId: this.userId,
        appId: this.appId,
        autoConnect: false,
        ...options
      });
      conn.connect();
      return conn;
    }
  }

  async llm(prompt, options = {}) {
    const body = {
      prompt,
      model: options.model || 'claude-3-5-sonnet-20241022',
      maxTokens: options.maxTokens || 1024,
      temperature: options.temperature || 0.7,
      system: options.system,
      tools: options.tools || [],
      toolChoice: options.toolChoice,
      context: { appId: this.appId, userId: this.userId }
    };

    const res = await fetch(`${this.baseUrl}/api/llm/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) throw new Error(`LLM request failed: ${res.statusText}`);
    return await res.json();
  }

  async tools(action, ...args) {
    const [toolName, input = {}] = args;

    if (action === 'invoke') {
      const res = await fetch(`${this.baseUrl}/api/tools/${toolName}/invoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, context: { appId: this.appId, userId: this.userId } })
      });
      if (!res.ok) throw new Error(`Tool invocation failed: ${res.statusText}`);
      return await res.json();
    }

    if (action === 'list') {
      const res = await fetch(`${this.baseUrl}/api/tools`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.tools || [];
    }

    if (action === 'get') {
      const res = await fetch(`${this.baseUrl}/api/tools/${toolName}`);
      if (!res.ok) return null;
      return await res.json();
    }
  }

  async user() {
    if (!this.sessionToken) return null;
    const res = await fetch(`${this.baseUrl}/api/user`, {
      headers: { 'Authorization': `Bearer ${this.sessionToken}` }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || data;
  }

  async tasks(action, ...args) {
    const [taskName, input] = args;

    if (action === 'run') {
      const res = await fetch(`${this.baseUrl}/api/tasks/${taskName}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input })
      });
      if (!res.ok) throw new Error(`Task execution failed: ${res.statusText}`);
      return await res.json();
    }

    if (action === 'list') {
      const res = await fetch(`${this.baseUrl}/api/tasks`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.tasks || [];
    }
  }

  static initialize(config = {}) {
    return new AppSDK({
      baseUrl: config.baseUrl || window.location.origin,
      appId: config.appId || window.__appId,
      userId: config.userId || window.__userId,
      sessionToken: config.sessionToken || window.__sessionToken,
      wsUrl: config.wsUrl || (window.location.protocol === 'https:' ? 'wss:' : 'ws:') + '//' + window.location.host
    });
  }
}

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

export default AppSDK;