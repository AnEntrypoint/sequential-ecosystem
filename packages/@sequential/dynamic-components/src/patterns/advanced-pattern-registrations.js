// Advanced pattern registrations - filters, timelines, wizards
export class PatternAdvancedRegistrations {
  static register(registry) {
    registry.register('filter-panel', `
      <div style="padding: 16px; background: var(--color-backgroundLight); border-radius: 8px;">
        <h3 style="margin: 0 0 16px 0;">Filters</h3>
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div>
            <label style="display: block; margin-bottom: 8px; font-weight: 500; font-size: 14px;">Category</label>
            <select style="width: 100%; padding: 8px; border: 1px solid var(--color-border); border-radius: 6px;">
              <option>All</option>
              <option>Category 1</option>
              <option>Category 2</option>
            </select>
          </div>
          <div>
            <label style="display: block; margin-bottom: 8px; font-weight: 500; font-size: 14px;">Sort By</label>
            <select style="width: 100%; padding: 8px; border: 1px solid var(--color-border); border-radius: 6px;">
              <option>Newest</option>
              <option>Oldest</option>
              <option>Popular</option>
            </select>
          </div>
          <button style="background: var(--color-primary); color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer;">Apply Filters</button>
        </div>
      </div>
    `, { category: 'patterns', tags: ['filter', 'advanced'] });

    registry.register('timeline', `
      <div style="padding: 20px; position: relative;">
        <div style="position: absolute; left: 20px; top: 0; bottom: 0; width: 2px; background: var(--color-border);"></div>
        <div style="margin-left: 40px; display: flex; flex-direction: column; gap: 24px;">
          <div>
            <div style="position: absolute; left: 12px; width: 16px; height: 16px; background: var(--color-primary); border-radius: 50%; margin-top: 2px;"></div>
            <div style="font-weight: 600; margin-bottom: 4px;">Event Title</div>
            <div style="font-size: 12px; color: var(--color-textMuted);">Event description</div>
          </div>
        </div>
      </div>
    `, { category: 'patterns', tags: ['timeline', 'chronological'] });

    registry.register('wizard-stepper', `
      <div style="display: flex; gap: 16px; align-items: center; padding: 20px;">
        <div style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: var(--color-primary); color: white; font-weight: 600;">1</div>
        <div style="flex: 1; height: 2px; background: var(--color-border);"></div>
        <div style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: var(--color-backgroundLight); color: var(--color-textMuted); font-weight: 600;">2</div>
        <div style="flex: 1; height: 2px; background: var(--color-border);"></div>
        <div style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: var(--color-backgroundLight); color: var(--color-textMuted); font-weight: 600;">3</div>
      </div>
    `, { category: 'patterns', tags: ['wizard', 'stepper'] });
  }
}
