/**
 * Checkpoint Analyzer
 * Checkpoint analysis, timeline generation, and comparison
 *
 * Delegates to:
 * - checkpoint-timeline-generator: Chronological timeline construction
 * - checkpoint-statistics-analyzer: Performance metrics and analysis
 * - checkpoint-comparator: Multi-checkpoint data comparison
 */

import { createCheckpointTimelineGenerator } from './checkpoint-timeline-generator.js';
import { createCheckpointStatisticsAnalyzer } from './checkpoint-statistics-analyzer.js';
import { createCheckpointComparator } from './checkpoint-comparator.js';

export function createCheckpointAnalyzer(storage) {
  const timeline = createCheckpointTimelineGenerator(storage);
  const stats = createCheckpointStatisticsAnalyzer(storage);
  const comparator = createCheckpointComparator(storage);

  return {
    getTimeline: timeline.getTimeline.bind(timeline),
    analyze: stats.analyze.bind(stats),
    compare: comparator.compare.bind(comparator)
  };
}
