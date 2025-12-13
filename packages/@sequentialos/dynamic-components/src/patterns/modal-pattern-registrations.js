// Modal pattern registrations - dialogs and notifications
export class PatternModalRegistrations {
  static register(registry) {
    registry.register('alert-dialog', `
      <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;">
        <div style="background: white; padding: 32px; border-radius: 8px; max-width: 400px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);">
          <h2 style="margin: 0 0 16px 0;">Alert Title</h2>
          <p style="margin: 0 0 24px 0; color: var(--color-textMuted);">Alert message content goes here</p>
          <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <button style="padding: 10px 16px; border: 1px solid var(--color-border); border-radius: 6px; background: white; cursor: pointer;">Cancel</button>
            <button style="padding: 10px 16px; background: var(--color-primary); color: white; border: none; border-radius: 6px; cursor: pointer;">Confirm</button>
          </div>
        </div>
      </div>
    `, { category: 'patterns', tags: ['modal', 'dialog'] });

    registry.register('toast-notification', `
      <div style="position: fixed; bottom: 20px; right: 20px; background: white; padding: 16px 20px; border-radius: 6px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); display: flex; align-items: center; gap: 12px; z-index: 1000;">
        <span style="font-size: 18px;">✓</span>
        <div>
          <div style="font-weight: 500;">Success!</div>
          <div style="font-size: 12px; color: var(--color-textMuted);">Action completed successfully</div>
        </div>
        <button style="background: none; border: none; cursor: pointer; font-size: 20px; margin-left: 8px;">✕</button>
      </div>
    `, { category: 'patterns', tags: ['notification', 'toast'] });
  }
}
