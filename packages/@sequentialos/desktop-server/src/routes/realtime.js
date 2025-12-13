import { formatResponse } from '@sequentialos/response-formatting';
import { RealtimeRoomManager } from './realtime-room-manager.js';
import { RealtimeMessageHandler, RealtimeBroadcaster } from './realtime-message-handler.js';

const roomManager = new RealtimeRoomManager();
const connections = new Map();

export function registerRealtimeRoutes(app, wss) {
  app.get('/api/realtime/rooms', (req, res) => {
    const roomList = roomManager.getRoomList();
    res.json(formatResponse({ rooms: roomList }));
  });

  app.post('/api/realtime/rooms/:roomId/message', (req, res) => {
    const { roomId } = req.params;
    const { message, userId } = req.body;

    if (!message) {
      return res.status(400).json(formatResponse({ error: 'message required' }));
    }

    const room = roomManager.getRoom(roomId);
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

    roomManager.addMessageToRoom(roomId, msg);
    broadcastToRoom(roomId, { type: 'message', data: msg });

    res.json(formatResponse({ success: true, message: msg }));
  });
}

const broadcaster = new RealtimeBroadcaster(connections);
const messageHandler = new RealtimeMessageHandler(roomManager, broadcaster);

function generateClientId() {
  return Date.now().toString() + Math.random().toString(36).substr(2);
}

function broadcastToRoom(roomId, message, excludeClientId = null) {
  return broadcaster.broadcastToRoom(roomId, message, roomManager, excludeClientId);
}

export function setupRealtimeWebSocket(wss) {
  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const roomId = url.searchParams.get('roomId') || 'default';
    const clientId = generateClientId();

    const room = roomManager.addUserToRoom(roomId, clientId, null, null);
    connections.set(clientId, { ws, roomId });

    ws.send(JSON.stringify({
      type: 'connected',
      clientId,
      roomId,
      users: roomManager.getUsersInRoom(roomId)
    }));

    broadcastToRoom(roomId, {
      type: 'user_joined',
      clientId,
      users: roomManager.getUsersInRoom(roomId)
    }, clientId);

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        messageHandler.handleMessage(clientId, roomId, message);
      } catch (e) {
        console.error('Failed to parse message:', e);
      }
    });

    ws.on('close', () => {
      roomManager.removeUserFromRoom(roomId, clientId);
      broadcastToRoom(roomId, {
        type: 'user_left',
        clientId,
        users: roomManager.getUsersInRoom(roomId)
      });
      connections.delete(clientId);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
}
