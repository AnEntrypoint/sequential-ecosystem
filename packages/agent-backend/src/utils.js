import crypto from 'crypto';
import { nowISO, createTimestamps, updateTimestamp } from '@sequential/timestamp-utilities';
import { delay, withRetry } from '@sequential/async-patterns';

export function generateId() {
  return crypto.randomBytes(8).toString('hex');
}

export function createTimer() {
  const start = Date.now();
  return () => Date.now() - start;
}

export function calculateTokenEstimate(text) {
  return Math.ceil(text.length / 4);
}

export async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const delay = baseDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

export function formatToolCall(toolName, args) {
  return {
    type: 'tool_call',
    tool: toolName,
    args,
    timestamp: nowISO()
  };
}

export function formatToolResult(toolName, result, duration) {
  return {
    type: 'tool_result',
    tool: toolName,
    success: !result.error,
    result: result.error ? null : result.result,
    error: result.error || null,
    duration,
    timestamp: nowISO()
  };
}
