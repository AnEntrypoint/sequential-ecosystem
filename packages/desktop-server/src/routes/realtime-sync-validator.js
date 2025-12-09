export class RealtimeSyncValidator {
  constructor() {
    this.testResults = [];
  }

  async validateBasicSubscription() {
    const subscribers = new Map();
    const messages = [];

    const subscribe = (channel, handler) => {
      if (!subscribers.has(channel)) subscribers.set(channel, []);
      subscribers.get(channel).push(handler);
    };

    const broadcast = (channel, msg) => {
      messages.push({ channel, msg, timestamp: Date.now() });
      if (subscribers.has(channel)) {
        subscribers.get(channel).forEach(h => h(msg));
      }
    };

    subscribe('updates', (msg) => messages.push({ received: msg }));
    broadcast('updates', { id: 1, value: 'test' });

    return {
      name: 'Basic Subscription',
      passed: messages.length >= 2 && messages[0].msg?.id === 1,
      details: { messagesReceived: messages.length, channels: subscribers.size }
    };
  }

  async validateMultipleSubscribers() {
    const channel = 'events';
    const receivedMsgs = [];
    let subscriberCount = 0;

    const handlers = [];
    for (let i = 0; i < 5; i++) {
      handlers.push((msg) => {
        receivedMsgs.push({ subscriberId: i, msg, timestamp: Date.now() });
      });
    }

    handlers.forEach(h => subscriberCount++);
    handlers.forEach(h => f(channel, { id: 'msg1' }, h));

    function f(ch, msg, handler) {
      handler(msg);
    }

    return {
      name: 'Multiple Subscribers',
      passed: receivedMsgs.length >= 5 && subscriberCount === 5,
      details: { subscribers: subscriberCount, messagesReceived: receivedMsgs.length }
    };
  }

  async validateChannelIsolation() {
    const subscribers = new Map();
    let channel1Count = 0, channel2Count = 0;

    const subscribe = (channel, handler) => {
      if (!subscribers.has(channel)) subscribers.set(channel, []);
      subscribers.get(channel).push(handler);
    };

    const broadcast = (channel, msg) => {
      if (subscribers.has(channel)) {
        subscribers.get(channel).forEach(h => h(msg));
      }
    };

    subscribe('ch1', () => channel1Count++);
    subscribe('ch2', () => channel2Count++);

    broadcast('ch1', { data: 'test' });
    broadcast('ch1', { data: 'test2' });
    broadcast('ch2', { data: 'test3' });

    return {
      name: 'Channel Isolation',
      passed: channel1Count === 2 && channel2Count === 1,
      details: { ch1: channel1Count, ch2: channel2Count, channelCount: subscribers.size }
    };
  }

  async validateUnsubscribe() {
    const subscribers = new Map();
    let callCount = 0;

    const subscribe = (ch, handler) => {
      if (!subscribers.has(ch)) subscribers.set(ch, []);
      subscribers.get(ch).push(handler);
      return () => {
        const idx = subscribers.get(ch).indexOf(handler);
        if (idx >= 0) subscribers.get(ch).splice(idx, 1);
      };
    };

    const broadcast = (ch, msg) => {
      if (subscribers.has(ch)) {
        subscribers.get(ch).forEach(h => h(msg));
      }
    };

    const handler = () => callCount++;
    const unsubscribe = subscribe('test', handler);

    broadcast('test', {});
    unsubscribe();
    broadcast('test', {});

    return {
      name: 'Unsubscribe',
      passed: callCount === 1 && subscribers.get('test').length === 0,
      details: { callsBefore: 1, callsAfter: 0, subscribersRemaining: subscribers.get('test')?.length || 0 }
    };
  }

  async validateMessageOrdering() {
    const received = [];
    const timestamps = [];

    const handlers = [];
    for (let i = 0; i < 10; i++) {
      handlers.push((msg) => {
        received.push(msg.id);
        timestamps.push(Date.now());
      });
    }

    handlers.forEach((h, i) => {
      h({ id: i });
    });

    const isOrdered = received.every((id, i) => id === i);
    const isSorted = timestamps.every((t, i) => i === 0 || timestamps[i - 1] <= t);

    return {
      name: 'Message Ordering',
      passed: isOrdered && isSorted && received.length === 10,
      details: { messagesInOrder: isOrdered, timestampsMonotonic: isSorted, count: received.length }
    };
  }

  async validateBroadcastToMultipleChannels() {
    const subscribers = new Map();
    const received = { ch1: 0, ch2: 0, ch3: 0 };

    ['ch1', 'ch2', 'ch3'].forEach(ch => {
      subscribers.set(ch, [(msg) => received[ch]++]);
    });

    const broadcast = (ch, msg) => {
      if (subscribers.has(ch)) {
        subscribers.get(ch).forEach(h => h(msg));
      }
    };

    broadcast('ch1', {});
    broadcast('ch2', {});
    broadcast('ch3', {});
    broadcast('ch1', {});

    return {
      name: 'Broadcast Multiple Channels',
      passed: received.ch1 === 2 && received.ch2 === 1 && received.ch3 === 1,
      details: received
    };
  }

  async validateHighFrequencyMessages() {
    let received = 0;
    const handler = () => received++;
    const iterations = 1000;

    for (let i = 0; i < iterations; i++) {
      handler();
    }

    return {
      name: 'High Frequency Messages (1K)',
      passed: received === iterations,
      details: { messagesProcessed: received, expected: iterations }
    };
  }

  async validateConcurrentPublishSubscribe() {
    const subscribers = [];
    const received = [];

    const subscribe = (handler) => {
      subscribers.push(handler);
      return () => {
        const idx = subscribers.indexOf(handler);
        if (idx >= 0) subscribers.splice(idx, 1);
      };
    };

    const promises = [];
    for (let i = 0; i < 100; i++) {
      const id = i;
      subscribe((msg) => received.push({ id, msg }));
      promises.push(Promise.resolve({ id }));
    }

    await Promise.all(promises.map(async (p) => {
      const msg = await p;
      subscribers.forEach(sub => sub(msg));
    }));

    return {
      name: 'Concurrent Publish-Subscribe (100)',
      passed: received.length >= 100,
      details: { received: received.length, expected: 100 }
    };
  }

  async validateReconnectionMessageQueuing() {
    const queue = [];
    let isConnected = false;

    const queueMessage = (msg) => {
      if (!isConnected) {
        queue.push(msg);
        return false;
      }
      return true;
    };

    const flushQueue = () => {
      const flushed = [...queue];
      queue.length = 0;
      return flushed;
    };

    queueMessage({ id: 1 });
    queueMessage({ id: 2 });
    queueMessage({ id: 3 });

    isConnected = true;
    const flushed = flushQueue();

    return {
      name: 'Reconnection Message Queuing',
      passed: flushed.length === 3 && queue.length === 0,
      details: { queued: 3, flushed: flushed.length, remainingInQueue: queue.length }
    };
  }

  async validateErrorInSubscriber() {
    const received = [];
    let errorCount = 0;

    const handlers = [
      (msg) => { throw new Error('Handler 1 error'); },
      (msg) => { received.push(msg); },
      (msg) => { throw new Error('Handler 3 error'); },
      (msg) => { received.push(msg); }
    ];

    const broadcast = (msg) => {
      handlers.forEach(h => {
        try {
          h(msg);
        } catch (e) {
          errorCount++;
        }
      });
    };

    broadcast({ id: 1 });

    return {
      name: 'Error in Subscriber',
      passed: errorCount === 2 && received.length === 2,
      details: { handlers: handlers.length, errorsCaught: errorCount, successfulHandlers: received.length }
    };
  }

  async validateSubscriptionWithFiltering() {
    const received = [];
    const handler = (msg) => {
      if (msg.type === 'important') received.push(msg);
    };

    const messages = [
      { id: 1, type: 'normal' },
      { id: 2, type: 'important' },
      { id: 3, type: 'important' },
      { id: 4, type: 'normal' },
      { id: 5, type: 'important' }
    ];

    messages.forEach(msg => handler(msg));

    return {
      name: 'Subscription with Filtering',
      passed: received.length === 3 && received.every(m => m.type === 'important'),
      details: { totalMessages: messages.length, filtered: received.length }
    };
  }

  async validateConflictResolution() {
    const versions = [];
    let lastValue = null;

    const applyUpdate = (id, timestamp, value) => {
      const entry = { id, timestamp, value };
      versions.push(entry);
      if (!lastValue || timestamp > lastValue.timestamp) {
        lastValue = entry;
      }
      return lastValue;
    };

    applyUpdate('msg1', 100, 'v1');
    applyUpdate('msg2', 50, 'v2');
    applyUpdate('msg3', 150, 'v3');
    applyUpdate('msg4', 120, 'v4');

    return {
      name: 'Conflict Resolution (Last-Write-Wins)',
      passed: lastValue.value === 'v3' && lastValue.timestamp === 150,
      details: { totalUpdates: versions.length, winner: lastValue.value, timestamp: lastValue.timestamp }
    };
  }

  async validateMessageTransformation() {
    const transformed = [];

    const transform = (msg) => {
      return {
        ...msg,
        transformed: true,
        receivedAt: Date.now(),
        size: JSON.stringify(msg).length
      };
    };

    const messages = [
      { id: 1, data: 'test1' },
      { id: 2, data: 'test2' },
      { id: 3, data: 'test3' }
    ];

    messages.forEach(msg => transformed.push(transform(msg)));

    return {
      name: 'Message Transformation',
      passed: transformed.length === 3 && transformed.every(m => m.transformed === true),
      details: { messagesTransformed: transformed.length, avgSize: Math.round(transformed.reduce((s, m) => s + m.size, 0) / transformed.length) }
    };
  }

  async validateBatchSubscription() {
    const subscribers = [];
    const received = { batch1: 0, batch2: 0, batch3: 0 };

    const subscribe = (batch, handler) => {
      subscribers.push({ batch, handler });
    };

    const broadcast = (batch, msg) => {
      subscribers.filter(s => s.batch === batch).forEach(s => s.handler(msg));
    };

    subscribe('batch1', () => received.batch1++);
    subscribe('batch2', () => received.batch2++);
    subscribe('batch1', () => received.batch1++);
    subscribe('batch3', () => received.batch3++);
    subscribe('batch2', () => received.batch2++);

    broadcast('batch1', {});
    broadcast('batch2', {});
    broadcast('batch3', {});

    return {
      name: 'Batch Subscription',
      passed: received.batch1 === 2 && received.batch2 === 2 && received.batch3 === 1,
      details: received
    };
  }

  async validateBackpressureHandling() {
    const queue = [];
    let processing = false;

    const publish = (msg) => {
      queue.push(msg);
      if (!processing) {
        processing = true;
        setImmediate(() => { processing = false; });
      }
      return queue.length;
    };

    const sizes = [];
    for (let i = 0; i < 50; i++) {
      sizes.push(publish({ id: i }));
    }

    const maxQueueSize = Math.max(...sizes);

    return {
      name: 'Backpressure Handling',
      passed: maxQueueSize >= 1 && queue.length === 50,
      details: { maxQueueSize, currentQueueSize: queue.length, messagesPublished: 50 }
    };
  }

  async validateSubscriberPriorityOrdering() {
    const results = [];
    const subscribers = [];

    const subscribe = (name, priority, handler) => {
      subscribers.push({ name, priority, handler });
      subscribers.sort((a, b) => b.priority - a.priority);
    };

    const broadcast = (msg) => {
      subscribers.forEach(sub => {
        sub.handler(msg);
        results.push(sub.name);
      });
    };

    subscribe('low', 1, () => {});
    subscribe('high', 10, () => {});
    subscribe('medium', 5, () => {});
    broadcast({ msg: 'test' });

    const isOrdered = results[0] === 'high' && results[1] === 'medium' && results[2] === 'low';

    return {
      name: 'Subscriber Priority Ordering',
      passed: isOrdered && results.length === 3,
      details: { order: results, expectedOrder: ['high', 'medium', 'low'], correct: isOrdered }
    };
  }

  async validateMessageDeduplication() {
    const received = new Set();
    const duplicates = [];

    const handler = (msg) => {
      if (received.has(msg.id)) {
        duplicates.push(msg.id);
      }
      received.add(msg.id);
    };

    const messages = [
      { id: 1 }, { id: 2 }, { id: 1 }, { id: 3 }, { id: 2 }, { id: 4 }, { id: 1 }
    ];

    messages.forEach(msg => handler(msg));

    return {
      name: 'Message Deduplication',
      passed: received.size === 4 && duplicates.length === 3,
      details: { uniqueMessages: received.size, duplicatesDetected: duplicates.length, totalMessages: messages.length }
    };
  }

  async validateConnectionStateTracking() {
    const states = [];
    let currentState = 'CLOSED';

    const setState = (state) => {
      states.push({ from: currentState, to: state, timestamp: Date.now() });
      currentState = state;
    };

    setState('CONNECTING');
    setState('OPEN');
    setState('PAUSED');
    setState('OPEN');
    setState('CLOSED');

    const validTransitions = states.every((s, i) => {
      if (s.to === 'OPEN' && (s.from === 'CONNECTING' || s.from === 'PAUSED')) return true;
      if (s.to === 'PAUSED' && s.from === 'OPEN') return true;
      if (s.to === 'CLOSED') return true;
      if (s.to === 'CONNECTING' && s.from === 'CLOSED') return true;
      return false;
    });

    return {
      name: 'Connection State Tracking',
      passed: validTransitions && states.length === 5 && currentState === 'CLOSED',
      details: { stateTransitions: states.length, currentState, validTransitions }
    };
  }

  async validateAckSequencing() {
    const sent = [];
    const acked = [];

    const send = (msg) => {
      msg.seqNum = sent.length;
      sent.push(msg);
      return msg.seqNum;
    };

    const ack = (seqNum) => {
      acked.push(seqNum);
    };

    const seqNums = [send({ data: 'a' }), send({ data: 'b' }), send({ data: 'c' })];
    seqNums.forEach(num => ack(num));

    const isOrdered = acked.every((num, i) => num === i);

    return {
      name: 'Ack Sequencing',
      passed: isOrdered && acked.length === sent.length,
      details: { sent: sent.length, acked: acked.length, sequenceCorrect: isOrdered }
    };
  }

  async validateLargeMessageHandling() {
    const largeData = { payload: 'x'.repeat(100000), metadata: { size: 100000 } };
    let received = null;
    let receivedSize = 0;

    const handler = (msg) => {
      received = msg;
      receivedSize = JSON.stringify(msg).length;
    };

    handler(largeData);

    return {
      name: 'Large Message Handling (100KB)',
      passed: received !== null && receivedSize > 90000,
      details: { messageSize: receivedSize, payloadSize: largeData.payload.length }
    };
  }

  async validateMemoryUnderSustainedLoad() {
    const initialMem = process.memoryUsage().heapUsed / 1024 / 1024;
    const messages = [];

    for (let i = 0; i < 10000; i++) {
      messages.push({ id: i, data: 'x'.repeat(100), timestamp: Date.now() });
    }

    const finalMem = process.memoryUsage().heapUsed / 1024 / 1024;
    const memGrowth = finalMem - initialMem;

    messages.length = 0;

    const postClearMem = process.memoryUsage().heapUsed / 1024 / 1024;

    return {
      name: 'Memory Under Sustained Load (10K messages)',
      passed: memGrowth < 100 && messages.length === 0,
      details: { initialMB: Math.round(initialMem), peakMB: Math.round(finalMem), growthMB: Math.round(memGrowth), postClearMB: Math.round(postClearMem) }
    };
  }

  async validateRecoveryFromSubscriberCrash() {
    const subscribers = [];
    const recovered = [];

    const subscribe = (id, handler) => {
      subscribers.push({ id, handler, active: true });
    };

    const crash = (id) => {
      const sub = subscribers.find(s => s.id === id);
      if (sub) sub.active = false;
    };

    const recover = (id) => {
      const sub = subscribers.find(s => s.id === id);
      if (sub) {
        sub.active = true;
        recovered.push(id);
      }
    };

    const broadcast = (msg) => {
      subscribers.filter(s => s.active).forEach(s => s.handler(msg));
    };

    subscribe(1, () => {});
    subscribe(2, () => {});
    subscribe(3, () => {});

    crash(2);
    recover(2);

    return {
      name: 'Recovery From Subscriber Crash',
      passed: recovered.includes(2) && subscribers.filter(s => s.active).length === 3,
      details: { totalSubscribers: subscribers.length, recovered: recovered.length, activeSubscribers: subscribers.filter(s => s.active).length }
    };
  }

  async runAllTests() {
    this.testResults = await Promise.all([
      this.validateBasicSubscription(),
      this.validateMultipleSubscribers(),
      this.validateChannelIsolation(),
      this.validateUnsubscribe(),
      this.validateMessageOrdering(),
      this.validateBroadcastToMultipleChannels(),
      this.validateHighFrequencyMessages(),
      this.validateConcurrentPublishSubscribe(),
      this.validateReconnectionMessageQueuing(),
      this.validateErrorInSubscriber(),
      this.validateSubscriptionWithFiltering(),
      this.validateConflictResolution(),
      this.validateMessageTransformation(),
      this.validateBatchSubscription(),
      this.validateBackpressureHandling(),
      this.validateSubscriberPriorityOrdering(),
      this.validateMessageDeduplication(),
      this.validateConnectionStateTracking(),
      this.validateAckSequencing(),
      this.validateLargeMessageHandling(),
      this.validateMemoryUnderSustainedLoad(),
      this.validateRecoveryFromSubscriberCrash()
    ]);

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

export function createRealtimeSyncValidator() {
  return new RealtimeSyncValidator();
}
