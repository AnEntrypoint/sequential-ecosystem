/**
 * Documentation Registry
 * Manages documentation storage, retrieval, and searching
 */

export function createDocumentationRegistry() {
  const docs = new Map();

  return {
    register(resourceType, resourceName, documentation) {
      const key = `${resourceType}:${resourceName}`;
      docs.set(key, documentation);
      return this;
    },

    get(resourceType, resourceName) {
      return docs.get(`${resourceType}:${resourceName}`);
    },

    listAll() {
      const all = [];
      for (const [key, doc] of docs.entries()) {
        all.push({ key, ...doc });
      }
      return all;
    },

    search(query) {
      const results = [];
      for (const [key, doc] of docs.entries()) {
        if (doc.name.includes(query) ||
            doc.description.includes(query) ||
            (doc.tags && doc.tags.join(',').includes(query))) {
          results.push({ key, ...doc });
        }
      }
      return results;
    }
  };
}
