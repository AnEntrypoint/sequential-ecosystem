// Utility component templates (empty states, loaders, dialogs, sections)
export const utilityComponentTemplates = {
  'empty-state': `
    <div style="text-align: center; padding: 40px; color: var(--color-textMuted);">
      <div style="font-size: 48px; margin-bottom: 16px;">{{icon || '📭'}}</div>
      <h3 style="color: var(--color-text); margin: 0 0 8px 0;">{{title}}</h3>
      <p style="margin: 0 0 16px 0;">{{message}}</p>
      {{#if action}}<button style="padding: 8px 16px; background: var(--color-primary); color: white; border: none; border-radius: 4px; cursor: pointer;">{{action}}</button>{{/if}}
    </div>
  `,
  'loading-overlay': `
    <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999;">
      <div style="background: white; padding: 32px; border-radius: 8px; text-align: center;">
        <div style="font-size: 32px; animation: spin 1s linear infinite; margin-bottom: 16px;">⚙️</div>
        <div style="color: var(--color-text); font-weight: 500;">{{message || 'Loading...'}}</div>
      </div>
    </div>
  `,
  'confirmation-dialog': `
    <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999;">
      <div style="background: white; padding: 24px; border-radius: 8px; min-width: 300px; box-shadow: 0 4px 16px rgba(0,0,0,0.15);">
        <h3 style="color: var(--color-text); margin: 0 0 12px 0;">{{title}}</h3>
        <p style="color: var(--color-textMuted); margin: 0 0 20px 0;">{{message}}</p>
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
          <button onclick="cancel()" style="padding: 8px 16px; background: var(--color-backgroundLight); border: 1px solid var(--color-border); border-radius: 4px; cursor: pointer;">Cancel</button>
          <button onclick="confirm()" style="padding: 8px 16px; background: {{dangerColor || 'var(--color-primary)'}}; color: white; border: none; border-radius: 4px; cursor: pointer;">{{confirmLabel || 'Confirm'}}</button>
        </div>
      </div>
    </div>
  `,
  'expandable-section': `
    <div style="border: 1px solid var(--color-border); border-radius: 4px; overflow: hidden;">
      <button onclick="toggle()" style="width: 100%; padding: 12px 16px; background: var(--color-backgroundLight); border: none; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-weight: 500; color: var(--color-text);">
        <span>{{title}}</span>
        <span style="transition: transform 0.3s; {{expanded ? 'transform: rotate(180deg)' : ''}};">▼</span>
      </button>
      {{#if expanded}}<div style="padding: 16px; background: var(--color-background); border-top: 1px solid var(--color-border);">{{children}}</div>{{/if}}
    </div>
  `
};
