export function createSchemaMethods() {
  return {
    generateSchemaFromJSDoc(fn) {
      const fnStr = fn.toString();
      const jsdocMatch = fnStr.match(/\/\*\*([\s\S]*?)\*\//);

      if (!jsdocMatch) {
        return { input: {}, output: {} };
      }

      const jsdoc = jsdocMatch[1];
      const paramMatches = [...jsdoc.matchAll(/@param\s+\{(\w+)\}\s+(\w+)\s+-\s+(.*)/g)];
      const returnMatch = jsdoc.match(/@returns?\s+\{(\w+)\}\s+-\s+(.*)/);

      const input = {};
      for (const [, type, name, desc] of paramMatches) {
        input[name] = { type: type.toLowerCase(), description: desc };
      }

      const output = returnMatch
        ? { type: returnMatch[1].toLowerCase(), description: returnMatch[2] }
        : {};

      return { input, output };
    },

    generateSchemaFromSignature(fn) {
      const fnStr = fn.toString();
      const paramMatch = fnStr.match(/\(([^)]*)\)/);

      if (!paramMatch) {
        return { input: {}, output: {} };
      }

      const params = paramMatch[1]
        .split(',')
        .map(p => p.trim())
        .filter(p => p)
        .map(p => p.split('=')[0].trim());

      const input = {};
      for (const param of params) {
        input[param] = { type: 'unknown' };
      }

      return { input, output: { type: 'unknown' } };
    }
  };
}
