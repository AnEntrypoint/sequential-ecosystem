class AppSDK {
  static instance = null;
  static init(appId) {
    if (!AppSDK.instance) {
      AppSDK.instance = new AppSDK(appId);
    }
    return AppSDK.instance;
  }

  constructor(appId) {
    this.appId = appId;
    this.data = new Map();
    this.tools = new Map();
    this.listeners = new Map();
  }

  setData(key, value) {
    this.data.set(key, value);
    this.emit('data:changed', { key, value });
    return this;
  }

  getData(key) {
    return this.data.get(key);
  }

  clearData(key) {
    this.data.delete(key);
    this.emit('data:cleared', { key });
    return this;
  }

  getAllData() {
    return Object.fromEntries(this.data);
  }

  tool(name, fn, description = '') {
    this.tools.set(name, { name, fn, description, params: this.extractParams(fn) });
    return this;
  }

  getTool(name) {
    return this.tools.get(name);
  }

  getTools() {
    return Array.from(this.tools.values());
  }

  async callTool(name, input) {
    const tool = this.getTool(name);
    if (!tool) throw new Error(`Tool not found: ${name}`);
    return await tool.fn(input);
  }

  async callTask(taskName, input) {
    try {
      const response = await fetch(`/api/tasks/${taskName}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });
      const data = await response.json();
      return data.success ? data.data : { error: data.error };
    } catch (err) {
      return { error: err.message };
    }
  }

  async callFlow(flowId, input) {
    try {
      const response = await fetch(`/api/flows/${flowId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });
      const data = await response.json();
      return data.success ? data.data : { error: data.error };
    } catch (err) {
      return { error: err.message };
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return this;
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const idx = callbacks.indexOf(callback);
      if (idx > -1) callbacks.splice(idx, 1);
    }
    return this;
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => cb(data));
    }
  }

  extractParams(fn) {
    const fnStr = fn.toString();
    const match = fnStr.match(/\(([^)]*)\)/);
    if (!match) return [];
    return match[1]
      .split(',')
      .map(p => p.trim())
      .filter(p => p && !p.startsWith('/'));
  }

  getMCPDefinition() {
    const tools = this.getTools().map(t => ({
      name: t.name,
      description: t.description,
      inputSchema: {
        type: 'object',
        properties: t.params.reduce((acc, p) => ({
          ...acc,
          [p]: { type: 'string' }
        }), {})
      }
    }));
    return { resources: [], tools };
  }

  async initStorage() {
    this.emit('storage:connecting');
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        this.emit('storage:connected');
        return { success: true };
      }
    } catch (err) {
      this.emit('storage:error', err);
    }
    return { success: false };
  }

  async initRealtime() {
    try {
      this.ws = new WebSocket(`ws://${window.location.host}/ws/realtime/${this.appId}`);
      this.ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        this.emit('realtime:message', msg);
      };
      this.ws.onerror = (err) => this.emit('realtime:error', err);
      this.ws.onclose = () => this.emit('realtime:closed');
      return { success: true };
    } catch (err) {
      this.emit('realtime:error', err);
      return { success: false };
    }
  }

  subscribe(channel, callback) {
    this.on(`channel:${channel}`, callback);
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'subscribe', channel }));
    }
    return this;
  }

  broadcast(channel, type, data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'broadcast', channel, msgType: type, data }));
    }
    return this;
  }

  close() {
    if (this.ws) this.ws.close();
    this.data.clear();
    this.tools.clear();
    this.listeners.clear();
  }
}

export { AppSDK };
export default AppSDK;
