export class ExtendedPatternLibrary {
  constructor(registry, themeEngine) {
    this.registry = registry;
    this.theme = themeEngine;
  }

  registerAllPatterns() {
    this.registerECommercePatterns();
    this.registerSaaSPatterns();
    this.registerAdminPatterns();
    this.registerDashboardPatterns();
    this.registerMarketingPatterns();
  }

  registerECommercePatterns() {
    this.registerProductCard();
    this.registerProductGrid();
    this.registerShoppingCart();
    this.registerCheckoutForm();
    this.registerProductReview();
    this.registerCategoryFilter();
  }

  registerProductCard() {
    this.registry.register('product-card', {
      type: 'card',
      variant: 'elevated',
      children: [
        {
          type: 'image',
          src: 'https://via.placeholder.com/300x200',
          alt: 'Product',
          style: { width: '100%', height: '200px', objectFit: 'cover' }
        },
        {
          type: 'flex',
          direction: 'column',
          gap: '8px',
          style: { padding: '12px' },
          children: [
            { type: 'heading', content: 'Product Name', level: 3, style: { margin: 0, fontSize: '16px' } },
            {
              type: 'flex',
              direction: 'row',
              gap: '4px',
              children: [
                { type: 'paragraph', content: '⭐⭐⭐⭐⭐', style: { margin: 0, fontSize: '12px' } },
                { type: 'paragraph', content: '(128 reviews)', style: { margin: 0, fontSize: '11px', color: '#999' } }
              ]
            },
            {
              type: 'flex',
              direction: 'row',
              gap: '8px',
              children: [
                { type: 'heading', content: '$99.99', level: 4, style: { margin: 0, fontSize: '14px', color: '#10b981' } },
                { type: 'paragraph', content: '$129.99', style: { margin: 0, fontSize: '12px', textDecoration: 'line-through', color: '#999' } }
              ]
            },
            {
              type: 'button',
              label: 'Add to Cart',
              variant: 'primary',
              style: { width: '100%', marginTop: '8px' }
            }
          ]
        }
      ]
    }, { category: 'ecommerce', codeReduction: '85%' });
  }

  registerProductGrid() {
    this.registry.register('product-grid', {
      type: 'grid',
      cols: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: this.theme.getSpacing('lg'),
      children: [
        { type: 'text', content: 'Product Card 1' },
        { type: 'text', content: 'Product Card 2' },
        { type: 'text', content: 'Product Card 3' },
        { type: 'text', content: 'Product Card 4' }
      ]
    }, { category: 'ecommerce', codeReduction: '80%' });
  }

  registerShoppingCart() {
    this.registry.register('shopping-cart', {
      type: 'flex',
      direction: 'column',
      gap: this.theme.getSpacing('lg'),
      children: [
        {
          type: 'flex',
          direction: 'row',
          style: { justifyContent: 'space-between', padding: this.theme.getSpacing('md'), background: this.theme.getColor('backgroundLight') },
          children: [
            { type: 'paragraph', content: 'Product', style: { fontWeight: '600', margin: 0 } },
            { type: 'paragraph', content: 'Quantity', style: { fontWeight: '600', margin: 0 } },
            { type: 'paragraph', content: 'Price', style: { fontWeight: '600', margin: 0 } }
          ]
        },
        {
          type: 'card',
          variant: 'flat',
          children: [
            {
              type: 'flex',
              direction: 'row',
              style: { justifyContent: 'space-between' },
              children: [
                { type: 'paragraph', content: 'Item 1', style: { margin: 0 } },
                { type: 'paragraph', content: '1', style: { margin: 0 } },
                { type: 'paragraph', content: '$99.99', style: { margin: 0, fontWeight: '600' } }
              ]
            }
          ]
        },
        {
          type: 'flex',
          direction: 'row',
          style: { justifyContent: 'space-between', padding: this.theme.getSpacing('md'), borderTop: `1px solid ${this.theme.getColor('border')}` },
          children: [
            { type: 'paragraph', content: 'Total:', style: { fontWeight: '600', margin: 0 } },
            { type: 'heading', content: '$99.99', level: 3, style: { margin: 0 } }
          ]
        }
      ]
    }, { category: 'ecommerce', codeReduction: '90%' });
  }

  registerCheckoutForm() {
    this.registry.register('checkout-form', {
      type: 'card',
      variant: 'elevated',
      style: { maxWidth: '600px', margin: '0 auto', padding: this.theme.getSpacing('lg') },
      children: [
        { type: 'heading', content: 'Checkout', level: 2, style: { margin: 0, marginBottom: this.theme.getSpacing('lg') } },
        {
          type: 'flex',
          direction: 'column',
          gap: this.theme.getSpacing('md'),
          children: [
            {
              type: 'flex',
              direction: 'column',
              gap: this.theme.getSpacing('sm'),
              children: [
                { type: 'paragraph', content: 'Billing Address', style: { fontSize: '12px', fontWeight: '600', margin: 0 } },
                { type: 'input', placeholder: 'Street Address' },
                {
                  type: 'flex',
                  direction: 'row',
                  gap: this.theme.getSpacing('sm'),
                  children: [
                    { type: 'input', placeholder: 'City', style: { flex: 1 } },
                    { type: 'input', placeholder: 'State', style: { flex: 0.5 } },
                    { type: 'input', placeholder: 'ZIP', style: { flex: 0.5 } }
                  ]
                }
              ]
            },
            {
              type: 'flex',
              direction: 'column',
              gap: this.theme.getSpacing('sm'),
              children: [
                { type: 'paragraph', content: 'Payment Method', style: { fontSize: '12px', fontWeight: '600', margin: 0 } },
                { type: 'input', placeholder: 'Card Number' },
                {
                  type: 'flex',
                  direction: 'row',
                  gap: this.theme.getSpacing('sm'),
                  children: [
                    { type: 'input', placeholder: 'MM/YY', style: { flex: 1 } },
                    { type: 'input', placeholder: 'CVC', style: { flex: 1 } }
                  ]
                }
              ]
            },
            {
              type: 'button',
              label: 'Complete Purchase',
              variant: 'primary',
              style: { width: '100%', marginTop: this.theme.getSpacing('md') }
            }
          ]
        }
      ]
    }, { category: 'ecommerce', codeReduction: '92%' });
  }

  registerProductReview() {
    this.registry.register('product-review', {
      type: 'card',
      variant: 'flat',
      children: [
        {
          type: 'flex',
          direction: 'row',
          gap: this.theme.getSpacing('md'),
          children: [
            {
              type: 'box',
              style: {
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: this.theme.getColor('primary')
              }
            },
            {
              type: 'flex',
              direction: 'column',
              gap: this.theme.getSpacing('xs'),
              style: { flex: 1 },
              children: [
                {
                  type: 'flex',
                  direction: 'row',
                  style: { justifyContent: 'space-between' },
                  children: [
                    { type: 'heading', content: 'John Doe', level: 4, style: { margin: 0 } },
                    { type: 'paragraph', content: '⭐⭐⭐⭐⭐', style: { margin: 0 } }
                  ]
                },
                { type: 'paragraph', content: 'Excellent product! Highly recommend.', style: { margin: 0, fontSize: '14px' } },
                { type: 'paragraph', content: '2 days ago', style: { margin: 0, fontSize: '11px', color: this.theme.getColor('textMuted') } }
              ]
            }
          ]
        }
      ]
    }, { category: 'ecommerce', codeReduction: '80%' });
  }

  registerCategoryFilter() {
    this.registry.register('category-filter', {
      type: 'card',
      variant: 'flat',
      children: [
        { type: 'heading', content: 'Categories', level: 3, style: { margin: 0, marginBottom: this.theme.getSpacing('md') } },
        {
          type: 'flex',
          direction: 'column',
          gap: this.theme.getSpacing('sm'),
          children: [
            { type: 'button', label: 'Electronics', variant: 'secondary', style: { width: '100%', textAlign: 'left' } },
            { type: 'button', label: 'Clothing', variant: 'secondary', style: { width: '100%', textAlign: 'left' } },
            { type: 'button', label: 'Books', variant: 'secondary', style: { width: '100%', textAlign: 'left' } },
            { type: 'button', label: 'Home & Garden', variant: 'secondary', style: { width: '100%', textAlign: 'left' } }
          ]
        }
      ]
    }, { category: 'ecommerce', codeReduction: '85%' });
  }

  registerSaaSPatterns() {
    this.registerPricingTable();
    this.registerFeatureComparison();
    this.registerUpgradePrompt();
    this.registerSubscriptionStatus();
    this.registerUsageMetrics();
    this.registerTeamMemberList();
  }

  registerPricingTable() {
    this.registry.register('pricing-table', {
      type: 'grid',
      cols: 'repeat(3, 1fr)',
      gap: this.theme.getSpacing('lg'),
      children: [
        { type: 'text', content: 'Plan 1' },
        { type: 'text', content: 'Plan 2' },
        { type: 'text', content: 'Plan 3' }
      ]
    }, { category: 'saas', codeReduction: '88%' });
  }

  registerFeatureComparison() {
    this.registry.register('feature-comparison', {
      type: 'card',
      variant: 'flat',
      children: [
        {
          type: 'flex',
          direction: 'column',
          gap: this.theme.getSpacing('sm'),
          children: [
            { type: 'paragraph', content: '✅ Feature 1', style: { margin: 0 } },
            { type: 'paragraph', content: '✅ Feature 2', style: { margin: 0 } },
            { type: 'paragraph', content: '❌ Feature 3', style: { margin: 0, color: '#999' } }
          ]
        }
      ]
    }, { category: 'saas', codeReduction: '75%' });
  }

  registerUpgradePrompt() {
    this.registry.register('upgrade-prompt', {
      type: 'card',
      variant: 'elevated',
      style: { padding: this.theme.getSpacing('lg'), background: this.theme.getColor('primary') },
      children: [
        { type: 'heading', content: 'Upgrade Your Plan', level: 2, style: { margin: 0, marginBottom: this.theme.getSpacing('md'), color: 'white' } },
        { type: 'paragraph', content: 'Get unlimited access to all features', style: { color: '#ddd', marginBottom: this.theme.getSpacing('md'), margin: 0 } },
        {
          type: 'button',
          label: 'Upgrade Now',
          variant: 'primary',
          style: { width: '100%' }
        }
      ]
    }, { category: 'saas', codeReduction: '80%' });
  }

  registerSubscriptionStatus() {
    this.registry.register('subscription-status', {
      type: 'card',
      variant: 'flat',
      children: [
        {
          type: 'flex',
          direction: 'row',
          style: { justifyContent: 'space-between', marginBottom: this.theme.getSpacing('md') },
          children: [
            { type: 'paragraph', content: 'Active Plan: Pro', style: { margin: 0, fontWeight: '600' } },
            { type: 'box', style: { background: '#10b981', color: 'white', padding: '4px 8px', borderRadius: '4px' }, children: [{ type: 'paragraph', content: 'Active', style: { margin: 0, fontSize: '12px' } }] }
          ]
        },
        {
          type: 'flex',
          direction: 'column',
          gap: this.theme.getSpacing('sm'),
          children: [
            { type: 'paragraph', content: 'Renewal Date: Dec 31, 2025', style: { margin: 0, fontSize: '12px' } },
            { type: 'paragraph', content: 'Billing: Monthly @ $99/month', style: { margin: 0, fontSize: '12px' } }
          ]
        }
      ]
    }, { category: 'saas', codeReduction: '85%' });
  }

  registerUsageMetrics() {
    this.registry.register('usage-metrics', {
      type: 'grid',
      cols: 'repeat(2, 1fr)',
      gap: this.theme.getSpacing('lg'),
      children: [
        { type: 'text', content: 'API Calls: 45,234 / 100,000' },
        { type: 'text', content: 'Storage: 2.5GB / 10GB' }
      ]
    }, { category: 'saas', codeReduction: '80%' });
  }

  registerTeamMemberList() {
    this.registry.register('team-member-list', {
      type: 'card',
      variant: 'flat',
      children: [
        { type: 'heading', content: 'Team Members', level: 3, style: { margin: 0, marginBottom: this.theme.getSpacing('md') } },
        {
          type: 'flex',
          direction: 'column',
          gap: this.theme.getSpacing('sm'),
          children: [
            {
              type: 'flex',
              direction: 'row',
              gap: this.theme.getSpacing('md'),
              style: { padding: this.theme.getSpacing('sm'), background: this.theme.getColor('background'), borderRadius: '4px' },
              children: [
                { type: 'box', style: { width: '32px', height: '32px', borderRadius: '50%', background: this.theme.getColor('primary') } },
                {
                  type: 'flex',
                  direction: 'column',
                  style: { flex: 1 },
                  children: [
                    { type: 'paragraph', content: 'John Doe', style: { margin: 0, fontWeight: '600', fontSize: '12px' } },
                    { type: 'paragraph', content: 'john@example.com', style: { margin: 0, fontSize: '11px', color: this.theme.getColor('textMuted') } }
                  ]
                },
                { type: 'paragraph', content: 'Admin', style: { margin: 0, fontSize: '12px' } }
              ]
            }
          ]
        }
      ]
    }, { category: 'saas', codeReduction: '85%' });
  }

  registerAdminPatterns() {
    this.registerDataTable();
    this.registerBulkActions();
    this.registerUserForm();
    this.registerPermissionsMatrix();
    this.registerAuditLog();
    this.registerSystemStatus();
  }

  registerDataTable() {
    this.registry.register('data-table', {
      type: 'card',
      variant: 'flat',
      children: [
        {
          type: 'flex',
          direction: 'column',
          gap: this.theme.getSpacing('sm'),
          children: [
            {
              type: 'flex',
              direction: 'row',
              style: { padding: this.theme.getSpacing('md'), background: this.theme.getColor('backgroundLight'), fontWeight: '600' },
              children: [
                { type: 'paragraph', content: 'Name', style: { flex: 1, margin: 0 } },
                { type: 'paragraph', content: 'Email', style: { flex: 1, margin: 0 } },
                { type: 'paragraph', content: 'Status', style: { flex: 1, margin: 0 } },
                { type: 'paragraph', content: 'Actions', style: { flex: 0.5, margin: 0 } }
              ]
            }
          ]
        }
      ]
    }, { category: 'admin', codeReduction: '90%' });
  }

  registerBulkActions() {
    this.registry.register('bulk-actions', {
      type: 'flex',
      direction: 'row',
      gap: this.theme.getSpacing('md'),
      style: { padding: this.theme.getSpacing('md'), background: this.theme.getColor('backgroundLight') },
      children: [
        { type: 'input', placeholder: 'Select items...', style: { flex: 1 } },
        { type: 'button', label: 'Delete', variant: 'danger', style: { padding: this.theme.getSpacing('md') } },
        { type: 'button', label: 'Archive', variant: 'secondary', style: { padding: this.theme.getSpacing('md') } },
        { type: 'button', label: 'Export', variant: 'secondary', style: { padding: this.theme.getSpacing('md') } }
      ]
    }, { category: 'admin', codeReduction: '85%' });
  }

  registerUserForm() {
    this.registry.register('user-form', {
      type: 'card',
      variant: 'elevated',
      style: { maxWidth: '500px', padding: this.theme.getSpacing('lg') },
      children: [
        { type: 'heading', content: 'User Profile', level: 2, style: { margin: 0, marginBottom: this.theme.getSpacing('lg') } },
        {
          type: 'flex',
          direction: 'column',
          gap: this.theme.getSpacing('md'),
          children: [
            { type: 'input', placeholder: 'Full Name' },
            { type: 'input', placeholder: 'Email' },
            { type: 'select', options: [{ label: 'Admin', value: 'admin' }, { label: 'User', value: 'user' }] },
            { type: 'button', label: 'Save Changes', variant: 'primary', style: { width: '100%' } }
          ]
        }
      ]
    }, { category: 'admin', codeReduction: '88%' });
  }

  registerPermissionsMatrix() {
    this.registry.register('permissions-matrix', {
      type: 'card',
      variant: 'flat',
      children: [
        { type: 'heading', content: 'Permissions', level: 3, style: { margin: 0, marginBottom: this.theme.getSpacing('md') } },
        {
          type: 'flex',
          direction: 'column',
          gap: this.theme.getSpacing('sm'),
          children: [
            { type: 'paragraph', content: '☑ Read', style: { margin: 0 } },
            { type: 'paragraph', content: '☑ Write', style: { margin: 0 } },
            { type: 'paragraph', content: '☐ Delete', style: { margin: 0 } },
            { type: 'paragraph', content: '☐ Admin', style: { margin: 0 } }
          ]
        }
      ]
    }, { category: 'admin', codeReduction: '80%' });
  }

  registerAuditLog() {
    this.registry.register('audit-log', {
      type: 'card',
      variant: 'flat',
      children: [
        { type: 'heading', content: 'Activity Log', level: 3, style: { margin: 0, marginBottom: this.theme.getSpacing('md') } },
        {
          type: 'flex',
          direction: 'column',
          gap: this.theme.getSpacing('sm'),
          children: [
            { type: 'paragraph', content: '10:32 AM - User login', style: { margin: 0, fontSize: '12px' } },
            { type: 'paragraph', content: '10:15 AM - Settings updated', style: { margin: 0, fontSize: '12px' } },
            { type: 'paragraph', content: '9:45 AM - Report generated', style: { margin: 0, fontSize: '12px' } }
          ]
        }
      ]
    }, { category: 'admin', codeReduction: '85%' });
  }

  registerSystemStatus() {
    this.registry.register('system-status', {
      type: 'grid',
      cols: 'repeat(2, 1fr)',
      gap: this.theme.getSpacing('lg'),
      children: [
        { type: 'text', content: 'API Status: ✅ Operational' },
        { type: 'text', content: 'Database: ✅ Healthy' }
      ]
    }, { category: 'admin', codeReduction: '75%' });
  }

  registerDashboardPatterns() {
    this.registerKPICard();
    this.registerTrendChart();
    this.registerDataWidget();
  }

  registerKPICard() {
    this.registry.register('kpi-card', {
      type: 'card',
      variant: 'elevated',
      style: { padding: this.theme.getSpacing('lg') },
      children: [
        { type: 'paragraph', content: 'Total Revenue', style: { fontSize: '12px', color: this.theme.getColor('textMuted'), margin: 0 } },
        { type: 'heading', content: '$125,450', level: 2, style: { margin: 0, marginBottom: this.theme.getSpacing('xs'), color: this.theme.getColor('primary') } },
        { type: 'paragraph', content: '+12.5% vs last month', style: { fontSize: '12px', color: '#10b981', margin: 0 } }
      ]
    }, { category: 'dashboard', codeReduction: '85%' });
  }

  registerTrendChart() {
    this.registry.register('trend-chart', {
      type: 'card',
      variant: 'flat',
      children: [
        { type: 'heading', content: 'Weekly Trend', level: 3, style: { margin: 0, marginBottom: this.theme.getSpacing('md') } },
        { type: 'box', style: { background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.2) 0%, transparent 100%)', height: '150px', borderRadius: '4px' } }
      ]
    }, { category: 'dashboard', codeReduction: '80%' });
  }

  registerDataWidget() {
    this.registry.register('data-widget', {
      type: 'card',
      variant: 'flat',
      children: [
        {
          type: 'flex',
          direction: 'row',
          style: { justifyContent: 'space-between', marginBottom: this.theme.getSpacing('md') },
          children: [
            { type: 'paragraph', content: 'Active Users', style: { margin: 0, fontWeight: '600' } },
            { type: 'paragraph', content: '2,543', style: { margin: 0, fontSize: '18px', color: this.theme.getColor('primary') } }
          ]
        },
        { type: 'paragraph', content: 'Last updated: 5 minutes ago', style: { margin: 0, fontSize: '11px', color: this.theme.getColor('textMuted') } }
      ]
    }, { category: 'dashboard', codeReduction: '80%' });
  }

  registerMarketingPatterns() {
    this.registerHeroSection();
    this.registerFeatureHighlight();
    this.registerCTA();
  }

  registerHeroSection() {
    this.registry.register('hero-section', {
      type: 'box',
      style: {
        padding: this.theme.getSpacing('xl'),
        background: `linear-gradient(135deg, ${this.theme.getColor('primary')} 0%, #065f46 100%)`,
        color: 'white',
        textAlign: 'center'
      },
      children: [
        { type: 'heading', content: 'Welcome to Our Platform', level: 1, style: { margin: 0, marginBottom: this.theme.getSpacing('md'), color: 'white' } },
        { type: 'paragraph', content: 'Build amazing products faster', style: { margin: 0, fontSize: '18px', marginBottom: this.theme.getSpacing('lg') } },
        { type: 'button', label: 'Get Started', variant: 'primary', style: { padding: this.theme.getSpacing('md') } }
      ]
    }, { category: 'marketing', codeReduction: '90%' });
  }

  registerFeatureHighlight() {
    this.registry.register('feature-highlight', {
      type: 'grid',
      cols: 'repeat(3, 1fr)',
      gap: this.theme.getSpacing('lg'),
      style: { padding: this.theme.getSpacing('lg') },
      children: [
        { type: 'text', content: '✨ Feature 1' },
        { type: 'text', content: '🚀 Feature 2' },
        { type: 'text', content: '💡 Feature 3' }
      ]
    }, { category: 'marketing', codeReduction: '85%' });
  }

  registerCTA() {
    this.registry.register('call-to-action', {
      type: 'card',
      variant: 'elevated',
      style: { padding: this.theme.getSpacing('lg'), textAlign: 'center' },
      children: [
        { type: 'heading', content: 'Ready to Get Started?', level: 2, style: { margin: 0, marginBottom: this.theme.getSpacing('md') } },
        {
          type: 'flex',
          direction: 'row',
          gap: this.theme.getSpacing('md'),
          style: { justifyContent: 'center' },
          children: [
            { type: 'button', label: 'Sign Up Free', variant: 'primary' },
            { type: 'button', label: 'Learn More', variant: 'secondary' }
          ]
        }
      ]
    }, { category: 'marketing', codeReduction: '88%' });
  }
}

export const createExtendedPatternLibrary = (registry, theme) =>
  new ExtendedPatternLibrary(registry, theme);

export default ExtendedPatternLibrary;
