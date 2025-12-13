import { createSingleSubscriber, createGroupedSubscriber, createSetSubscriber } from './subscriber-manager.js';
import { nowISO, createTimestamps, updateTimestamp } from '@sequentialos/timestamp-utilities';

const runSubscribers = createSingleSubscriber();
const taskSubscribers = createGroupedSubscriber();
const fileSubscribers = createSetSubscriber();
const backgroundTaskSubscribers = createSingleSubscriber();

export function broadcastToRunSubscribers(message) {
  runSubscribers.broadcast(message);
}

export function broadcastToTaskSubscribers(taskName, message) {
  taskSubscribers.broadcast(message, taskName);
}

export function broadcastToFileSubscribers(message) {
  fileSubscribers.broadcast(message);
}

export function addRunSubscriber(subscriptionId, ws) {
  runSubscribers.subscribe(subscriptionId, ws);
}

export function removeRunSubscriber(subscriptionId) {
  runSubscribers.unsubscribe(subscriptionId);
}

export function addTaskSubscriber(taskName, ws) {
  taskSubscribers.subscribe(taskName, ws);
}

export function removeTaskSubscriber(taskName, ws) {
  taskSubscribers.unsubscribe(taskName, ws);
}

export function addFileSubscriber(ws) {
  fileSubscribers.subscribe(ws);
}

export function removeFileSubscriber(ws) {
  fileSubscribers.unsubscribe(ws);
}

export function broadcastTaskProgress(taskName, runId, progress) {
  broadcastToTaskSubscribers(taskName, {
    type: 'progress',
    runId,
    taskName,
    progress: {
      stage: progress.stage || 'executing',
      percentage: progress.percentage || 0,
      details: progress.details || '',
      timestamp: nowISO()
    }
  });

  broadcastToRunSubscribers({
    type: 'progress',
    runId,
    taskName,
    progress: {
      stage: progress.stage || 'executing',
      percentage: progress.percentage || 0,
      details: progress.details || '',
      timestamp: nowISO()
    }
  });
}

export function broadcastRunProgress(runId, taskName, progress) {
  broadcastToRunSubscribers({
    type: 'progress',
    runId,
    taskName,
    progress: {
      stage: progress.stage || 'executing',
      percentage: progress.percentage || 0,
      details: progress.details || '',
      timestamp: nowISO()
    }
  });
}

export function broadcastBackgroundTaskEvent(message) {
  backgroundTaskSubscribers.broadcast(message);
}

export function addBackgroundTaskSubscriber(subscriptionId, ws) {
  backgroundTaskSubscribers.subscribe(subscriptionId, ws);
}

export function removeBackgroundTaskSubscriber(subscriptionId) {
  backgroundTaskSubscribers.unsubscribe(subscriptionId);
}
