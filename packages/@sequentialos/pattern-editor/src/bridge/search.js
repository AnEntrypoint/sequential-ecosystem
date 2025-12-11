export class PatternSearch {
  constructor(patternBridge) {
    this.patternBridge = patternBridge;
  }

  searchPatterns(query) {
    const results = [];

    for (const [key, meta] of this.patternBridge.patternMetadata) {
      const { pattern, category } = meta;
      const searchFields = [
        pattern.name,
        pattern.description,
        pattern.tags?.join(' '),
        category
      ].filter(Boolean).join(' ').toLowerCase();

      if (searchFields.includes(query.toLowerCase())) {
        results.push({ ...meta, key });
      }
    }

    return results;
  }

  buildPatternPalette(category = null) {
    const patterns = category
      ? this.patternBridge.patternLibraries.get(category) || []
      : Array.from(this.patternBridge.patternLibraries.values()).flat();

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '12px',
        background: '#1e1e1e',
        borderRadius: '6px',
        maxHeight: '400px',
        overflow: 'auto'
      },
      children: patterns.map(pattern => ({
        type: 'box',
        style: {
          padding: '8px 12px',
          background: '#2d2d30',
          borderRadius: '4px',
          cursor: 'pointer',
          border: '1px solid #3e3e42',
          transition: 'all 0.2s'
        },
        dataset: { patternId: pattern.id || pattern.name },
        children: [
          {
            type: 'paragraph',
            content: pattern.name,
            style: { margin: '0 0 4px 0', fontSize: '11px', fontWeight: 600, color: '#e0e0e0' }
          },
          {
            type: 'paragraph',
            content: pattern.description || '',
            style: { margin: 0, fontSize: '9px', color: '#858585' }
          }
        ]
      }))
    };
  }
}
