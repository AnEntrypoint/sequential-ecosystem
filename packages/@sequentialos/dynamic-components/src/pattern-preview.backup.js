class PatternPreview {
  constructor() {
    this.previewComponent = null;
    this.watchers = new Map();
    this.updateQueue = [];
    this.isUpdating = false;
    this.listeners = [];
    this.renderHistory = [];
    this.lastRenderTime = 0;
    this.frameCount = 0;
    this.fps = 60;
  }

  registerPreview(componentDef, watchPaths = []) {
    this.previewComponent = JSON.parse(JSON.stringify(componentDef));

    if (watchPaths.length === 0) {
      watchPaths = this.extractAllPaths(componentDef);
    }

    watchPaths.forEach(path => {
      this.watchers.set(path, null);
    });

    return this.previewComponent;
  }

  extractAllPaths(obj, prefix = '') {
    const paths = [];

    if (!obj || typeof obj !== 'object') return paths;

    Object.keys(obj).forEach(key => {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      paths.push(fullPath);

      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        paths.push(...this.extractAllPaths(obj[key], fullPath));
      }
    });

    return paths;
  }

  updatePreview(updates) {
    this.updateQueue.push({
      updates,
      timestamp: Date.now()
    });

    if (!this.isUpdating) {
      this.processUpdateQueue();
    }
  }

  processUpdateQueue() {
    if (this.updateQueue.length === 0) {
      this.isUpdating = false;
      return;
    }

    this.isUpdating = true;
    const { updates, timestamp } = this.updateQueue.shift();

    this.applyUpdates(updates);
    this.notifyListeners({
      type: 'update',
      timestamp,
      updates
    });

    setTimeout(() => this.processUpdateQueue(), 16);
  }

  applyUpdates(updates) {
    Object.entries(updates).forEach(([path, value]) => {
      this.setNestedValue(this.previewComponent, path, value);
      this.watchers.set(path, value);
    });
  }

  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  }

  getNestedValue(obj, path) {
    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
      if (current == null) return undefined;
      current = current[key];
    }

    return current;
  }

  watchPath(path, callback) {
    const watcher = {
      path,
      callback,
      lastValue: this.getNestedValue(this.previewComponent, path)
    };

    this.watchers.set(`watcher_${path}_${Date.now()}`, watcher);
    return () => this.watchers.delete(`watcher_${path}_${Date.now()}`);
  }

  onUpdate(callback) {
    this.listeners.push(callback);
    return () => {
      const idx = this.listeners.indexOf(callback);
      if (idx > -1) this.listeners.splice(idx, 1);
    };
  }

  notifyListeners(event) {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (e) {
        console.error('Preview listener error:', e);
      }
    });
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

  buildPreviewPanel() {
    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '12px',
        background: '#1e1e1e',
        borderRadius: '6px',
        flex: 1
      },
      children: [
        {
          type: 'heading',
          content: '👁️ Live Preview',
          level: 3,
          style: { margin: 0, fontSize: '12px', color: '#e0e0e0' }
        },
        this.buildPreviewContainer(),
        this.buildPerformancePanel()
      ]
    };
  }

  buildPreviewContainer() {
    if (!this.previewComponent) {
      return {
        type: 'box',
        style: {
          padding: '40px',
          background: '#2d2d30',
          borderRadius: '6px',
          border: '2px dashed #3e3e42',
          textAlign: 'center'
        },
        children: [{
          type: 'paragraph',
          content: 'No pattern selected for preview',
          style: { margin: 0, fontSize: '11px', color: '#858585' }
        }]
      };
    }

    return {
      type: 'box',
      style: {
        padding: '20px',
        background: '#2d2d30',
        borderRadius: '6px',
        border: '1px solid #3e3e42',
        minHeight: '300px',
        overflow: 'auto'
      },
      children: [JSON.parse(JSON.stringify(this.previewComponent))]
    };
  }

  buildPerformancePanel() {
    const metrics = this.getPerformanceMetrics();
    const isSmooth = metrics.jankPercent < 5;
    const statusColor = isSmooth ? '#4ade80' : metrics.jankPercent < 20 ? '#f59e0b' : '#ef4444';

    return {
      type: 'box',
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px'
      },
      children: [
        this.buildMetricCard('FPS', String(metrics.fps), statusColor),
        this.buildMetricCard('Frame Time', `${metrics.averageFrameTime.toFixed(2)}ms`, statusColor),
        this.buildMetricCard('Jank', `${metrics.jankPercent}%`, statusColor)
      ]
    };
  }

  buildMetricCard(label, value, color) {
    return {
      type: 'box',
      style: {
        padding: '8px 12px',
        background: '#3e3e42',
        borderRadius: '4px',
        borderTop: `3px solid ${color}`
      },
      children: [
        {
          type: 'paragraph',
          content: label,
          style: { margin: 0, fontSize: '9px', color: '#858585' }
        },
        {
          type: 'heading',
          content: value,
          level: 4,
          style: { margin: '4px 0 0 0', fontSize: '14px', color: '#d4d4d4', fontWeight: 600 }
        }
      ]
    };
  }

  startLiveReload(updateHandler) {
    const unsubscribe = this.onUpdate((event) => {
      if (event.type === 'update') {
        updateHandler(this.previewComponent, event);
      }
    });

    return unsubscribe;
  }

  exportPreviewState() {
    return {
      component: this.previewComponent,
      metrics: this.getPerformanceMetrics(),
      history: this.renderHistory.slice(-50),
      exportedAt: new Date().toISOString()
    };
  }

  compareSnapshots(snapshot1, snapshot2) {
    const changes = [];

    const findDifferences = (obj1, obj2, path = '') => {
      const keys = new Set([
        ...Object.keys(obj1 || {}),
        ...Object.keys(obj2 || {})
      ]);

      keys.forEach(key => {
        const fullPath = path ? `${path}.${key}` : key;
        const val1 = obj1?.[key];
        const val2 = obj2?.[key];

        if (JSON.stringify(val1) !== JSON.stringify(val2)) {
          changes.push({
            path: fullPath,
            from: val1,
            to: val2
          });

          if (typeof val1 === 'object' && typeof val2 === 'object') {
            findDifferences(val1, val2, fullPath);
          }
        }
      });
    };

    findDifferences(snapshot1.component, snapshot2.component);
    return changes;
  }

  buildComparisonUI(snapshot1, snapshot2) {
    const changes = this.compareSnapshots(snapshot1, snapshot2);

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '12px',
        background: '#1e1e1e',
        borderRadius: '6px'
      },
      children: [
        {
          type: 'heading',
          content: '🔄 Snapshot Comparison',
          level: 3,
          style: { margin: 0, fontSize: '12px', color: '#e0e0e0' }
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          },
          children: changes.slice(0, 10).map(change => ({
            type: 'box',
            style: {
              padding: '8px',
              background: '#2d2d30',
              borderRadius: '4px',
              borderLeft: '3px solid #667eea'
            },
            children: [{
              type: 'paragraph',
              content: `${change.path}: ${JSON.stringify(change.from)} → ${JSON.stringify(change.to)}`,
              style: { margin: 0, fontSize: '9px', color: '#d4d4d4', fontFamily: 'monospace' }
            }]
          }))
        }
      ]
    };
  }

  captureSnapshot() {
    return {
      component: JSON.parse(JSON.stringify(this.previewComponent)),
      metrics: this.getPerformanceMetrics(),
      timestamp: Date.now()
    };
  }

  resetMetrics() {
    this.renderHistory = [];
    this.frameCount = 0;
    this.lastRenderTime = 0;
  }
}

function createPatternPreview() {
  return new PatternPreview();
}

export { PatternPreview, createPatternPreview };
