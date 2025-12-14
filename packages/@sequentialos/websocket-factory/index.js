export function createWebSocketManager() {
  return {
    clients: new Set(),
    broadcast(data) { this.clients.forEach(c => c.send(JSON.stringify(data))); },
    subscribe(client) { this.clients.add(client); },
    unsubscribe(client) { this.clients.delete(client); }
  };
}
export default { createWebSocketManager };
