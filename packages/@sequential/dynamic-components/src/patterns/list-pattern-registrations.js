// List pattern registrations - avatars, expandable, etc.
export class PatternListRegistrations {
  static register(registry) {
    registry.register('list-with-avatars', `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--color-backgroundLight); border-radius: 6px;">
          <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--color-primary); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;">A</div>
          <div style="flex: 1;">
            <div style="font-weight: 500;">Item Name</div>
            <div style="font-size: 12px; color: var(--color-textMuted);">Item description</div>
          </div>
          <button style="background: none; border: none; cursor: pointer; font-size: 18px;">•••</button>
        </div>
      </div>
    `, { category: 'patterns', tags: ['list', 'avatar'] });

    registry.register('expandable-list', `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div style="padding: 12px; background: var(--color-backgroundLight); border-radius: 6px; display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
          <span style="font-weight: 500;">Expandable Item</span>
          <span>▼</span>
        </div>
        <div style="padding: 12px; border-left: 2px solid var(--color-primary); margin-left: 12px;">
          <p style="font-size: 14px; margin: 0;">Expanded content appears here</p>
        </div>
      </div>
    `, { category: 'patterns', tags: ['list', 'expandable'] });
  }
}
