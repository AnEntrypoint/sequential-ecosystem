class PatternExporter {
  constructor() {
    this.storage = null;
  }

  init(storage) {
    this.storage = storage;
  }

  exportAsJSON(type = 'all') {
    const data = this.buildExportData(type);
    const json = JSON.stringify(data, null, 2);
    this.downloadFile(json, `pattern-library-${type}-${Date.now()}.json`, 'application/json');
  }

  exportAsPackage(packageName) {
    const data = this.buildExportData('all');
    const packageJSON = {
      name: packageName,
      version: '1.0.0',
      description: `Pattern library package: ${packageName}`,
      type: 'pattern-library',
      patterns: {
        compositions: data.compositions,
        variants: data.variants,
        templates: data.templates
      },
      metadata: {
        created: new Date().toISOString(),
        totalPatterns: data.compositions.length + data.variants.length + data.templates.length
      }
    };

    const json = JSON.stringify(packageJSON, null, 2);
    this.downloadFile(json, `${packageName}-package.json`, 'application/json');
  }

  exportAsCSV(type = 'all') {
    const data = this.buildExportData(type);
    let csv = 'id,type,name,category,codeReduction,description\n';

    [...data.compositions, ...data.variants, ...data.templates].forEach(item => {
      const type = data.compositions.includes(item) ? 'composition'
        : data.variants.includes(item) ? 'variant' : 'template';
      const row = [
        item.id,
        type,
        item.name || item.description || '',
        item.category || '',
        item.codeReduction || '0%',
        (item.description || '').replace(/"/g, '""')
      ];
      csv += `"${row.join('","')}"\n`;
    });

    this.downloadFile(csv, `pattern-library-${type}-${Date.now()}.csv`, 'text/csv');
  }

  exportAsHTML(type = 'all') {
    const data = this.buildExportData(type);
    const html = this.buildHTMLDocument(data);
    this.downloadFile(html, `pattern-library-${type}-${Date.now()}.html`, 'text/html');
  }

  exportAsMarkdown(type = 'all') {
    const data = this.buildExportData(type);
    let md = `# Pattern Library Export\n\n`;
    md += `**Exported:** ${new Date().toISOString()}\n`;
    md += `**Total Items:** ${data.compositions.length + data.variants.length + data.templates.length}\n\n`;

    if (data.compositions.length > 0) {
      md += `## Compositions (${data.compositions.length})\n\n`;
      data.compositions.forEach(c => {
        md += `### ${c.name}\n`;
        md += `- ID: \`${c.id}\`\n`;
        md += `- Category: ${c.category}\n`;
        md += `- Patterns: ${c.patterns.length}\n`;
        md += `- Layout: ${c.config.layout}\n\n`;
      });
    }

    if (data.variants.length > 0) {
      md += `## Variants (${data.variants.length})\n\n`;
      data.variants.forEach(v => {
        md += `### ${v.id}\n`;
        md += `- Base: ${v.basePatternId}\n`;
        md += `- Tags: ${(v.tags || []).join(', ')}\n`;
        md += `- Description: ${v.description}\n\n`;
      });
    }

    if (data.templates.length > 0) {
      md += `## Templates (${data.templates.length})\n\n`;
      data.templates.forEach(t => {
        md += `### ${t.name}\n`;
        md += `- ID: \`${t.id}\`\n`;
        md += `- Category: ${t.category}\n\n`;
      });
    }

    this.downloadFile(md, `pattern-library-${type}-${Date.now()}.md`, 'text/markdown');
  }

  buildExportData(type) {
    let compositions = [];
    let variants = [];
    let templates = [];

    if (type === 'all' || type === 'compositions') {
      compositions = this.storage?.getAllCompositions?.() || [];
    }
    if (type === 'all' || type === 'variants') {
      variants = this.storage?.getAllVariants?.() || [];
    }
    if (type === 'all' || type === 'templates') {
      templates = this.storage?.getAllTemplates?.() || [];
    }

    return {
      compositions,
      variants,
      templates,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
  }

  buildHTMLDocument(data) {
    const styles = `
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        background: #f5f5f5;
        color: #333;
      }
      h1 { color: #0e639c; border-bottom: 2px solid #0e639c; padding-bottom: 10px; }
      h2 { color: #667eea; margin-top: 30px; }
      .card {
        background: white;
        padding: 15px;
        margin: 10px 0;
        border-radius: 8px;
        border-left: 4px solid #667eea;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .tag {
        display: inline-block;
        background: #0e639c;
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        margin: 2px 4px 2px 0;
        font-size: 12px;
      }
      .meta { color: #666; font-size: 12px; margin-top: 8px; }
      code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; }
    `;

    let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pattern Library Export</title>
  <style>${styles}</style>
</head>
<body>
  <h1>📚 Pattern Library Export</h1>
  <p><strong>Exported:</strong> ${new Date().toLocaleString()}</p>
  <p><strong>Total Items:</strong> ${data.compositions.length + data.variants.length + data.templates.length}</p>
`;

    if (data.compositions.length > 0) {
      html += `<h2>Compositions (${data.compositions.length})</h2>`;
      data.compositions.forEach(c => {
        html += `
  <div class="card">
    <h3>${c.name}</h3>
    <p>${c.description}</p>
    <p><code>${c.id}</code></p>
    <p class="meta">
      Category: ${c.category} | Patterns: ${c.patterns.length} | Layout: ${c.config.layout}
    </p>
  </div>
`;
      });
    }

    if (data.variants.length > 0) {
      html += `<h2>Variants (${data.variants.length})</h2>`;
      data.variants.forEach(v => {
        html += `
  <div class="card">
    <h3>${v.id}</h3>
    <p>${v.description}</p>
    <div>${(v.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}</div>
    <p class="meta">Base: ${v.basePatternId}</p>
  </div>
`;
      });
    }

    if (data.templates.length > 0) {
      html += `<h2>Templates (${data.templates.length})</h2>`;
      data.templates.forEach(t => {
        html += `
  <div class="card">
    <h3>${t.name}</h3>
    <p><code>${t.id}</code></p>
    <p class="meta">Category: ${t.category}</p>
  </div>
`;
      });
    }

    html += `
</body>
</html>`;
    return html;
  }

  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  buildQuickReference() {
    const data = this.buildExportData('all');
    const ref = [];

    ref.push('# Quick Reference\n');
    ref.push(`Total Compositions: ${data.compositions.length}`);
    ref.push(`Total Variants: ${data.variants.length}`);
    ref.push(`Total Templates: ${data.templates.length}`);
    ref.push('');

    if (data.compositions.length > 0) {
      ref.push('## Composition IDs');
      data.compositions.forEach(c => ref.push(`- ${c.id}`));
    }

    if (data.variants.length > 0) {
      ref.push('\n## Variant IDs');
      data.variants.forEach(v => ref.push(`- ${v.id}`));
    }

    return ref.join('\n');
  }
}

function createPatternExporter() {
  return new PatternExporter();
}
