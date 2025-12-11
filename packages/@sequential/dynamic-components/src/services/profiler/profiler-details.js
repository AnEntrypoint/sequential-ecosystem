// Facade maintaining 100% backward compatibility with profiler detail views
import { buildProfileDetailView } from './profiler-detail-view.js';
import { buildComparisonView } from './profiler-comparison-view.js';

export class ProfilerDetails {
  constructor(profiler) {
    this.profiler = profiler;
  }

  buildProfileDetailView(profileId) {
    return buildProfileDetailView(this.profiler, profileId);
  }

  buildComparationView(patternId1, patternId2) {
    return buildComparisonView(this.profiler, patternId1, patternId2);
  }
}
