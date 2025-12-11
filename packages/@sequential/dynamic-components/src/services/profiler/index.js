import { ProfilerDashboard } from './profiler-dashboard.js';
import { ProfilerDetails } from './profiler-details.js';

export class PatternProfilerUI {
  constructor(profiler) {
    this.profiler = profiler;
    this.selectedProfileId = null;
    this.selectedMetric = 'duration';
    this.filterPattern = null;
    this.showDetailView = false;
    this.dashboard = new ProfilerDashboard(profiler);
    this.details = new ProfilerDetails(profiler);
  }

  buildMainDashboard() {
    return this.dashboard.buildMainDashboard();
  }

  buildDashboardHeader() {
    return this.dashboard.buildDashboardHeader();
  }

  buildMetricsGrid(stats) {
    return this.dashboard.buildMetricsGrid(stats);
  }

  buildMetricCard(label, value, color = '#667eea') {
    return this.dashboard.buildMetricCard(label, value, color);
  }

  buildBottlenecksPanel(bottlenecks) {
    return this.dashboard.buildBottlenecksPanel(bottlenecks);
  }

  buildTopPatternsPanel(topPatterns) {
    return this.dashboard.buildTopPatternsPanel(topPatterns);
  }

  buildRecommendationsPanel(stats, bottlenecks) {
    return this.dashboard.buildRecommendationsPanel(stats, bottlenecks);
  }

  buildProfileDetailView(profileId) {
    return this.details.buildProfileDetailView(profileId);
  }

  buildComparationView(patternId1, patternId2) {
    return this.details.buildComparationView(patternId1, patternId2);
  }
}

export const createPatternProfilerUI = (profiler) => new PatternProfilerUI(profiler);
