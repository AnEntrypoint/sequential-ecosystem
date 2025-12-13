/**
 * Field Selector
 * Selects and excludes fields from objects
 */

export function createFieldSelector() {
  return {
    select(result, fields) {
      if (result.isError) return result;
      return result.map(value => {
        const selected = {};
        for (const field of fields) {
          if (field in value) {
            selected[field] = value[field];
          }
        }
        return selected;
      });
    },

    reject(result, fields) {
      if (result.isError) return result;
      return result.map(value => {
        const rejected = { ...value };
        for (const field of fields) {
          delete rejected[field];
        }
        return rejected;
      });
    }
  };
}
