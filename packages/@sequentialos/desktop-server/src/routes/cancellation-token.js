export class CancellationToken {
  constructor(executionId) {
    this.executionId = executionId;
    this.cancelled = false;
    this.cancelledAt = null;
    this.cancelReason = null;
    this.cancelledBy = null;
  }

  cancel(reason, source = 'api') {
    if (this.cancelled) return false;
    this.cancelled = true;
    this.cancelledAt = Date.now();
    this.cancelReason = reason;
    this.cancelledBy = source;
    return true;
  }

  isCancelled() {
    return this.cancelled;
  }

  throwIfCancelled() {
    if (this.cancelled) {
      throw new Error(`Flow execution cancelled: ${this.cancelReason}`);
    }
  }
}
