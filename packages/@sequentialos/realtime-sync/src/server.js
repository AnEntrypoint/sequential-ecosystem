const subscriptions = new Map();
const channels = new Map();

export class RealtimeBroadcaster {
  static broadcast(channel, type, data) {
    const msg = { channel, type, data, timestamp: Date.now() };
    const subs = subscriptions.get(channel);
    if (!subs) return;
    const snapshot = Array.from(subs);
    snapshot.forEach(ws => {
      if (ws.readyState === 1) {
        ws.send(JSON.stringify(msg));
      }
    });
  }

  static subscribe(channel, ws) {
    if (!subscriptions.has(channel)) {
      subscriptions.set(channel, new Set());
    }
    subscriptions.get(channel).add(ws);
    if (!channels.has(channel)) {
      channels.set(channel, { created: Date.now(), subscribers: 0 });
    }
    channels.get(channel).subscribers++;
  }

  static unsubscribe(channel, ws) {
    const subs = subscriptions.get(channel);
    if (subs) {
      subs.delete(ws);
      const meta = channels.get(channel);
      if (meta) meta.subscribers--;
      if (subs.size === 0) {
        subscriptions.delete(channel);
        channels.delete(channel);
      }
    }
  }

  static getStats() {
    return {
      channels: channels.size,
      activeSubscriptions: Array.from(subscriptions.values())
        .reduce((sum, subs) => sum + subs.size, 0),
      channelDetails: Array.from(channels.entries()).map(([name, meta]) => ({
        name,
        subscribers: meta.subscribers,
        uptime: Date.now() - meta.created
      }))
    };
  }
}

export function setupRealtimeWebSocket(server) {
  server.on('upgrade', (req, socket, head) => {
    if (!req.url.startsWith('/ws/realtime/')) return;

    const appId = req.url.split('/ws/realtime/')[1];
    const ws = new (require('ws')).WebSocket(req, socket, head);

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data);
        const { channel, action } = msg;

        if (action === 'subscribe') {
          RealtimeBroadcaster.subscribe(channel, ws);
        } else if (action === 'unsubscribe') {
          RealtimeBroadcaster.unsubscribe(channel, ws);
        } else if (msg.direction === 'out') {
          RealtimeBroadcaster.broadcast(channel, msg.type, msg.data);
        }
      } catch (e) {
        console.error('Realtime message error:', e);
      }
    });

    ws.on('close', () => {
      subscriptions.forEach((subs) => {
        subs.delete(ws);
      });
    });
  });
}

export default RealtimeBroadcaster;
