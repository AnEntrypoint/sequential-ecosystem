export function setupBroadcastMiddleware(stateManager, broadcaster) {
  if (!broadcaster) {
    console.warn('setupBroadcastMiddleware: No broadcaster provided, change events will not be broadcast');
    return;
  }

  const broadcast = (channel, type, data) => {
    if (broadcaster.broadcast) {
      broadcaster.broadcast(channel, type, data);
    } else if (typeof broadcaster === 'function') {
      broadcaster(channel, type, data);
    }
  };

  stateManager.on('created', (event) => {
    const { type, id, data, timestamp } = event;
    broadcast(`data:${type}`, 'created', {
      id,
      data,
      timestamp
    });
  });

  stateManager.on('updated', (event) => {
    const { type, id, data, oldData, timestamp } = event;
    broadcast(`data:${type}`, 'updated', {
      id,
      data,
      changes: computeChanges(oldData, data),
      timestamp
    });
  });

  stateManager.on('deleted', (event) => {
    const { type, id, data, timestamp } = event;
    broadcast(`data:${type}`, 'deleted', {
      id,
      data,
      timestamp
    });
  });
}

function computeChanges(oldData, newData) {
  const changes = {};
  if (!oldData) return changes;

  for (const key in newData) {
    if (JSON.stringify(newData[key]) !== JSON.stringify(oldData[key])) {
      changes[key] = {
        old: oldData[key],
        new: newData[key]
      };
    }
  }

  for (const key in oldData) {
    if (!(key in newData)) {
      changes[key] = {
        old: oldData[key],
        new: undefined
      };
    }
  }

  return changes;
}
