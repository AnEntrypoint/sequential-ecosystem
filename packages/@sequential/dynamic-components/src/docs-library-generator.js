// Pattern library HTML generator
import { LIBRARY_STYLES } from './docs-html-styles.js';

export function generateLibraryHTML(patterns, categories) {
  const patternList = Array.from(patterns.values())
    .sort((a, b) => (a.category + a.name).localeCompare(b.category + b.name));

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pattern Library Documentation</title>
  <style>${LIBRARY_STYLES}</style>
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
