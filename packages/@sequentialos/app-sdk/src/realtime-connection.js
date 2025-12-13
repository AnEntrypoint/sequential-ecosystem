import RealtimeClient from '@sequentialos/realtime-sync';

export class RealtimeConnection extends RealtimeClient {
  constructor(wsUrl, roomId, options = {}) {
    const baseUrl = new URL(wsUrl).origin;
    const appId = options.appId || roomId;
    super(appId, baseUrl);
    this.roomId = roomId;
    this.userId = options.userId;
  }
}
