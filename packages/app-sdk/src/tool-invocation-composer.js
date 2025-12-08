export function createToolInvocationComposer() {
  const toolCache = new Map();
  const cacheExpiry = 5 * 60 * 1000;

  return {
    cacheTools(tools) {
      for (const tool of tools) {
        toolCache.set(tool.name, {
          tool: tool,
          cachedAt: Date.now()
        });
      }
    },

    find(query) {
      if (!query || query.length === 0) {
        return Array.from(toolCache.keys());
      }

      const queryLower = query.toLowerCase();
      const results = [];

      for (const entry of toolCache.values()) {
        const tool = entry.tool;
        const isCached = Date.now() - entry.cachedAt < cacheExpiry;

        if (!isCached) {
          toolCache.delete(tool.name);
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
      const entry = toolCache.get(toolName);
      if (!entry) {
        return null;
      }

      const tool = entry.tool;
      const isCached = Date.now() - entry.cachedAt < cacheExpiry;

      if (!isCached) {
        toolCache.delete(toolName);
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
        returnType: tool.returnType || 'any',
        examples: this.generateExamples(toolName, paramList),
        commonErrors: this.getCommonErrors(toolName)
      };
    },

    generateExamples(toolName, params) {
      const examples = [];

      if (params.length === 0) {
        examples.push({
          description: 'Simple invocation with no parameters',
          code: 'await sdk.tools("invoke", "' + toolName + '", {})'
        });
        return examples;
      }

      const requiredParams = params.filter(function(p) { return p.required; });

      if (requiredParams.length > 0) {
        const exampleInput = {};
        for (const param of requiredParams) {
          exampleInput[param.name] = param.example || 'value';
        }
        examples.push({
          description: 'With required parameters',
          code: 'await sdk.tools("invoke", "' + toolName + '", ' + JSON.stringify(exampleInput) + ')'
        });
      }

      const allParams = {};
      for (const param of params) {
        allParams[param.name] = param.example || 'value';
      }
      examples.push({
        description: 'With all parameters',
        code: 'await sdk.tools("invoke", "' + toolName + '", ' + JSON.stringify(allParams) + ')'
      });

      return examples;
    },

    getCommonErrors(toolName) {
      return [
        { error: 'Missing required parameter', solution: 'Check parameter list, all marked as required must be provided' },
        { error: 'Type mismatch', solution: 'Ensure parameter types match the schema (string, number, boolean, object)' },
        { error: 'Invalid enum value', solution: 'Parameter has allowed values only - check preview for valid options' }
      ];
    },

    compose(toolName, inputParams = {}) {
      const preview = this.preview(toolName);
      if (!preview) {
        return null;
      }

      const lines = [];
      lines.push('// Call to ' + toolName);
      lines.push('const result = await sdk.tools("invoke", "' + toolName + '", {');

      for (const param of preview.parameters) {
        const hasValue = inputParams.hasOwnProperty(param.name);
        const value = hasValue ? JSON.stringify(inputParams[param.name]) : param.example || 'null';
        const required = param.required ? ' // REQUIRED' : ' // optional';
        lines.push('  ' + param.name + ': ' + value + ',' + required);
      }

      lines.push('});');
      lines.push('');
      lines.push('// Result type: ' + preview.returnType);

      return {
        toolName: toolName,
        code: lines.join('\n'),
        expectedReturn: preview.returnType
      };
    },

    validate(toolName, inputParams) {
      const preview = this.preview(toolName);
      if (!preview) {
        return { valid: false, error: 'Tool not found: ' + toolName };
      }

      const errors = [];

      for (const param of preview.parameters) {
        if (param.required && !inputParams.hasOwnProperty(param.name)) {
          errors.push({
            field: param.name,
            error: 'Missing required parameter',
            type: param.type
          });
        }

        if (inputParams.hasOwnProperty(param.name)) {
          const value = inputParams[param.name];

          if (param.constraints.enum && !param.constraints.enum.includes(value)) {
            errors.push({
              field: param.name,
              error: 'Invalid enum value',
              allowed: param.constraints.enum
            });
          }

          if (param.constraints.minLength && typeof value === 'string' && value.length < param.constraints.minLength) {
            errors.push({
              field: param.name,
              error: 'String too short',
              minLength: param.constraints.minLength
            });
          }

          if (param.constraints.maxLength && typeof value === 'string' && value.length > param.constraints.maxLength) {
            errors.push({
              field: param.name,
              error: 'String too long',
              maxLength: param.constraints.maxLength
            });
          }
        }
      }

      return {
        valid: errors.length === 0,
        errors: errors,
        preview: preview
      };
    },

    getCacheStats() {
      return {
        cachedTools: toolCache.size,
        cacheSize: Array.from(toolCache.values()).reduce(function(sum, entry) {
          return sum + JSON.stringify(entry.tool).length;
        }, 0),
        expiredCount: Array.from(toolCache.values()).filter(function(entry) {
          return Date.now() - entry.cachedAt >= cacheExpiry;
        }).length
      };
    },

    clearCache() {
      toolCache.clear();
    }
  };
}
