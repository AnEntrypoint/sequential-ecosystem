// Authentication pattern registrations - login and signup forms
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
