// Feedback component templates (alerts, badges, tooltips, tags)
export const feedbackComponentTemplates = {
  'alert': `
    <div style="padding: 12px 16px; border-radius: 4px; background: {{bgColor}}; border-left: 4px solid {{borderColor}}; color: {{textColor}};">
      <div style="font-weight: 500; margin-bottom: 4px;">{{title}}</div>
      <div style="font-size: 14px;">{{message}}</div>
      {{#if dismissible}}<button onclick="dismiss()" style="margin-top: 8px; padding: 4px 8px; background: transparent; border: none; cursor: pointer; color: inherit;">Dismiss</button>{{/if}}
    </div>
  `,
  'skeleton-loader': `
    <div style="display: flex; flex-direction: column; gap: 12px;">
      {{#each count}}
        <div style="height: 16px; background: linear-gradient(90deg, var(--color-border) 0%, var(--color-backgroundLight) 50%, var(--color-border) 100%); border-radius: 4px; animation: pulse 1.5s infinite;"></div>
      {{/each}}
    </div>
  `,
  'badge-pill': `
    <span style="display: inline-block; padding: 4px 12px; background: {{bgColor || 'var(--color-primary)'}}; color: {{textColor || 'white'}}; border-radius: 12px; font-size: 12px; font-weight: 500;">{{label}}</span>
  `,
  'tooltip': `
    <div style="position: relative; display: inline-block; cursor: help;">
      <span style="border-bottom: 1px dotted var(--color-primary);">{{content}}</span>
      <div style="position: absolute; bottom: 125%; left: 50%; transform: translateX(-50%); background: var(--color-text); color: white; padding: 8px 12px; border-radius: 4px; white-space: nowrap; font-size: 12px; opacity: 0; pointer-events: none; transition: opacity 0.3s;" class="tooltip-text">{{tooltip}}</div>
    </div>
  `,
  'tag-list': `
    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
      {{#each tags}}
        <span style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: var(--color-backgroundLight); border: 1px solid var(--color-border); border-radius: 4px; font-size: 12px;">
          {{this}}
          {{#if removable}}<button onclick="remove('{{this}}')" style="background: none; border: none; cursor: pointer; color: var(--color-textMuted);">×</button>{{/if}}
        </span>
      {{/each}}
    </div>
  `
};
