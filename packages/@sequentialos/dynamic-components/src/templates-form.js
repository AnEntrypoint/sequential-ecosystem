// Form component templates (textarea, file uploader, switches, selects)
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
