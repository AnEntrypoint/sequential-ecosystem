// Pattern documentation HTML generator
import { escapeHtml as escape } from '@sequentialos/text-encoding';
import { DOC_STYLES } from './docs-html-styles.js';

export function generatePatternHTML(pattern) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pattern.name} - Pattern Documentation</title>
  <style>${DOC_STYLES}</style>
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
    <pre><code>${escape(pattern.usage)}</code></pre>
    ` : ''}

    ${pattern.example ? `
    <h2>Example</h2>
    <pre><code>${escape(pattern.example)}</code></pre>
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
