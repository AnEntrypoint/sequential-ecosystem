import { RealtimeConnection } from './realtime-connection.js';
import { ToolRegistry } from './tool-registration.js';

export class AppSDK {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'http://localhost:8003';
    this.appId = options.appId;
    this.userId = options.userId;
    this.sessionToken = options.sessionToken;
    this.wsUrl = options.wsUrl || 'ws://localhost:8003';
    this.tools = new ToolRegistry(this.baseUrl);
    this.autoRegister = options.autoRegister !== false;
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

  tool(name, fn, description = '', options = {}) {
    this.tools.register(name, fn, description, options);
    if (this.autoRegister) {
      this.tools.remote(name, fn, description, options).catch(err => {
        console.warn(`Failed to register tool "${name}":`, err.message);
      });
    }
    return this;
  }

  async initTools() {
    return await this.tools.initAll();
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

export { RealtimeConnection };
export default AppSDK;