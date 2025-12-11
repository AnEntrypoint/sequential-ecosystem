/**
 * realtime-operations.js
 *
 * Real-time connection operations (connect, joinRoom)
 */

import { RealtimeConnection } from './realtime-connection.js';

export function createRealtimeOperations(wsUrl, userId, appId) {
  return {
    connect(roomId, options = {}) {
      return new RealtimeConnection(wsUrl, roomId, {
        userId,
        appId,
        ...options
      });
    },

    joinRoom(roomId, options = {}) {
      const conn = new RealtimeConnection(wsUrl, roomId, {
        userId,
        appId,
        autoConnect: false,
        ...options
      });
      conn.connect();
      return conn;
    }
  };
}
