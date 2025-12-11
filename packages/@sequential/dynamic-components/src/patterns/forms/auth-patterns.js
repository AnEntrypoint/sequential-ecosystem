export const loginForm = {
  id: 'login-form',
  name: 'Login Form',
  icon: '🔐',
  category: 'forms',
  codeReduction: '85%',
  description: 'Classic login form with email and password fields',
  definition: {
    type: 'flex',
    direction: 'column',
    gap: '20px',
    style: { maxWidth: '400px', margin: '0 auto', padding: '40px 20px' },
    children: [
      {
        type: 'flex',
        direction: 'column',
        gap: '8px',
        children: [
          { type: 'heading', content: 'Sign In', level: 2, style: { margin: 0, fontSize: '28px', fontWeight: '600' } },
          { type: 'paragraph', content: 'Welcome back', style: { margin: 0, fontSize: '14px', color: '#666' } }
        ]
      },
      {
        type: 'flex',
        direction: 'column',
        gap: '12px',
        children: [
          {
            type: 'flex',
            direction: 'column',
            gap: '4px',
            children: [
              { type: 'paragraph', content: 'Email', style: { margin: 0, fontSize: '12px', fontWeight: '600', color: '#333' } },
              { type: 'input', placeholder: 'name@example.com', style: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' } }
            ]
          },
          {
            type: 'flex',
            direction: 'column',
            gap: '4px',
            children: [
              { type: 'paragraph', content: 'Password', style: { margin: 0, fontSize: '12px', fontWeight: '600', color: '#333' } },
              { type: 'input', placeholder: '••••••••', type: 'password', style: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' } }
            ]
          }
        ]
      },
      {
        type: 'button',
        label: 'Sign In',
        variant: 'primary',
        style: { width: '100%', padding: '12px', background: '#0078d4', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }
      },
      {
        type: 'flex',
        direction: 'row',
        style: { justifyContent: 'space-between', alignItems: 'center' },
        children: [
          { type: 'paragraph', content: 'Forgot password?', style: { margin: 0, fontSize: '12px', color: '#0078d4', cursor: 'pointer' } },
          { type: 'paragraph', content: 'No account? Sign up', style: { margin: 0, fontSize: '12px', color: '#0078d4', cursor: 'pointer' } }
        ]
      }
    ]
  },
  tags: ['authentication', 'user-input', 'security'],
  author: 'system'
};

export const registrationForm = {
  id: 'registration-form',
  name: 'Registration Form',
  icon: '✍️',
  category: 'forms',
  codeReduction: '82%',
  description: 'Multi-field registration form with validation',
  tags: ['authentication', 'user-input', 'validation'],
  author: 'system'
};

export const passwordResetForm = {
  id: 'password-reset-form',
  name: 'Password Reset Form',
  icon: '🔑',
  category: 'forms',
  codeReduction: '78%',
  description: 'Two-step password reset with email verification',
  tags: ['security', 'authentication', 'email'],
  author: 'system'
};

export const authPatterns = [loginForm, registrationForm, passwordResetForm];
