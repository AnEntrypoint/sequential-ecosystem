/**
 * realtime-message-handler.js - WebSocket message processing
 *
 * Handle different message types and broadcast logic
 */

export class RealtimeMessageHandler {
  constructor(roomManager, broadcaster) {
    this.roomManager = roomManager;
    this.broadcaster = broadcaster;
  }

  handleMessage(clientId, roomId, message) {
    const { type, data = {} } = message;
    const room = this.roomManager.getRoom(roomId);
    if (!room) return false;

    const user = room.users.get(clientId);

    if (type === 'auth') {
      return this.handleAuth(clientId, roomId, user, data);
    } else if (type === 'message') {
      return this.handleChatMessage(clientId, roomId, user, data);
    } else if (type === 'custom') {
      return this.handleCustomEvent(clientId, roomId, data);
    }

    return false;
  }

  handleAuth(clientId, roomId, user, data) {
    if (!user) return false;

    user.userId = data.userId;
    user.appId = data.appId;

    this.broadcaster.broadcastToRoom(roomId, {
      type: 'user_updated',
      clientId,
      user
    });

    return true;
  }

  handleChatMessage(clientId, roomId, user, data) {
    const msg = {
      id: Date.now().toString(),
      clientId,
      userId: user?.userId,
      content: data.content || '',
      timestamp: new Date().toISOString()
    };

    this.roomManager.addMessageToRoom(roomId, msg);
    this.broadcaster.broadcastToRoom(roomId, {
      type: 'message',
      data: msg
    });

    return true;
  }

  handleCustomEvent(clientId, roomId, data) {
    this.broadcaster.broadcastToRoom(roomId, {
      type: 'custom_event',
      clientId,
      data
    });

    return true;
  }
}

export class RealtimeBroadcaster {
  constructor(connections) {
    this.connections = connections;
  }

  broadcastToRoom(roomId, message, roomManager, excludeClientId = null) {
    const room = roomManager.getRoom(roomId);
    if (!room) return false;

    const payload = JSON.stringify(message);
    for (const [clientId, user] of room.users.entries()) {
      if (clientId === excludeClientId) continue;
      const conn = this.connections.get(clientId);
      if (conn && conn.ws.readyState === 1) {
        conn.ws.send(payload);
      }
    }

    return true;
  }
}
