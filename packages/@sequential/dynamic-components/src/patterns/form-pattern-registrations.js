// Form pattern registrations - form sections with help text
export class PatternFormRegistrations {
  static register(registry) {
    registry.register('form-section', `
      <div style="padding: 20px; border: 1px solid var(--color-border); border-radius: 8px; margin-bottom: 16px;">
        <h3 style="margin: 0 0 16px 0;">Form Section</h3>
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <label style="font-weight: 500; font-size: 14px;">Field Label</label>
            <input type="text" placeholder="Enter value" style="padding: 10px; border: 1px solid var(--color-border); border-radius: 6px;" />
          </div>
        </div>
      </div>
    `, { category: 'patterns', tags: ['form', 'input'] });

    registry.register('form-with-help', `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; gap: 6px; align-items: baseline;">
          <label style="font-weight: 500;">Field Label</label>
          <span style="font-size: 12px; color: var(--color-textMuted);">(optional)</span>
        </div>
        <input type="text" placeholder="Enter value" style="padding: 10px; border: 1px solid var(--color-border); border-radius: 6px;" />
        <div style="font-size: 12px; color: var(--color-textMuted);">ℹ️ This field helps...</div>
      </div>
    `, { category: 'patterns', tags: ['form', 'help'] });
  }
}
