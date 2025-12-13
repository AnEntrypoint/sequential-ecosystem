/**
 * Fixture Loader Service
 * Manages test fixtures
 */

export function createFixtureLoader() {
  const fixtures = new Map();

  return {
    load(name, data) {
      fixtures.set(name, JSON.parse(JSON.stringify(data)));
      return this;
    },

    get(name) {
      const fixture = fixtures.get(name);
      if (!fixture) {
        throw new Error(`Fixture not found: ${name}`);
      }
      return JSON.parse(JSON.stringify(fixture));
    },

    getMany(names) {
      const result = {};
      for (const name of names) {
        result[name] = this.get(name);
      }
      return result;
    },

    has(name) {
      return fixtures.has(name);
    }
  };
}
