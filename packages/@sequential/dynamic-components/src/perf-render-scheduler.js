// Render scheduling optimization
export class PerfRenderScheduler {
  debounceRender(fn, delay = 16) {
    let timeoutId;
    let lastCallTime = 0;

    return function debounced(...args) {
      const now = Date.now();

      if (now - lastCallTime >= delay) {
        lastCallTime = now;
        fn.apply(this, args);
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          lastCallTime = Date.now();
          fn.apply(this, args);
        }, delay - (now - lastCallTime));
      }
    };
  }

  requestAnimationFrameRender(fn) {
    let isScheduled = false;

    return function scheduled(...args) {
      if (!isScheduled) {
        isScheduled = true;

        requestAnimationFrame(() => {
          fn.apply(this, args);
          isScheduled = false;
        });
      }
    };
  }
}
