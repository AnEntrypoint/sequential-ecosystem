// Search pattern registrations - search bar and results display
export class PatternSearchRegistrations {
  static register(registry) {
    registry.register('search-bar', `
      <div style="display: flex; align-items: center; gap: 8px; padding: 12px; background: var(--color-backgroundLight); border-radius: 24px; border: 1px solid var(--color-border);">
        <span style="color: var(--color-textMuted);">🔍</span>
        <input type="text" placeholder="Search..." style="flex: 1; border: none; background: transparent; outline: none;" />
        <button style="background: none; border: none; cursor: pointer; padding: 4px 8px;">✕</button>
      </div>
    `, { category: 'patterns', tags: ['search', 'input'] });

    registry.register('search-results', `
      <div style="padding: 16px;">
        <div style="font-weight: 600; margin-bottom: 12px;">Search Results</div>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="padding: 12px; border: 1px solid var(--color-border); border-radius: 6px; cursor: pointer;">
            <div style="font-weight: 500;">Result Title</div>
            <div style="font-size: 12px; color: var(--color-textMuted);">Result description goes here</div>
          </div>
        </div>
      </div>
    `, { category: 'patterns', tags: ['search', 'list'] });
  }
}
