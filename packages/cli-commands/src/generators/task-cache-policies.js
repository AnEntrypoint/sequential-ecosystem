export function defaultKeyGenerator(input) {
  if (typeof input === 'string') return input;
  if (typeof input === 'number') return String(input);
  if (typeof input === 'object') {
    return JSON.stringify(input);
  }
  return String(input);
}

export function createCachePolicies() {
  return {
    noCache: { ttl: 0, maxSize: 0 },
    shortTerm: { ttl: 60000, maxSize: 100 },
    mediumTerm: { ttl: 300000, maxSize: 500 },
    longTerm: { ttl: 3600000, maxSize: 1000 },
    unlimited: { ttl: Infinity, maxSize: 10000 }
  };
}
