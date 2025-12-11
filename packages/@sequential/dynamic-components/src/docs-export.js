// Documentation export functionality
export class DocsExport {
  exportDocumentation(patterns, patternIds = null, format = 'markdown', generatePatternDoc) {
    const ids = patternIds || Array.from(patterns.keys());
    const docs = {};

    ids.forEach(id => {
      const doc = generatePatternDoc(id, format);
      if (doc) {
        docs[id] = doc;
      }
    });

    return {
      generated: new Date().toISOString(),
      format,
      patternCount: Object.keys(docs).length,
      documentation: docs
    };
  }
}
