// Facade maintaining 100% backward compatibility with discovery UI builders
import { buildStatsCards } from './discovery-stats-builder.js';
import { buildCategorySection, buildTagsSection } from './discovery-sections-builder.js';
import { buildSearchUI } from './discovery-search-builder.js';

export class DiscoveryUIBuilder {
  buildDiscoveryUI(stats, tags) {
    return {
      type: 'flex',
      direction: 'column',
      gap: '20px',
      style: { padding: '24px', background: '#fff' },
      children: [
        {
          type: 'heading',
          content: 'Pattern Discovery Hub',
          level: 2,
          style: { margin: '0 0 16px 0' }
        },
        this.buildStatsCards(stats),
        this.buildCategorySection(stats),
        this.buildTagsSection(stats)
      ]
    };
  }

  buildStatsCards(stats) {
    return buildStatsCards(stats);
  }

  buildCategorySection(stats) {
    return buildCategorySection(stats);
  }

  buildTagsSection(stats) {
    return buildTagsSection(stats);
  }

  buildSearchUI(allTags) {
    return buildSearchUI(allTags);
  }
}
