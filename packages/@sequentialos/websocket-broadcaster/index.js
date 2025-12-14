const broadcastChannels = new Map();

export function broadcastToRunSubscribers(runId, data) {
  const channel = `run:${runId}`;
  if (broadcastChannels.has(channel)) {
    broadcastChannels.get(channel).forEach(cb => cb(data));
  }
}

export function broadcastToTaskSubscribers(taskId, data) {
  const channel = `task:${taskId}`;
  if (broadcastChannels.has(channel)) {
    broadcastChannels.get(channel).forEach(cb => cb(data));
  }
}

export function broadcastTaskProgress(taskId, progress, data = {}) {
  const channel = `task:${taskId}:progress`;
  if (broadcastChannels.has(channel)) {
    broadcastChannels.get(channel).forEach(cb => cb({ progress, ...data }));
  }
}

export function subscribe(channel, callback) {
  if (!broadcastChannels.has(channel)) {
    broadcastChannels.set(channel, new Set());
  }
  broadcastChannels.get(channel).add(callback);

  return () => {
    broadcastChannels.get(channel).delete(callback);
    if (broadcastChannels.get(channel).size === 0) {
      broadcastChannels.delete(channel);
    }
  };
}

export function broadcast(channel, data) {
  if (broadcastChannels.has(channel)) {
    broadcastChannels.get(channel).forEach(cb => cb(data));
  }
}

export default {
  broadcastToRunSubscribers,
  broadcastToTaskSubscribers,
  broadcastTaskProgress,
  subscribe,
  broadcast
};
