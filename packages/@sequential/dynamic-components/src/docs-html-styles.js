// Shared CSS styles for HTML documentation
export const DOC_STYLES = `
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
`;

export const LIBRARY_STYLES = `
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
`;
