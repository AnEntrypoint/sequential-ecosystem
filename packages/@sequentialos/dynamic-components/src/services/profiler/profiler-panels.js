// Facade maintaining 100% backward compatibility with profiler dashboard panels
import { buildBottlenecksPanel } from './profiler-bottlenecks-panel.js';
import { buildTopPatternsPanel } from './profiler-top-patterns-panel.js';
import { buildRecommendationsPanel } from './profiler-recommendations-panel.js';

export class ProfilerPanels {
  constructor(profiler) {
    this.profiler = profiler;
  }

  buildBottlenecksPanel(bottlenecks) {
    return buildBottlenecksPanel(bottlenecks);
  }

  buildTopPatternsPanel(topPatterns) {
    return buildTopPatternsPanel(topPatterns);
  }

  buildRecommendationsPanel(stats, bottlenecks) {
    return buildRecommendationsPanel(this.profiler, stats, bottlenecks);
  }
}
