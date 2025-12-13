// Navigation component templates (breadcrumbs, pagination, tabs, menus)
export const navigationComponentTemplates = {
  'breadcrumb': `
    <nav style="display: flex; gap: 8px; align-items: center; font-size: 14px;">
      {{#each items}}
        {{#if @last}}
          <span style="color: var(--color-text);">{{label}}</span>
        {{else}}
          <a href="{{url}}" style="color: var(--color-primary); text-decoration: none; cursor: pointer;">{{label}}</a>
          <span style="color: var(--color-textMuted);">›</span>
        {{/if}}
      {{/each}}
    </nav>
  `,
  'pagination': `
    <div style="display: flex; justify-content: center; gap: 4px; align-items: center;">
      <button {{#unless hasPrev}}disabled{{/unless}} style="padding: 8px 12px; border: 1px solid var(--color-border); cursor: pointer;">‹ Prev</button>
      {{#each pages}}
        <button style="padding: 8px 12px; background: {{active ? 'var(--color-primary)' : 'transparent'}}; color: {{active ? 'white' : 'var(--color-text)'}}; border: 1px solid var(--color-border); cursor: pointer; border-radius: 4px;">{{page}}</button>
      {{/each}}
      <button {{#unless hasNext}}disabled{{/unless}} style="padding: 8px 12px; border: 1px solid var(--color-border); cursor: pointer;">Next ›</button>
    </div>
  `,
  'tabs-nav': `
    <div style="display: flex; border-bottom: 1px solid var(--color-border); gap: 0;">
      {{#each tabs}}
        <button style="padding: 12px 16px; border: none; background: {{active ? 'transparent' : 'transparent'}}; border-bottom: {{active ? '2px solid var(--color-primary)' : '2px solid transparent'}}; color: {{active ? 'var(--color-primary)' : 'var(--color-text)'}}; cursor: pointer; font-weight: {{active ? '600' : '400'}};">
          {{label}}
        </button>
      {{/each}}
    </div>
  `,
  'menu-dropdown': `
    <div style="position: relative; display: inline-block;">
      <button style="padding: 8px 16px; background: var(--color-backgroundLight); border: 1px solid var(--color-border); border-radius: 4px; cursor: pointer;">{{label}} ▼</button>
      <div style="position: absolute; top: 100%; left: 0; background: white; border: 1px solid var(--color-border); border-radius: 4px; min-width: 200px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); z-index: 1000; display: none;" class="dropdown-menu">
        {{#each items}}
          <a href="{{url}}" style="display: block; padding: 12px 16px; color: var(--color-text); text-decoration: none; cursor: pointer; border-bottom: 1px solid var(--color-border);">{{label}}</a>
        {{/each}}
      </div>
    </div>
  `
};
