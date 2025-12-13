export function createToolComposerSearch(cache) {
  return {
    find(query) {
      const toolCache = cache.getAllTools();

      if (!query || query.length === 0) {
        return Array.from(toolCache.keys());
      }

      const queryLower = query.toLowerCase();
      const results = [];

      for (const [toolName, entry] of toolCache.entries()) {
        const tool = entry.tool;
        const isCached = cache.isCached(entry);

        if (!isCached) {
          continue;
        }

        if (tool.name.toLowerCase().includes(queryLower) ||
            (tool.description && tool.description.toLowerCase().includes(queryLower))) {
          results.push({
            name: tool.name,
            description: tool.description || '',
            paramCount: Object.keys(tool.parameters || {}).length
          });
        }
      }

      return results;
    },

    preview(toolName) {
      const tool = cache.getCachedTool(toolName);
      if (!tool) {
        return null;
      }

      const params = tool.parameters || {};
      const paramList = Object.entries(params).map(function(entry) {
        const name = entry[0];
        const param = entry[1];
        return {
          name: name,
          type: param.type || 'any',
          required: param.required || false,
          description: param.description || '',
          example: param.example || null,
          constraints: {
            enum: param.enum || null,
            minLength: param.minLength || null,
            maxLength: param.maxLength || null,
            min: param.min || null,
            max: param.max || null
          }
        };
      });

      return {
        name: toolName,
        description: tool.description || '',
        parameters: paramList,
        returnType: tool.returnType || 'any'
      };
    }
  };
}
