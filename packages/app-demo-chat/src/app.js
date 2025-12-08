import { AppSDK } from '@sequential/app-sdk';

class DemoChat {
  constructor() {
    this.sdk = AppSDK.init('app-demo-chat');
    this.storage = this.createStorageManager();
    this.messages = [];
    this.status = 'Ready';
    this.inputValue = '';
    this.loadMessages();
  }

  createStorageManager() {
    const appId = 'app-demo-chat';
    const stateKey = `app-state:${appId}`;
    const expiryKey = `app-state-expiry:${appId}`;
    return {
      save: (state, ttlMs = null) => {
        try {
          localStorage.setItem(stateKey, JSON.stringify(state));
          if (ttlMs) {
            const expiryTime = Date.now() + ttlMs;
            localStorage.setItem(expiryKey, expiryTime.toString());
          }
        } catch (e) {
          console.error('[Storage] Failed to save:', e);
        }
      },
      load: () => {
        try {
          const expiryTime = localStorage.getItem(expiryKey);
          if (expiryTime && Date.now() > parseInt(expiryTime)) {
            this.clear();
            return null;
          }
          const stateStr = localStorage.getItem(stateKey);
          return stateStr ? JSON.parse(stateStr) : null;
        } catch (e) {
          console.error('[Storage] Failed to load:', e);
          return null;
        }
      },
      clear: () => {
        try {
          localStorage.removeItem(stateKey);
          localStorage.removeItem(expiryKey);
        } catch (e) {
          console.error('[Storage] Failed to clear:', e);
        }
      }
    };
  }

  loadMessages() {
    try {
      const stored = localStorage.getItem(`chat-messages:${this.sdk.appId}`);
      this.messages = stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Load failed:', e);
      this.messages = [];
    }
  }

  saveMessages() {
    try {
      localStorage.setItem(`chat-messages:${this.sdk.appId}`, JSON.stringify(this.messages));
    } catch (e) {
      console.error('Save failed:', e);
    }
  }

  setInputValue(value) {
    this.inputValue = value;
  }

  setStatus(text) {
    this.status = text;
  }

  async sendMessage() {
    const text = this.inputValue.trim();
    if (!text) return;

    const userMsg = { role: 'user', content: text, timestamp: new Date().toISOString() };
    this.messages.push(userMsg);
    this.inputValue = '';
    this.saveMessages();
    this.setStatus('Getting AI response...');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const responses = [
        'That\'s a great point! Let me think about that.',
        'I understand what you\'re saying. Here\'s my take on it.',
        'Thanks for sharing. That\'s definitely interesting.',
        'I appreciate that question. Let me explain.'
      ];

      const assistantMsg = {
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toISOString()
      };
      this.messages.push(assistantMsg);

      this.saveMessages();
      this.setStatus('Connected to chat');
    } catch (error) {
      const errorMsg = {
        role: 'assistant',
        content: 'Error: ' + error.message,
        timestamp: new Date().toISOString()
      };
      this.messages.push(errorMsg);
      this.saveMessages();
      this.setStatus('Error: ' + error.message);
    }
  }

  buildMessageItem(msg) {
    const isUser = msg.role === 'user';
    return {
      type: 'box',
      style: {
        background: isUser ? '#007acc' : '#e0e0e0',
        color: isUser ? 'white' : '#333',
        marginLeft: isUser ? '20%' : '0',
        marginRight: isUser ? '0' : '20%',
        marginBottom: '12px',
        padding: '8px 12px',
        borderRadius: '4px'
      },
      children: [
        {
          type: 'paragraph',
          content: `${isUser ? 'You' : 'AI'}: ${msg.content}`,
          style: { margin: 0, fontSize: '14px' }
        }
      ]
    };
  }

  buildUI() {
    return {
      type: 'flex',
      direction: 'column',
      style: {
        height: '100vh',
        background: '#f5f5f5',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: 'hidden'
      },
      children: [
        {
          type: 'box',
          style: {
            background: '#007acc',
            color: 'white',
            padding: '16px'
          },
          children: [
            { type: 'heading', content: '💬 Demo Chat App', level: 1, style: { margin: 0, fontSize: '20px', fontWeight: '700' } },
            { type: 'paragraph', content: 'Demonstrates AppSDK capabilities', style: { margin: '4px 0 0 0', fontSize: '12px', opacity: 0.9 } }
          ]
        },
        {
          type: 'flex',
          direction: 'column',
          style: {
            flex: 1,
            overflowY: 'auto',
            padding: '16px'
          },
          children: this.messages.length > 0
            ? this.messages.map(msg => this.buildMessageItem(msg))
            : [
              {
                type: 'paragraph',
                content: 'No messages yet. Start by typing a message below!',
                style: { color: '#999', textAlign: 'center', marginTop: '20px', fontSize: '14px' }
              }
            ]
        },
        {
          type: 'box',
          style: {
            padding: '16px',
            borderTop: '1px solid #ddd',
            background: 'white'
          },
          children: [
            {
              type: 'flex',
              gap: '8px',
              children: [
                {
                  type: 'input',
                  value: this.inputValue,
                  placeholder: 'Type a message...',
                  style: {
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  },
                  onChange: (e) => this.setInputValue(e.target.value),
                  onKeyPress: (e) => { if (e.key === 'Enter') this.sendMessage(); }
                },
                {
                  type: 'button',
                  label: 'Send',
                  style: {
                    padding: '8px 16px',
                    background: '#007acc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  },
                  onClick: () => this.sendMessage()
                }
              ]
            }
          ]
        },
        {
          type: 'box',
          style: {
            padding: '8px 12px',
            background: '#f0f0f0',
            borderTop: '1px solid #ddd',
            fontSize: '12px',
            color: '#666'
          },
          children: [{ type: 'paragraph', content: this.status, style: { margin: 0 } }]
        }
      ]
    };
  }

  render() {
    return this.buildUI();
  }
}

const chat = new DemoChat();

export { chat };
export default chat;
