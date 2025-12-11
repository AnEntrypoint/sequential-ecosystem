// HTML documentation generator
import { escapeHtml as escape } from '@sequentialos/text-encoding';

export class DocsHtmlGenerator {
  escapeHtml(text) {
    return escape(text);
  }

  generateHTMLDoc(pattern) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pattern.name} - Pattern Documentation</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      color: #333;
      line-height: 1.6;
    }
    .container { max-width: 800px; margin: 0 auto; padding: 20px; }
    header { background: #667eea; color: white; padding: 20px; border-radius: 6px; margin-bottom: 20px; }
    h1 { font-size: 24px; margin-bottom: 10px; }
    h2 { font-size: 18px; margin-top: 20px; margin-bottom: 10px; border-bottom: 2px solid #667eea; padding-bottom: 5px; }
    .meta { display: flex; gap: 15px; flex-wrap: wrap; margin-bottom: 20px; }
    .meta-item { background: white; padding: 10px 15px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .meta-label { font-weight: 600; color: #667eea; font-size: 12px; text-transform: uppercase; }
    .meta-value { font-size: 14px; margin-top: 5px; }
    pre { background: #2d2d30; color: #d4d4d4; padding: 15px; border-radius: 4px; overflow-x: auto; margin: 10px 0; }
    code { font-family: 'Courier New', monospace; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    th, td { text-align: left; padding: 10px; border-bottom: 1px solid #ddd; }
    th { background: #f0f0f0; font-weight: 600; }
    .tag { display: inline-block; background: #667eea; color: white; padding: 3px 8px; border-radius: 3px; font-size: 12px; margin: 2px; }
    .a11y-item, .perf-item, .dep-item { background: #f9f9f9; padding: 10px; border-left: 3px solid #667eea; margin: 5px 0; }
    footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>${pattern.name}</h1>
      <p>${pattern.description}</p>
    </header>

    <div class="meta">
      <div class="meta-item">
        <div class="meta-label">Category</div>
        <div class="meta-value">${pattern.category}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Code Reduction</div>
        <div class="meta-value">${pattern.codeReduction} lines</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Version</div>
        <div class="meta-value">${pattern.versions?.[0]?.version || '1.0.0'}</div>
      </div>
    </div>

    ${pattern.tags?.length > 0 ? `
    <div style="margin-bottom: 20px;">
      <strong>Tags:</strong><br>
      ${pattern.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
    </div>
    ` : ''}

    ${pattern.usage ? `
    <h2>Usage</h2>
    <pre><code>${this.escapeHtml(pattern.usage)}</code></pre>
    ` : ''}

    ${pattern.example ? `
    <h2>Example</h2>
    <pre><code>${this.escapeHtml(pattern.example)}</code></pre>
    ` : ''}

    ${Object.keys(pattern.properties || {}).length > 0 ? `
    <h2>Properties</h2>
    <table>
      <thead>
        <tr>
          <th>Property</th>
          <th>Type</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(pattern.properties).map(([prop, config]) => `
        <tr>
          <td><code>${prop}</code></td>
          <td><code>${config.type || 'any'}</code></td>
          <td>${config.description || ''}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
    ` : ''}

    ${pattern.dependencies?.length > 0 ? `
    <h2>Dependencies</h2>
    ${pattern.dependencies.map(dep => `<div class="dep-item"><code>${dep}</code></div>`).join('')}
    ` : ''}

    ${pattern.accessibility?.length > 0 ? `
    <h2>Accessibility</h2>
    ${pattern.accessibility.map(a11y => `<div class="a11y-item">✓ ${a11y}</div>`).join('')}
    ` : ''}

    ${Object.keys(pattern.performance || {}).length > 0 ? `
    <h2>Performance</h2>
    ${Object.entries(pattern.performance).map(([metric, value]) => `<div class="perf-item"><strong>${metric}:</strong> ${value}</div>`).join('')}
    ` : ''}

    <footer>
      Generated on ${new Date().toISOString()}
    </footer>
  </div>
</body>
</html>`;
  }

  generateLibraryHTML(patterns, categories) {
    const patternList = Array.from(patterns.values())
      .sort((a, b) => (a.category + a.name).localeCompare(b.category + b.name));

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pattern Library Documentation</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      color: #333;
    }
    .header { background: #667eea; color: white; padding: 40px 20px; text-align: center; }
    .header h1 { font-size: 32px; margin-bottom: 10px; }
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
    .stat { background: white; padding: 20px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center; }
    .stat-value { font-size: 24px; font-weight: 600; color: #667eea; }
    .stat-label { font-size: 12px; color: #999; text-transform: uppercase; margin-top: 5px; }
    .patterns-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px; }
    .pattern-card { background: white; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; transition: transform 0.2s; }
    .pattern-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .card-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; }
    .card-title { font-size: 16px; font-weight: 600; }
    .card-category { font-size: 11px; opacity: 0.9; margin-top: 3px; }
    .card-body { padding: 15px; }
    .card-desc { font-size: 13px; color: #666; margin-bottom: 10px; }
    .card-meta { display: flex; justify-content: space-between; font-size: 12px; color: #999; }
    .tag { display: inline-block; background: #f0f0f0; padding: 3px 8px; border-radius: 3px; font-size: 11px; margin: 2px; }
    footer { margin-top: 40px; padding: 20px; text-align: center; color: #999; border-top: 1px solid #ddd; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📚 Pattern Library</h1>
    <p>Comprehensive collection of reusable component patterns</p>
  </div>

  <div class="container">
    <div class="stats">
      <div class="stat">
        <div class="stat-value">${patterns.size}</div>
        <div class="stat-label">Total Patterns</div>
      </div>
      <div class="stat">
        <div class="stat-value">${categories.length}</div>
        <div class="stat-label">Categories</div>
      </div>
      <div class="stat">
        <div class="stat-value">${Array.from(patterns.values()).reduce((sum, p) => sum + p.codeReduction, 0)}</div>
        <div class="stat-label">Lines Saved</div>
      </div>
    </div>

    <div class="patterns-grid">
      ${patternList.map(pattern => `
      <div class="pattern-card">
        <div class="card-header">
          <div class="card-title">${pattern.name}</div>
          <div class="card-category">${pattern.category}</div>
        </div>
        <div class="card-body">
          <p class="card-desc">${pattern.description}</p>
          ${pattern.tags?.length > 0 ? pattern.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
          <div class="card-meta" style="margin-top: 10px;">
            <span>🔴 ${pattern.codeReduction}L saved</span>
            <span>v${pattern.versions?.[0]?.version || '1.0.0'}</span>
          </div>
        </div>
      </div>
      `).join('')}
    </div>

    <footer>
      Generated on ${new Date().toISOString()}
    </footer>
  </div>
</body>
</html>`;
  }
}
