// Data visualization component templates (charts, stats, progress)
export const dataVisualizationTemplates = {
  'chart-container': `
    <div style="display: flex; flex-direction: column; gap: 16px; padding: 16px; border-radius: 8px; background: var(--color-backgroundLight);">
      <h3 style="color: var(--color-text); margin: 0;">Chart</h3>
      <div id="chart" style="width: 100%; height: 300px; background: var(--color-background); border-radius: 4px;"></div>
    </div>
  `,
  'stat-card': `
    <div style="padding: 16px; background: var(--color-backgroundLight); border-radius: 8px; border-left: 4px solid var(--color-primary);">
      <div style="color: var(--color-textMuted); font-size: 12px; margin-bottom: 8px;">{{label}}</div>
      <div style="color: var(--color-primary); font-size: 24px; font-weight: 600;">{{value}}</div>
      <div style="color: var(--color-textMuted); font-size: 11px; margin-top: 8px;">{{change}}</div>
    </div>
  `,
  'progress-ring': `
    <svg style="width: 120px; height: 120px;" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r="50" fill="none" stroke="var(--color-border)" stroke-width="8"/>
      <circle cx="60" cy="60" r="50" fill="none" stroke="var(--color-primary)" stroke-width="8"
              stroke-dasharray="{{percent * 3.14}} 314" transform="rotate(-90 60 60)"/>
      <text x="60" y="60" text-anchor="middle" dy="0.3em" font-size="20" fill="var(--color-text)">{{percent}}%</text>
    </svg>
  `,
  'heat-map': `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(40px, 1fr)); gap: 4px; padding: 16px;">
      {{#each cells}}
        <div style="width: 40px; height: 40px; background: {{color}}; border-radius: 4px; cursor: pointer;"
             title="{{value}}"></div>
      {{/each}}
    </div>
  `
};
