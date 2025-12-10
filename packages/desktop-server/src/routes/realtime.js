import { formatResponse } from 'response-formatting';

const rooms = new Map();
const connections = new Map();

export function registerRealtimeRoutes(app, wss) {
  app.get('/api/realtime/rooms', (req, res) => {
    const roomList = Array.from(rooms.entries()).map(([id, data]) => ({
      id,
      users: data.users.size,
      createdAt: data.createdAt
    }));
    res.json(formatResponse({ rooms: roomList }));
  });

  app.post('/api/realtime/rooms/:roomId/message', (req, res) => {
    const { roomId } = req.params;
    const { message, userId } = req.body;

    if (!message) {
      return res.status(400).json(formatResponse({ error: 'message required' }));
    }

    const room = rooms.get(roomId);
    if (!room) {
      return res.status(404).json(formatResponse({ error: 'room not found' }));
    }

    const msg = {
      id: Date.now().toString(),
      roomId,
      userId: userId || 'anonymous',
      message,
      timestamp: new Date().toISOString()
    };

    room.messages.push(msg);
    broadcastToRoom(roomId, { type: 'message', data: msg });

    res.json(formatResponse({ success: true, message: msg }));
  });
}

export function setupRealtimeWebSocket(wss) {
  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const roomId = url.searchParams.get('roomId') || 'default';
    const clientId = Date.now().toString() + Math.random().toString(36).substr(2);

    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        id: roomId,
        users: new Map(),
        messages: [],
        createdAt: new Date().toISOString()
      });
    }

    const room = rooms.get(roomId);
    room.users.set(clientId, { clientId, userId: null, appId: null });
    connections.set(clientId, { ws, roomId });

    ws.send(JSON.stringify({
      type: 'connected',
      clientId,
      roomId,
      users: Array.from(room.users.values())
    }));

    broadcastToRoom(roomId, {
      type: 'user_joined',
      clientId,
      users: Array.from(room.users.values())
    }, clientId);

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        handleRealtimeMessage(clientId, roomId, message);
      } catch (e) {
        console.error('Failed to parse message:', e);
      }
    });

    ws.on('close', () => {
      const room = rooms.get(roomId);
      if (room) {
        room.users.delete(clientId);
        broadcastToRoom(roomId, {
          type: 'user_left',
          clientId,
          users: Array.from(room.users.values())
        });

        if (room.users.size === 0) {
          rooms.delete(roomId);
        }
      }
      connections.delete(clientId);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
}

function handleRealtimeMessage(clientId, roomId, message) {
  const { type, data = {} } = message;
  const room = rooms.get(roomId);
  if (!room) return;

  const user = room.users.get(clientId);

  if (type === 'auth') {
    if (user) {
      user.userId = data.userId;
      user.appId = data.appId;
      broadcastToRoom(roomId, {
        type: 'user_updated',
        clientId,
        user
      });
    }
  } else if (type === 'message') {
    const msg = {
      id: Date.now().toString(),
      clientId,
      userId: user?.userId,
      content: data.content || '',
      timestamp: new Date().toISOString()
    };
    room.messages.push(msg);
    broadcastToRoom(roomId, {
      type: 'message',
      data: msg
    });
  } else if (type === 'custom') {
    broadcastToRoom(roomId, {
      type: 'custom_event',
      clientId,
      data
    });
  }
}

function broadcastToRoom(roomId, message, excludeClientId = null) {
  const room = rooms.get(roomId);
  if (!room) return;

  const payload = JSON.stringify(message);
  for (const [clientId, user] of room.users.entries()) {
    if (clientId === excludeClientId) continue;
    const conn = connections.get(clientId);
    if (conn && conn.ws.readyState === 1) {
      conn.ws.send(payload);
    }
  }
}
