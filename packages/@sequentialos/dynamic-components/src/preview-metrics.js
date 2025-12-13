// Performance metrics tracking and analysis
export class PreviewMetrics {
  constructor() {
    this.renderHistory = [];
    this.lastRenderTime = 0;
    this.frameCount = 0;
    this.fps = 60;
  }

  trackRender() {
    const now = performance.now();
    const delta = now - this.lastRenderTime;

    this.renderHistory.push({
      timestamp: now,
      delta,
      frameTime: delta
    });

    if (this.renderHistory.length > 300) {
      this.renderHistory.shift();
    }

    this.lastRenderTime = now;
    this.frameCount++;

    return {
      frameCount: this.frameCount,
      lastFrameTime: delta,
      averageFrameTime: this.getAverageFrameTime(),
      fps: Math.round(1000 / delta)
    };
  }

  getAverageFrameTime() {
    if (this.renderHistory.length === 0) return 0;

    const sum = this.renderHistory.reduce((acc, r) => acc + r.frameTime, 0);
    return sum / this.renderHistory.length;
  }

  getPerformanceMetrics() {
    const history = this.renderHistory;

    if (history.length === 0) {
      return {
        frameCount: 0,
        averageFrameTime: 0,
        minFrameTime: 0,
        maxFrameTime: 0,
        fps: 0,
        jank: 0
      };
    }

    const frameTimes = history.map(h => h.frameTime);
    const sorted = [...frameTimes].sort((a, b) => a - b);

    const p50 = sorted[Math.floor(sorted.length * 0.5)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];

    const jankCount = frameTimes.filter(t => t > 16.67).length;

    return {
      frameCount: this.frameCount,
      totalTime: history[history.length - 1].timestamp - history[0].timestamp,
      averageFrameTime: this.getAverageFrameTime(),
      minFrameTime: Math.min(...frameTimes),
      maxFrameTime: Math.max(...frameTimes),
      p50: p50,
      p95: p95,
      fps: Math.round(1000 / this.getAverageFrameTime()),
      jank: jankCount,
      jankPercent: Math.round((jankCount / frameTimes.length) * 100)
    };
  }

  resetMetrics() {
    this.renderHistory = [];
    this.frameCount = 0;
    this.lastRenderTime = 0;
  }
}
