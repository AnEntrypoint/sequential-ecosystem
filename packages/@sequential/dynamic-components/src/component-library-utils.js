// Component library utilities for searching and filtering
import { COMPONENT_LIBRARY } from './component-library-definitions.js';

export const flattenLibrary = () => {
  const flat = {};
  for (const category in COMPONENT_LIBRARY) {
    for (const name in COMPONENT_LIBRARY[category]) {
      flat[name] = {
        ...COMPONENT_LIBRARY[category][name],
        category
      };
    }
  }
  return flat;
};

export const getComponentsByCategory = (category) => {
  return COMPONENT_LIBRARY[category] || {};
};

export const searchComponents = (query) => {
  const q = query.toLowerCase();
  const results = [];
  for (const category in COMPONENT_LIBRARY) {
    for (const name in COMPONENT_LIBRARY[category]) {
      const comp = COMPONENT_LIBRARY[category][name];
      const match = name.toLowerCase().includes(q) ||
        comp.name.toLowerCase().includes(q) ||
        comp.description.toLowerCase().includes(q) ||
        comp.tags.some(t => t.toLowerCase().includes(q));
      if (match) {
        results.push({
          name,
          category,
          ...comp
        });
      }
    }
  }
  return results;
};
