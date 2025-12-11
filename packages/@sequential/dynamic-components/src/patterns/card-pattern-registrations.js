// Card pattern registrations - cards with images, badges, stats
export class PatternCardRegistrations {
  static register(registry) {
    registry.register('card-with-image', `
      <div style="border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden; background: white;">
        <div style="height: 200px; background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); display: flex; align-items: center; justify-content: center; color: white;">Image/Media</div>
        <div style="padding: 16px;">
          <h3 style="margin: 0 0 8px 0;">Card Title</h3>
          <p style="margin: 0; font-size: 14px; color: var(--color-textMuted);">Card description goes here</p>
          <button style="margin-top: 12px; background: var(--color-primary); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">Action</button>
        </div>
      </div>
    `, { category: 'patterns', tags: ['card', 'image'] });

    registry.register('card-with-badge', `
      <div style="border: 1px solid var(--color-border); border-radius: 8px; padding: 16px; position: relative; background: white;">
        <div style="position: absolute; top: 12px; right: 12px; background: var(--color-success); color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px;">New</div>
        <h3 style="margin: 0 0 8px 0;">Card Title</h3>
        <p style="margin: 0; font-size: 14px; color: var(--color-textMuted);">Card with badge indicator</p>
      </div>
    `, { category: 'patterns', tags: ['card', 'badge'] });

    registry.register('stat-card-detailed', `
      <div style="padding: 20px; background: var(--color-backgroundLight); border-radius: 8px; border-left: 4px solid var(--color-primary);">
        <div style="font-size: 12px; color: var(--color-textMuted); margin-bottom: 8px;">METRIC LABEL</div>
        <div style="font-size: 32px; font-weight: 700; color: var(--color-primary); margin-bottom: 8px;">1,234</div>
        <div style="font-size: 12px; color: var(--color-success);">↑ 12% from last month</div>
      </div>
    `, { category: 'patterns', tags: ['stat', 'metric'] });
  }
}
