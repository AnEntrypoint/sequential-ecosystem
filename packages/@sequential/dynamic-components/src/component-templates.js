// Component template registrations organized by category
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

export const formComponentTemplates = {
  'rich-textarea': `
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <textarea placeholder="{{placeholder}}" style="width: 100%; min-height: 200px; padding: 12px; border: 1px solid var(--color-border); border-radius: 4px; font-family: monospace; resize: vertical;"></textarea>
      <div style="color: var(--color-textMuted); font-size: 12px;">{{#if maxLength}}{{charCount}}/{{maxLength}}{{/if}}</div>
    </div>
  `,
  'file-uploader': `
    <div style="border: 2px dashed var(--color-border); border-radius: 8px; padding: 32px; text-align: center; cursor: pointer;">
      <div style="font-size: 32px; margin-bottom: 8px;">📁</div>
      <div style="color: var(--color-text); font-weight: 500; margin-bottom: 4px;">Drop files here or click</div>
      <div style="color: var(--color-textMuted); font-size: 12px;">Supported: {{supportedTypes}}</div>
      <input type="file" style="display: none;" accept="{{accept}}" multiple/>
    </div>
  `,
  'toggle-switch': `
    <label style="display: inline-flex; align-items: center; gap: 8px; cursor: pointer;">
      <div style="width: 44px; height: 24px; background: {{checked ? 'var(--color-primary)' : 'var(--color-border)'}}; border-radius: 12px; position: relative; transition: background 0.3s;">
        <div style="width: 20px; height: 20px; background: white; border-radius: 50%; position: absolute; top: 2px; left: {{checked ? '22px' : '2px'}}; transition: left 0.3s;"></div>
      </div>
      <span>{{label}}</span>
    </label>
  `,
  'multi-select': `
    <div style="display: flex; flex-wrap: wrap; gap: 8px; padding: 8px; border: 1px solid var(--color-border); border-radius: 4px;">
      {{#each selected}}
        <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 8px; background: var(--color-primary); color: white; border-radius: 4px; font-size: 12px;">
          {{this}}
          <span style="cursor: pointer;" onclick="remove('{{this}}')">×</span>
        </div>
      {{/each}}
    </div>
  `,
  'radio-group': `
    <div style="display: flex; flex-direction: column; gap: 12px;">
      {{#each options}}
        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
          <input type="radio" name="{{groupName}}" value="{{value}}" style="width: 16px; height: 16px;"/>
          <span>{{label}}</span>
        </label>
      {{/each}}
    </div>
  `,
  'slider': `
    <div style="display: flex; align-items: center; gap: 12px;">
      <input type="range" min="{{min}}" max="{{max}}" value="{{value}}" style="flex: 1;" oninput="onChange(this.value)"/>
      <span style="min-width: 40px; text-align: right; color: var(--color-text);">{{value}}</span>
    </div>
  `
};

export const layoutComponentTemplates = {
  'container': `
    <div style="max-width: {{maxWidth || '1200px'}}; margin: 0 auto; padding: {{padding || '0'}};">
      {{children}}
    </div>
  `,
  'panel-group': `
    <div style="display: grid; grid-template-columns: repeat({{cols || 'auto-fit'}}, minmax({{minWidth || '300px'}}, 1fr)); gap: {{gap || '16px'}}; padding: {{padding || '16px'}};">
      {{children}}
    </div>
  `,
  'stack': `
    <div style="display: flex; flex-direction: {{direction || 'column'}}; gap: {{gap || '12px'}}; align-items: {{align || 'stretch'}}; justify-content: {{justify || 'flex-start'}};">
      {{children}}
    </div>
  `,
  'divider': `
    <div style="border-{{direction || 'top'}}: 1px solid var(--color-border); margin: {{margin || '16px 0'}}; height: {{height || 'auto'}}; width: {{width || '100%'}};"></div>
  `,
  'spacer': `
    <div style="width: {{width || '100%'}}; height: {{height || '16px'}};"></div>
  `
};

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
