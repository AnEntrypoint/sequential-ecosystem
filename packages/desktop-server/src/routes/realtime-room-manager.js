/**
 * realtime-room-manager.js - Room management for realtime communication
 *
 * Manage rooms, users, and room lifecycle
 */

export class RealtimeRoomManager {
  constructor() {
    this.rooms = new Map();
  }

  getOrCreateRoom(roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        id: roomId,
        users: new Map(),
        messages: [],
        createdAt: new Date().toISOString()
      });
    }
    return this.rooms.get(roomId);
  }

  addUserToRoom(roomId, clientId, userId = null, appId = null) {
    const room = this.getOrCreateRoom(roomId);
    room.users.set(clientId, { clientId, userId, appId });
    return room;
  }

  removeUserFromRoom(roomId, clientId) {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    room.users.delete(clientId);
    
    if (room.users.size === 0) {
      this.rooms.delete(roomId);
    }
    
    return true;
  }

  updateUser(roomId, clientId, updates) {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const user = room.users.get(clientId);
    if (!user) return false;

    Object.assign(user, updates);
    return true;
  }

  addMessageToRoom(roomId, message) {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    room.messages.push(message);
    return true;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  getRoomList() {
    return Array.from(this.rooms.entries()).map(([id, data]) => ({
      id,
      users: data.users.size,
      createdAt: data.createdAt
    }));
  }

  getUsersInRoom(roomId) {
    const room = this.rooms.get(roomId);
    return room ? Array.from(room.users.values()) : [];
  }

  clear() {
    this.rooms.clear();
  }
}
