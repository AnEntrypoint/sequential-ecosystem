export const billingForm = {
  id: 'billing-form',
  name: 'Billing Form',
  icon: '💳',
  category: 'forms',
  codeReduction: '88%',
  description: 'Payment and billing information form',
  tags: ['payment', 'billing', 'security'],
  author: 'system'
};

export const preferencesForm = {
  id: 'preferences-form',
  name: 'Preferences Form',
  icon: '⚙️',
  category: 'forms',
  codeReduction: '80%',
  description: 'User preferences and settings form with toggles and selects',
  tags: ['settings', 'configuration', 'user-control'],
  author: 'system'
};

export const profileForm = {
  id: 'profile-form',
  name: 'Profile Form',
  icon: '👤',
  category: 'forms',
  codeReduction: '83%',
  description: 'User profile information form with avatar and bio',
  tags: ['user', 'profile', 'settings'],
  author: 'system'
};

export const accountPatterns = [billingForm, preferencesForm, profileForm];
