// Layout component templates (containers, grids, stacks, dividers)
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
