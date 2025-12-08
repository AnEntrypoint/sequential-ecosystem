import { PatternLibraryBase } from './pattern-library-base.js';

class FormPatternLibrary extends PatternLibraryBase {
  constructor(themeEngine) {
    super(themeEngine);
    this.registerAllPatterns();
  }

  registerAllPatterns() {
    this.registerLoginForm();
    this.registerRegistrationForm();
    this.registerPasswordResetForm();
    this.registerContactForm();
    this.registerNewsletterSignup();
    this.registerBillingForm();
    this.registerPreferencesForm();
    this.registerProfileForm();
  }

  registerLoginForm() {
    this.patterns.set('login-form', {
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
    });
  }

  registerRegistrationForm() {
    this.patterns.set('registration-form', {
      id: 'registration-form',
      name: 'Registration Form',
      icon: '✍️',
      category: 'forms',
      codeReduction: '82%',
      description: 'Multi-field registration form with validation',
      definition: {
        type: 'flex',
        direction: 'column',
        gap: '20px',
        style: { maxWidth: '450px', margin: '0 auto', padding: '40px 20px' },
        children: [
          {
            type: 'flex',
            direction: 'column',
            gap: '8px',
            children: [
              { type: 'heading', content: 'Create Account', level: 2, style: { margin: 0, fontSize: '28px', fontWeight: '600' } },
              { type: 'paragraph', content: 'Join us today', style: { margin: 0, fontSize: '14px', color: '#666' } }
            ]
          },
          {
            type: 'flex',
            direction: 'column',
            gap: '12px',
            children: [
              {
                type: 'flex',
                direction: 'row',
                gap: '12px',
                children: [
                  {
                    type: 'flex',
                    direction: 'column',
                    gap: '4px',
                    style: { flex: 1 },
                    children: [
                      { type: 'paragraph', content: 'First Name', style: { margin: 0, fontSize: '12px', fontWeight: '600' } },
                      { type: 'input', placeholder: 'John', style: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' } }
                    ]
                  },
                  {
                    type: 'flex',
                    direction: 'column',
                    gap: '4px',
                    style: { flex: 1 },
                    children: [
                      { type: 'paragraph', content: 'Last Name', style: { margin: 0, fontSize: '12px', fontWeight: '600' } },
                      { type: 'input', placeholder: 'Doe', style: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' } }
                    ]
                  }
                ]
              },
              {
                type: 'flex',
                direction: 'column',
                gap: '4px',
                children: [
                  { type: 'paragraph', content: 'Email', style: { margin: 0, fontSize: '12px', fontWeight: '600' } },
                  { type: 'input', placeholder: 'john@example.com', style: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' } }
                ]
              },
              {
                type: 'flex',
                direction: 'column',
                gap: '4px',
                children: [
                  { type: 'paragraph', content: 'Password', style: { margin: 0, fontSize: '12px', fontWeight: '600' } },
                  { type: 'input', placeholder: '••••••••', type: 'password', style: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' } }
                ]
              },
              {
                type: 'flex',
                direction: 'column',
                gap: '4px',
                children: [
                  { type: 'paragraph', content: 'Confirm Password', style: { margin: 0, fontSize: '12px', fontWeight: '600' } },
                  { type: 'input', placeholder: '••••••••', type: 'password', style: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' } }
                ]
              }
            ]
          },
          {
            type: 'flex',
            direction: 'row',
            gap: '8px',
            style: { alignItems: 'center' },
            children: [
              { type: 'input', type: 'checkbox', style: { width: '18px', height: '18px' } },
              { type: 'paragraph', content: 'I agree to the Terms & Conditions', style: { margin: 0, fontSize: '12px', color: '#666' } }
            ]
          },
          {
            type: 'button',
            label: 'Create Account',
            variant: 'primary',
            style: { width: '100%', padding: '12px', background: '#0078d4', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }
          },
          {
            type: 'paragraph',
            content: 'Already have an account? Sign in',
            style: { margin: 0, fontSize: '12px', color: '#0078d4', textAlign: 'center', cursor: 'pointer' }
          }
        ]
      },
      tags: ['authentication', 'user-input', 'validation'],
      author: 'system'
    });
  }

  registerPasswordResetForm() {
    this.patterns.set('password-reset-form', {
      id: 'password-reset-form',
      name: 'Password Reset Form',
      icon: '🔑',
      category: 'forms',
      codeReduction: '78%',
      description: 'Two-step password reset with email verification',
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
              { type: 'heading', content: 'Reset Password', level: 2, style: { margin: 0, fontSize: '28px', fontWeight: '600' } },
              { type: 'paragraph', content: 'Enter your email to receive reset instructions', style: { margin: 0, fontSize: '14px', color: '#666' } }
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
                  { type: 'paragraph', content: 'Email Address', style: { margin: 0, fontSize: '12px', fontWeight: '600' } },
                  { type: 'input', placeholder: 'name@example.com', style: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' } }
                ]
              }
            ]
          },
          {
            type: 'button',
            label: 'Send Reset Link',
            variant: 'primary',
            style: { width: '100%', padding: '12px', background: '#0078d4', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }
          },
          {
            type: 'flex',
            direction: 'row',
            style: { justifyContent: 'space-between' },
            children: [
              { type: 'paragraph', content: 'Remember password?', style: { margin: 0, fontSize: '12px', color: '#0078d4', cursor: 'pointer' } },
              { type: 'paragraph', content: 'Create new account?', style: { margin: 0, fontSize: '12px', color: '#0078d4', cursor: 'pointer' } }
            ]
          },
          {
            type: 'box',
            style: { padding: '12px', background: '#f0f9ff', borderRadius: '6px', borderLeft: '4px solid #0078d4' },
            children: [
              { type: 'paragraph', content: 'Check your email for a link to reset your password. If it doesn\'t appear within a few minutes, check your spam folder.', style: { margin: 0, fontSize: '12px', color: '#333' } }
            ]
          }
        ]
      },
      tags: ['security', 'authentication', 'email'],
      author: 'system'
    });
  }

  registerContactForm() {
    this.patterns.set('contact-form', {
      id: 'contact-form',
      name: 'Contact Form',
      icon: '✉️',
      category: 'forms',
      codeReduction: '80%',
      description: 'Multi-field contact form with textarea for messages',
      definition: {
        type: 'flex',
        direction: 'column',
        gap: '20px',
        style: { maxWidth: '500px', margin: '0 auto', padding: '40px 20px' },
        children: [
          {
            type: 'flex',
            direction: 'column',
            gap: '8px',
            children: [
              { type: 'heading', content: 'Contact Us', level: 2, style: { margin: 0, fontSize: '28px', fontWeight: '600' } },
              { type: 'paragraph', content: 'We\'d love to hear from you', style: { margin: 0, fontSize: '14px', color: '#666' } }
            ]
          },
          {
            type: 'flex',
            direction: 'column',
            gap: '12px',
            children: [
              {
                type: 'flex',
                direction: 'row',
                gap: '12px',
                children: [
                  {
                    type: 'flex',
                    direction: 'column',
                    gap: '4px',
                    style: { flex: 1 },
                    children: [
                      { type: 'paragraph', content: 'First Name', style: { margin: 0, fontSize: '12px', fontWeight: '600' } },
                      { type: 'input', placeholder: 'John', style: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' } }
                    ]
                  },
                  {
                    type: 'flex',
                    direction: 'column',
                    gap: '4px',
                    style: { flex: 1 },
                    children: [
                      { type: 'paragraph', content: 'Last Name', style: { margin: 0, fontSize: '12px', fontWeight: '600' } },
                      { type: 'input', placeholder: 'Doe', style: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' } }
                    ]
                  }
                ]
              },
              {
                type: 'flex',
                direction: 'column',
                gap: '4px',
                children: [
                  { type: 'paragraph', content: 'Email', style: { margin: 0, fontSize: '12px', fontWeight: '600' } },
                  { type: 'input', placeholder: 'john@example.com', style: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' } }
                ]
              },
              {
                type: 'flex',
                direction: 'column',
                gap: '4px',
                children: [
                  { type: 'paragraph', content: 'Subject', style: { margin: 0, fontSize: '12px', fontWeight: '600' } },
                  { type: 'input', placeholder: 'How can we help?', style: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' } }
                ]
              },
              {
                type: 'flex',
                direction: 'column',
                gap: '4px',
                children: [
                  { type: 'paragraph', content: 'Message', style: { margin: 0, fontSize: '12px', fontWeight: '600' } },
                  { type: 'box', style: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', minHeight: '120px', fontSize: '14px', fontFamily: 'inherit' }, children: [
                    { type: 'paragraph', content: 'Your message here...', style: { margin: 0, color: '#999' } }
                  ] }
                ]
              }
            ]
          },
          {
            type: 'button',
            label: 'Send Message',
            variant: 'primary',
            style: { width: '100%', padding: '12px', background: '#0078d4', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }
          }
        ]
      },
      tags: ['communication', 'user-input', 'contact'],
      author: 'system'
    });
  }

  registerNewsletterSignup() {
    this.patterns.set('newsletter-signup', {
      id: 'newsletter-signup',
      name: 'Newsletter Signup',
      icon: '📰',
      category: 'forms',
      codeReduction: '75%',
      description: 'Minimal email signup form for newsletter subscriptions',
      definition: {
        type: 'flex',
        direction: 'column',
        gap: '12px',
        style: { maxWidth: '450px', margin: '0 auto', padding: '20px' },
        children: [
          {
            type: 'flex',
            direction: 'column',
            gap: '4px',
            children: [
              { type: 'heading', content: 'Subscribe to Our Newsletter', level: 3, style: { margin: 0, fontSize: '18px', fontWeight: '600' } },
              { type: 'paragraph', content: 'Get the latest updates delivered to your inbox', style: { margin: 0, fontSize: '13px', color: '#666' } }
            ]
          },
          {
            type: 'flex',
            direction: 'row',
            gap: '8px',
            style: { marginTop: '12px' },
            children: [
              { type: 'input', placeholder: 'Enter your email', style: { flex: 1, padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' } },
              { type: 'button', label: 'Subscribe', variant: 'primary', style: { padding: '10px 20px', background: '#0078d4', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' } }
            ]
          },
          {
            type: 'paragraph',
            content: 'We respect your privacy. Unsubscribe at any time.',
            style: { margin: 0, fontSize: '11px', color: '#999', textAlign: 'center' }
          }
        ]
      },
      tags: ['marketing', 'email', 'subscription'],
      author: 'system'
    });
  }

  registerBillingForm() {
    this.patterns.set('billing-form', {
      id: 'billing-form',
      name: 'Billing Form',
      icon: '💳',
      category: 'forms',
      codeReduction: '88%',
      description: 'Payment and billing information form',
      definition: {
        type: 'flex',
        direction: 'column',
        gap: '20px',
        style: { maxWidth: '500px', margin: '0 auto', padding: '40px 20px' },
        children: [
          {
            type: 'heading',
            content: 'Billing Information',
            level: 2,
            style: { margin: 0, fontSize: '24px', fontWeight: '600' }
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
                  { type: 'paragraph', content: 'Cardholder Name', style: { margin: 0, fontSize: '12px', fontWeight: '600' } },
                  { type: 'input', placeholder: 'John Doe', style: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' } }
                ]
              },
              {
                type: 'flex',
                direction: 'column',
                gap: '4px',
                children: [
                  { type: 'paragraph', content: 'Card Number', style: { margin: 0, fontSize: '12px', fontWeight: '600' } },
                  { type: 'input', placeholder: '4532 1234 5678 9010', style: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', fontFamily: 'monospace' } }
                ]
              },
              {
                type: 'flex',
                direction: 'row',
                gap: '12px',
                children: [
                  {
                    type: 'flex',
                    direction: 'column',
                    gap: '4px',
                    style: { flex: 1 },
                    children: [
                      { type: 'paragraph', content: 'Expiry Date', style: { margin: 0, fontSize: '12px', fontWeight: '600' } },
                      { type: 'input', placeholder: 'MM/YY', style: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' } }
                    ]
                  },
                  {
                    type: 'flex',
                    direction: 'column',
                    gap: '4px',
                    style: { flex: 1 },
                    children: [
                      { type: 'paragraph', content: 'CVV', style: { margin: 0, fontSize: '12px', fontWeight: '600' } },
                      { type: 'input', placeholder: '123', style: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', fontFamily: 'monospace' } }
                    ]
                  }
                ]
              }
            ]
          },
          {
            type: 'button',
            label: 'Complete Payment',
            variant: 'primary',
            style: { width: '100%', padding: '12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }
          }
        ]
      },
      tags: ['payment', 'billing', 'security'],
      author: 'system'
    });
  }

  registerPreferencesForm() {
    this.patterns.set('preferences-form', {
      id: 'preferences-form',
      name: 'Preferences Form',
      icon: '⚙️',
      category: 'forms',
      codeReduction: '80%',
      description: 'User preferences and settings form with toggles and selects',
      definition: {
        type: 'flex',
        direction: 'column',
        gap: '20px',
        style: { maxWidth: '500px', margin: '0 auto', padding: '40px 20px' },
        children: [
          {
            type: 'heading',
            content: 'Preferences',
            level: 2,
            style: { margin: 0, fontSize: '24px', fontWeight: '600' }
          },
          {
            type: 'flex',
            direction: 'column',
            gap: '16px',
            children: [
              {
                type: 'flex',
                direction: 'row',
                style: { justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #eee' },
                children: [
                  {
                    type: 'flex',
                    direction: 'column',
                    gap: '2px',
                    children: [
                      { type: 'paragraph', content: 'Email Notifications', style: { margin: 0, fontSize: '14px', fontWeight: '600' } },
                      { type: 'paragraph', content: 'Receive updates via email', style: { margin: 0, fontSize: '12px', color: '#666' } }
                    ]
                  },
                  { type: 'input', type: 'checkbox', style: { width: '20px', height: '20px' } }
                ]
              },
              {
                type: 'flex',
                direction: 'row',
                style: { justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #eee' },
                children: [
                  {
                    type: 'flex',
                    direction: 'column',
                    gap: '2px',
                    children: [
                      { type: 'paragraph', content: 'Dark Mode', style: { margin: 0, fontSize: '14px', fontWeight: '600' } },
                      { type: 'paragraph', content: 'Use dark theme', style: { margin: 0, fontSize: '12px', color: '#666' } }
                    ]
                  },
                  { type: 'input', type: 'checkbox', style: { width: '20px', height: '20px' } }
                ]
              },
              {
                type: 'flex',
                direction: 'row',
                style: { justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #eee' },
                children: [
                  {
                    type: 'flex',
                    direction: 'column',
                    gap: '2px',
                    children: [
                      { type: 'paragraph', content: 'Language', style: { margin: 0, fontSize: '14px', fontWeight: '600' } },
                      { type: 'paragraph', content: 'Choose your preferred language', style: { margin: 0, fontSize: '12px', color: '#666' } }
                    ]
                  },
                  { type: 'select', options: ['English', 'Spanish', 'French', 'German'], style: { padding: '6px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' } }
                ]
              },
              {
                type: 'flex',
                direction: 'row',
                style: { justifyContent: 'space-between', alignItems: 'center' },
                children: [
                  {
                    type: 'flex',
                    direction: 'column',
                    gap: '2px',
                    children: [
                      { type: 'paragraph', content: 'Timezone', style: { margin: 0, fontSize: '14px', fontWeight: '600' } },
                      { type: 'paragraph', content: 'Set your timezone', style: { margin: 0, fontSize: '12px', color: '#666' } }
                    ]
                  },
                  { type: 'select', options: ['UTC', 'EST', 'CST', 'PST'], style: { padding: '6px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' } }
                ]
              }
            ]
          },
          {
            type: 'flex',
            direction: 'row',
            gap: '12px',
            children: [
              { type: 'button', label: 'Save Preferences', variant: 'primary', style: { flex: 1, padding: '12px', background: '#0078d4', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' } },
              { type: 'button', label: 'Cancel', variant: 'secondary', style: { flex: 1, padding: '12px', background: '#f0f0f0', color: '#333', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' } }
            ]
          }
        ]
      },
      tags: ['settings', 'configuration', 'user-control'],
      author: 'system'
    });
  }

  registerProfileForm() {
    this.patterns.set('profile-form', {
      id: 'profile-form',
      name: 'Profile Form',
      icon: '👤',
      category: 'forms',
      codeReduction: '83%',
      description: 'User profile information form with avatar and bio',
      definition: {
        type: 'flex',
        direction: 'column',
        gap: '24px',
        style: { maxWidth: '500px', margin: '0 auto', padding: '40px 20px' },
        children: [
          {
            type: 'heading',
            content: 'Profile Information',
            level: 2,
            style: { margin: 0, fontSize: '24px', fontWeight: '600' }
          },
          {
            type: 'flex',
            direction: 'column',
            gap: '16px',
            style: { alignItems: 'center' },
            children: [
              {
                type: 'box',
                style: { width: '100px', height: '100px', borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' },
                children: [{ type: 'paragraph', content: '👤', style: { margin: 0 } }]
              },
              {
                type: 'button',
                label: 'Upload Avatar',
                variant: 'secondary',
                style: { padding: '8px 16px', background: '#f0f0f0', color: '#333', border: 'none', borderRadius: '4px', fontSize: '13px', cursor: 'pointer' }
              }
            ]
          },
          {
            type: 'flex',
            direction: 'column',
            gap: '12px',
            children: [
              {
                type: 'flex',
                direction: 'row',
                gap: '12px',
                children: [
                  {
                    type: 'flex',
                    direction: 'column',
                    gap: '4px',
                    style: { flex: 1 },
                    children: [
                      { type: 'paragraph', content: 'First Name', style: { margin: 0, fontSize: '12px', fontWeight: '600' } },
                      { type: 'input', placeholder: 'John', style: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' } }
                    ]
                  },
                  {
                    type: 'flex',
                    direction: 'column',
                    gap: '4px',
                    style: { flex: 1 },
                    children: [
                      { type: 'paragraph', content: 'Last Name', style: { margin: 0, fontSize: '12px', fontWeight: '600' } },
                      { type: 'input', placeholder: 'Doe', style: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' } }
                    ]
                  }
                ]
              },
              {
                type: 'flex',
                direction: 'column',
                gap: '4px',
                children: [
                  { type: 'paragraph', content: 'Email', style: { margin: 0, fontSize: '12px', fontWeight: '600' } },
                  { type: 'input', placeholder: 'john@example.com', style: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' } }
                ]
              },
              {
                type: 'flex',
                direction: 'column',
                gap: '4px',
                children: [
                  { type: 'paragraph', content: 'Bio', style: { margin: 0, fontSize: '12px', fontWeight: '600' } },
                  { type: 'box', style: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', minHeight: '80px', fontSize: '14px' }, children: [
                    { type: 'paragraph', content: 'Tell us about yourself...', style: { margin: 0, color: '#999' } }
                  ] }
                ]
              }
            ]
          },
          {
            type: 'button',
            label: 'Save Profile',
            variant: 'primary',
            style: { width: '100%', padding: '12px', background: '#0078d4', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }
          }
        ]
      },
      tags: ['user', 'profile', 'settings'],
      author: 'system'
    });
  }

}

function createFormPatternLibrary(themeEngine) {
  return new FormPatternLibrary(themeEngine);
}

export { FormPatternLibrary, createFormPatternLibrary };
