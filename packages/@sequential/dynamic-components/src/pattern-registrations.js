// Pattern registration methods split by pattern type
export class PatternAuthRegistrations {
  static register(registry) {
    registry.register('login-form', `
      <div style="max-width: 400px; margin: 0 auto; padding: 32px;">
        <h2>Login</h2>
        <form style="display: flex; flex-direction: column; gap: 16px;">
          <input type="email" placeholder="Email" required />
          <input type="password" placeholder="Password" required />
          <button type="submit" style="background: var(--color-primary); color: white; padding: 12px; border-radius: 6px; border: none; cursor: pointer;">Sign In</button>
          <p style="text-align: center; font-size: 14px;">
            Don't have an account? <a href="#signup" style="color: var(--color-primary);">Sign up</a>
          </p>
        </form>
      </div>
    `, { category: 'patterns', tags: ['auth', 'form'] });

    registry.register('signup-form', `
      <div style="max-width: 400px; margin: 0 auto; padding: 32px;">
        <h2>Create Account</h2>
        <form style="display: flex; flex-direction: column; gap: 16px;">
          <input type="text" placeholder="Full Name" required />
          <input type="email" placeholder="Email" required />
          <input type="password" placeholder="Password" required />
          <input type="password" placeholder="Confirm Password" required />
          <button type="submit" style="background: var(--color-primary); color: white; padding: 12px; border-radius: 6px; border: none; cursor: pointer;">Create Account</button>
        </form>
      </div>
    `, { category: 'patterns', tags: ['auth', 'form'] });
  }
}

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
