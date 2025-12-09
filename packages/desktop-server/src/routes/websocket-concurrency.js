export class WebSocketConcurrencyValidator {
  constructor() {
    this.testResults = [];
  }

  async validateSequentialMessageDelivery(broadcaster, mockWebSocketClass) {
    const subs = Array.from({ length: 10 }, (_, i) => new mockWebSocketClass(`sub-${i}`));
    subs.forEach(ws => broadcaster.subscribe('channel1', ws));

    for (let i = 0; i < 100; i++) {
      broadcaster.broadcast('channel1', 'message', { id: i });
    }

    const allCorrect = subs.every(ws =>
      ws.messages.length === 100 &&
      ws.messages.every((msg, idx) => msg.data.id === idx)
    );

    return {
      name: 'Sequential Message Delivery',
      passed: allCorrect,
      details: { subscriberCount: 10, messageCount: 100, allInOrder: allCorrect }
    };
  }

  async validateConcurrentSubscribeUnsub(broadcaster, mockWebSocketClass) {
    const ws1 = new mockWebSocketClass('ws1');
    const ws2 = new mockWebSocketClass('ws2');
    const ws3 = new mockWebSocketClass('ws3');

    for (let i = 0; i < 20; i++) {
      broadcaster.subscribe('channel1', ws1);
      broadcaster.subscribe('channel1', ws2);
      broadcaster.broadcast('channel1', 'msg', { round: i });
      broadcaster.unsubscribe('channel1', ws1);
      broadcaster.unsubscribe('channel1', ws2);
    }

    const stats = broadcaster.getStats();
    return {
      name: 'Concurrent Subscribe/Unsubscribe',
      passed: stats.channels === 0,
      details: { cycles: 20, finalChannels: stats.channels }
    };
  }

  async validateBroadcastOrderingOverlapSubscribers(broadcaster, mockWebSocketClass) {
    const ws1 = new mockWebSocketClass('ws1');
    const ws2 = new mockWebSocketClass('ws2');
    const ws3 = new mockWebSocketClass('ws3');

    broadcaster.subscribe('ch1', ws1);
    broadcaster.subscribe('ch2', ws1);
    broadcaster.subscribe('ch2', ws2);
    broadcaster.subscribe('ch3', ws2);
    broadcaster.subscribe('ch3', ws3);

    for (let i = 0; i < 10; i++) {
      broadcaster.broadcast('ch1', 'msg', { ch: 'ch1', seq: i });
      broadcaster.broadcast('ch2', 'msg', { ch: 'ch2', seq: i });
      broadcaster.broadcast('ch3', 'msg', { ch: 'ch3', seq: i });
    }

    return {
      name: 'Broadcast Ordering - Overlapping Subscribers',
      passed: ws1.messages.length === 20 && ws2.messages.length === 20 && ws3.messages.length === 10,
      details: { ws1: ws1.messages.length, ws2: ws2.messages.length, ws3: ws3.messages.length }
    };
  }

  async validateHighFrequencyMessageDelivery(broadcaster, mockWebSocketClass) {
    const subs = Array.from({ length: 5 }, (_, i) => new mockWebSocketClass(`sub-${i}`));
    subs.forEach(ws => broadcaster.subscribe('fast-channel', ws));

    const messageCount = 10000;
    for (let i = 0; i < messageCount; i++) {
      broadcaster.broadcast('fast-channel', 'msg', { id: i });
    }

    const allReceived = subs.every(ws => ws.messages.length === messageCount);
    return {
      name: 'High Frequency Message Delivery',
      passed: allReceived,
      details: { subscribers: 5, messagesPerSub: messageCount, allReceived }
    };
  }

  async validateConnectionCloseDuringBroadcast(broadcaster, mockWebSocketClass) {
    const subs = Array.from({ length: 10 }, (_, i) => new mockWebSocketClass(`sub-${i}`));
    subs.forEach(ws => broadcaster.subscribe('channel1', ws));

    subs[2].close();
    subs[5].close();
    subs[8].close();

    broadcaster.broadcast('channel1', 'msg', { data: 'test' });

    const openSubs = subs.filter(ws => ws.readyState === 1);
    const allOpenReceived = openSubs.every(ws => ws.messages.length === 1);
    return {
      name: 'Connection Close During Broadcast',
      passed: allOpenReceived,
      details: { closed: 3, open: 7, allOpenReceived }
    };
  }

  async validateUnsubscribeMultipleChannels(broadcaster, mockWebSocketClass) {
    const ws = new mockWebSocketClass('ws1');

    broadcaster.subscribe('ch1', ws);
    broadcaster.subscribe('ch2', ws);
    broadcaster.subscribe('ch3', ws);

    let channels = broadcaster.getStats().channels;
    if (channels !== 3) return { name: 'Unsubscribe Multiple Channels', passed: false, details: { error: 'Initial channels mismatch' } };

    broadcaster.unsubscribe('ch1', ws);
    channels = broadcaster.getStats().channels;
    if (channels !== 2) return { name: 'Unsubscribe Multiple Channels', passed: false, details: { error: 'After ch1 unsub mismatch' } };

    broadcaster.unsubscribe('ch2', ws);
    channels = broadcaster.getStats().channels;
    if (channels !== 1) return { name: 'Unsubscribe Multiple Channels', passed: false, details: { error: 'After ch2 unsub mismatch' } };

    broadcaster.unsubscribe('ch3', ws);
    channels = broadcaster.getStats().channels;

    return {
      name: 'Unsubscribe Multiple Channels',
      passed: channels === 0,
      details: { finalChannels: channels }
    };
  }

  async validateRapidBroadcastsSameChannel(broadcaster, mockWebSocketClass) {
    const subs = Array.from({ length: 3 }, (_, i) => new mockWebSocketClass(`sub-${i}`));
    subs.forEach(ws => broadcaster.subscribe('rapid', ws));

    const broadcasts = 1000;
    for (let i = 0; i < broadcasts; i++) {
      broadcaster.broadcast('rapid', 'event', { count: i });
    }

    const allReceived = subs.every(ws => ws.messages.length === broadcasts);
    return {
      name: 'Rapid Broadcasts Same Channel',
      passed: allReceived,
      details: { broadcasts, subscribers: 3, allReceived }
    };
  }

  async validateResubscribeAfterUnsubscribe(broadcaster, mockWebSocketClass) {
    const ws = new mockWebSocketClass('ws1');

    broadcaster.subscribe('channel', ws);
    broadcaster.broadcast('channel', 'msg', { seq: 1 });

    if (ws.messages.length !== 1) return { name: 'Resubscribe After Unsubscribe', passed: false };

    broadcaster.unsubscribe('channel', ws);
    broadcaster.broadcast('channel', 'msg', { seq: 2 });

    if (ws.messages.length !== 1) return { name: 'Resubscribe After Unsubscribe', passed: false };

    broadcaster.subscribe('channel', ws);
    broadcaster.broadcast('channel', 'msg', { seq: 3 });

    return {
      name: 'Resubscribe After Unsubscribe',
      passed: ws.messages.length === 2,
      details: { finalMessages: ws.messages.length }
    };
  }

  async validateStatsAccuracyConcurrent(broadcaster, mockWebSocketClass) {
    const subs = Array.from({ length: 20 }, (_, i) => new mockWebSocketClass(`sub-${i}`));
    const channels = ['ch1', 'ch2', 'ch3', 'ch4', 'ch5'];

    subs.forEach(ws => {
      channels.forEach(ch => broadcaster.subscribe(ch, ws));
    });

    let stats = broadcaster.getStats();
    if (stats.channels !== 5 || stats.activeSubscriptions !== 100) {
      return { name: 'Stats Accuracy Concurrent', passed: false, details: { error: 'Initial stats mismatch' } };
    }

    for (let i = 0; i < 10; i++) {
      channels.forEach(ch => broadcaster.unsubscribe(ch, subs[i]));
    }

    stats = broadcaster.getStats();
    return {
      name: 'Stats Accuracy Concurrent',
      passed: stats.channels === 5 && stats.activeSubscriptions === 50,
      details: { channels: stats.channels, subscriptions: stats.activeSubscriptions }
    };
  }

  async validateBroadcastNonexistentChannel(broadcaster, mockWebSocketClass) {
    broadcaster.broadcast('non-existent', 'msg', { data: 'test' });

    const stats = broadcaster.getStats();
    return {
      name: 'Broadcast Non-existent Channel',
      passed: stats.channels === 0,
      details: { channels: stats.channels }
    };
  }

  async validateMessageTypeTimestampPreservation(broadcaster, mockWebSocketClass) {
    const ws = new mockWebSocketClass('ws1');
    broadcaster.subscribe('channel', ws);

    const beforeTime = Date.now();
    broadcaster.broadcast('channel', 'custom-type', { key: 'value' });
    const afterTime = Date.now();

    if (ws.messages.length !== 1) return { name: 'Message Type/Timestamp Preservation', passed: false };

    const msg = ws.messages[0];
    const typeCorrect = msg.type === 'custom-type';
    const dataCorrect = msg.data.key === 'value';
    const timestampCorrect = msg.timestamp >= beforeTime && msg.timestamp <= afterTime;

    return {
      name: 'Message Type/Timestamp Preservation',
      passed: typeCorrect && dataCorrect && timestampCorrect,
      details: { typeCorrect, dataCorrect, timestampCorrect }
    };
  }

  async validateLargeDataPayload(broadcaster, mockWebSocketClass) {
    const subs = Array.from({ length: 3 }, (_, i) => new mockWebSocketClass(`sub-${i}`));
    subs.forEach(ws => broadcaster.subscribe('channel', ws));

    const largeData = {
      payload: 'x'.repeat(10000),
      nested: { data: 'y'.repeat(5000) }
    };

    broadcaster.broadcast('channel', 'large', largeData);

    const allCorrect = subs.every(ws =>
      ws.messages.length === 1 &&
      ws.messages[0].data.payload.length === 10000 &&
      ws.messages[0].data.nested.data.length === 5000
    );

    return {
      name: 'Large Data Payload',
      passed: allCorrect,
      details: { subscribers: 3, payloadSize: 10000, nestedSize: 5000, allCorrect }
    };
  }

  async runAllTests(broadcaster, mockWebSocketClass) {
    broadcaster.reset?.();

    const tests = [
      () => this.validateSequentialMessageDelivery(broadcaster, mockWebSocketClass),
      () => this.validateConcurrentSubscribeUnsub(broadcaster, mockWebSocketClass),
      () => { broadcaster.reset?.(); return this.validateBroadcastOrderingOverlapSubscribers(broadcaster, mockWebSocketClass); },
      () => { broadcaster.reset?.(); return this.validateHighFrequencyMessageDelivery(broadcaster, mockWebSocketClass); },
      () => { broadcaster.reset?.(); return this.validateConnectionCloseDuringBroadcast(broadcaster, mockWebSocketClass); },
      () => { broadcaster.reset?.(); return this.validateUnsubscribeMultipleChannels(broadcaster, mockWebSocketClass); },
      () => { broadcaster.reset?.(); return this.validateRapidBroadcastsSameChannel(broadcaster, mockWebSocketClass); },
      () => { broadcaster.reset?.(); return this.validateResubscribeAfterUnsubscribe(broadcaster, mockWebSocketClass); },
      () => { broadcaster.reset?.(); return this.validateStatsAccuracyConcurrent(broadcaster, mockWebSocketClass); },
      () => { broadcaster.reset?.(); return this.validateBroadcastNonexistentChannel(broadcaster, mockWebSocketClass); },
      () => { broadcaster.reset?.(); return this.validateMessageTypeTimestampPreservation(broadcaster, mockWebSocketClass); },
      () => { broadcaster.reset?.(); return this.validateLargeDataPayload(broadcaster, mockWebSocketClass); }
    ];

    this.testResults = await Promise.all(tests.map(t => t()));
    return this.testResults;
  }

  getSummary() {
    const passed = this.testResults.filter(t => t.passed).length;
    const total = this.testResults.length;
    return {
      total,
      passed,
      failed: total - passed,
      percentage: Math.round((passed / total) * 100),
      tests: this.testResults
    };
  }
}

export function createWebSocketConcurrencyValidator() {
  return new WebSocketConcurrencyValidator();
}
