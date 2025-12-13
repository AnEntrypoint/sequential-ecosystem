// Profiler dashboard facade - maintains 100% backward compatibility
import { ProfilerMetrics } from './profiler-metrics.js';
import { ProfilerPanels } from './profiler-panels.js';

export class ProfilerDashboard {
  constructor(profiler) {
    this.profiler = profiler;
    this.metrics = new ProfilerMetrics(profiler);
    this.panels = new ProfilerPanels(profiler);
  }

  buildMainDashboard() {
    const stats = this.profiler.getStatistics();
    const bottlenecks = this.profiler.identifyBottlenecks();
    const topPatterns = this.profiler.getTopPatterns('duration', 5);

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px',
        background: '#1e1e1e',
        borderRadius: '6px'
      },
      children: [
        this.buildDashboardHeader(),
        this.buildMetricsGrid(stats),
        {
          type: 'box',
          style: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px'
          },
          children: [
            this.buildBottlenecksPanel(bottlenecks),
            this.buildTopPatternsPanel(topPatterns)
          ]
        },
        this.buildRecommendationsPanel(stats, bottlenecks)
      ]
    };
  }

  buildDashboardHeader() {
    return this.metrics.buildDashboardHeader();
  }

  buildMetricsGrid(stats) {
    return this.metrics.buildMetricsGrid(stats);
  }

  buildMetricCard(label, value, color) {
    return this.metrics.buildMetricCard(label, value, color);
  }

  buildBottlenecksPanel(bottlenecks) {
    return this.panels.buildBottlenecksPanel(bottlenecks);
  }

  buildTopPatternsPanel(topPatterns) {
    return this.panels.buildTopPatternsPanel(topPatterns);
  }

  buildRecommendationsPanel(stats, bottlenecks) {
    return this.panels.buildRecommendationsPanel(stats, bottlenecks);
  }
}
