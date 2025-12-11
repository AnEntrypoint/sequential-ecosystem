/**
 * tool-loader-summary.js
 *
 * Tool summary generation for reporting
 */

export function createToolLoaderSummaryService() {
  return {
    generateToolSummary(tools) {
      const summary = {
        totalTools: tools.length,
        byCategory: {},
        byTag: {},
        tools: []
      };

      for (const tool of tools) {
        summary.tools.push({
          name: tool.name,
          description: tool.description,
          category: tool.category,
          tags: tool.tags,
          params: tool.params.map(p => ({ name: p, inferred: true }))
        });

        if (!summary.byCategory[tool.category]) {
          summary.byCategory[tool.category] = [];
        }
        summary.byCategory[tool.category].push(tool.name);

        for (const tag of tool.tags) {
          if (!summary.byTag[tag]) {
            summary.byTag[tag] = [];
          }
          summary.byTag[tag].push(tool.name);
        }
      }

      return summary;
    }
  };
}
