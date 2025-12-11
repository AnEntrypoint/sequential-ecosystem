// Virtual scrolling optimization
export class PerfVirtualScroll {
  constructor() {
    this.virtualScrollRegions = new Map();
  }

  setupVirtualScrolling(elementId, items, itemHeight, containerHeight) {
    const scrollRegion = {
      elementId,
      items,
      itemHeight,
      containerHeight,
      scrollTop: 0,
      visibleStart: 0,
      visibleEnd: Math.ceil(containerHeight / itemHeight),
      overscan: 3,
      lastScrollTime: 0
    };

    this.virtualScrollRegions.set(elementId, scrollRegion);

    return {
      visibleItems: this.getVisibleItems(elementId),
      offsetY: 0
    };
  }

  updateScroll(elementId, scrollTop) {
    const region = this.virtualScrollRegions.get(elementId);
    if (!region) return null;

    const now = Date.now();

    if (now - region.lastScrollTime < 16) {
      return { visibleItems: region.items.slice(region.visibleStart, region.visibleEnd) };
    }

    region.scrollTop = scrollTop;
    region.visibleStart = Math.max(0, Math.floor(scrollTop / region.itemHeight) - region.overscan);
    region.visibleEnd = Math.min(
      region.items.length,
      Math.ceil((scrollTop + region.containerHeight) / region.itemHeight) + region.overscan
    );

    region.lastScrollTime = now;

    return {
      visibleItems: this.getVisibleItems(elementId),
      offsetY: region.visibleStart * region.itemHeight
    };
  }

  getVisibleItems(elementId) {
    const region = this.virtualScrollRegions.get(elementId);
    if (!region) return [];

    return region.items.slice(region.visibleStart, region.visibleEnd);
  }

  clear() {
    this.virtualScrollRegions.clear();
  }
}
