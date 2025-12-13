// Core profiling lifecycle management
class ProfilerCore {
  constructor() {
    this.profiles = new Map();
    this.measurements = new Map();
    this.enabled = true;
    this.sessionStartTime = Date.now();
  }

  startProfiling(patternId) {
    if (!this.enabled) return null;

    const profileId = `profile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const profile = {
      id: profileId,
      patternId,
      startTime: performance.now(),
      startMark: `pattern-start-${profileId}`,
      endMark: `pattern-end-${profileId}`,
      metrics: {},
      memory: this.getMemoryUsage(),
      renderCount: 0,
      updateCount: 0,
      events: []
    };

    this.profiles.set(profileId, profile);

    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(profile.startMark);
    }

    return profileId;
  }

  endProfiling(profileId) {
    const profile = this.profiles.get(profileId);
    if (!profile) return null;

    profile.endTime = performance.now();

    if (typeof performance !== 'undefined' && performance.mark && performance.measure) {
      performance.mark(profile.endMark);
      const measureName = `pattern-measure-${profileId}`;
      performance.measure(measureName, profile.startMark, profile.endMark);

      const measure = performance.getEntriesByName(measureName)[0];
      profile.metrics.duration = measure.duration;
    } else {
      profile.metrics.duration = profile.endTime - profile.startTime;
    }

    profile.metrics.endMemory = this.getMemoryUsage();
    profile.metrics.memoryDelta = this.calculateMemoryDelta(
      profile.memory,
      profile.metrics.endMemory
    );

    return profile;
  }

  measureRender(patternId, callback) {
    const profileId = this.startProfiling(patternId);
    let result;

    try {
      result = callback();
    } catch (e) {
      this.recordEvent(profileId, 'error', {
        message: e.message,
        stack: e.stack
      });
      throw e;
    }

    this.endProfiling(profileId);
    return result;
  }

  async measureRenderAsync(patternId, callback) {
    const profileId = this.startProfiling(patternId);
    let result;

    try {
      result = await callback();
    } catch (e) {
      this.recordEvent(profileId, 'error', {
        message: e.message,
        stack: e.stack
      });
      throw e;
    }

    this.endProfiling(profileId);
    return result;
  }

  recordEvent(profileId, eventType, data = {}) {
    const profile = this.profiles.get(profileId);
    if (!profile) return;

    profile.events.push({
      type: eventType,
      timestamp: performance.now(),
      relativeTime: performance.now() - profile.startTime,
      data
    });

    if (eventType === 'render') profile.renderCount++;
    if (eventType === 'update') profile.updateCount++;
  }

  getMemoryUsage() {
    if (typeof performance !== 'undefined' && performance.memory) {
      return {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  }

  calculateMemoryDelta(startMem, endMem) {
    if (!startMem || !endMem) return null;

    return {
      usedDelta: endMem.usedJSHeapSize - startMem.usedJSHeapSize,
      totalDelta: endMem.totalJSHeapSize - startMem.totalJSHeapSize
    };
  }

  getProfile(profileId) {
    return this.profiles.get(profileId);
  }

  getPatternProfiles(patternId) {
    return Array.from(this.profiles.values()).filter(p => p.patternId === patternId);
  }

  clear() {
    this.profiles.clear();
    this.measurements.clear();
  }
}

export { ProfilerCore };
