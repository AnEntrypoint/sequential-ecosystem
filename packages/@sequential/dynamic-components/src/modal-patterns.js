import { PatternLibraryBase } from './pattern-library-base.js';

class ModalPatternLibrary extends PatternLibraryBase {
  constructor() {
    super(null);
    this.registerAllPatterns();
  }

  registerAllPatterns() {
    this.registerAlertModal();
    this.registerConfirmModal();
    this.registerCustomModal();
    this.registerToastNotification();
    this.registerDropdownMenu();
    this.registerSidePanel();
  }

  registerAlertModal() {
    this.patterns.set('alert-modal', {
      id: 'alert-modal',
      name: 'Alert Modal',
      icon: '⚠️',
      category: 'modals',
      codeReduction: '85%',
      description: 'Simple alert dialog for displaying messages to users',
      definition: {
        type: 'box',
        style: {
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        },
        children: [
          {
            type: 'flex',
            direction: 'column',
            gap: '16px',
            style: {
              background: '#fff',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '400px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
            },
            children: [
              {
                type: 'flex',
                direction: 'row',
                gap: '12px',
                style: { alignItems: 'flex-start' },
                children: [
                  { type: 'box', style: { fontSize: '24px', marginTop: '2px' }, children: [{ type: 'paragraph', content: '⚠️', style: { margin: 0 } }] },
                  {
                    type: 'flex',
                    direction: 'column',
                    gap: '4px',
                    style: { flex: 1 },
                    children: [
                      { type: 'heading', content: 'Alert', level: 3, style: { margin: 0, fontSize: '18px' } },
                      { type: 'paragraph', content: 'This is an important message that requires your attention.', style: { margin: 0, fontSize: '14px', color: '#666' } }
                    ]
                  }
                ]
              },
              {
                type: 'flex',
                direction: 'row',
                gap: '12px',
                justifyContent: 'flex-end',
                children: [
                  { type: 'button', label: 'OK', variant: 'primary', style: { padding: '10px 20px', background: '#0078d4', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' } }
                ]
              }
            ]
          }
        ]
      },
      tags: ['modal', 'alert', 'notification', 'message'],
      author: 'system'
    });
  }

  registerConfirmModal() {
    this.patterns.set('confirm-modal', {
      id: 'confirm-modal',
      name: 'Confirm Modal',
      icon: '❓',
      category: 'modals',
      codeReduction: '84%',
      description: 'Confirmation dialog with yes/no or confirm/cancel actions',
      definition: {
        type: 'box',
        style: {
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        },
        children: [
          {
            type: 'flex',
            direction: 'column',
            gap: '16px',
            style: {
              background: '#fff',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '420px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
            },
            children: [
              {
                type: 'flex',
                direction: 'column',
                gap: '8px',
                children: [
                  { type: 'heading', content: 'Confirm Action', level: 3, style: { margin: 0, fontSize: '18px' } },
                  { type: 'paragraph', content: 'Are you sure you want to delete this item? This action cannot be undone.', style: { margin: 0, fontSize: '14px', color: '#666', lineHeight: '1.5' } }
                ]
              },
              {
                type: 'flex',
                direction: 'row',
                gap: '12px',
                justifyContent: 'flex-end',
                children: [
                  { type: 'button', label: 'Cancel', variant: 'secondary', style: { padding: '10px 20px', background: '#e0e0e0', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' } },
                  { type: 'button', label: 'Delete', variant: 'primary', style: { padding: '10px 20px', background: '#d13438', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' } }
                ]
              }
            ]
          }
        ]
      },
      tags: ['modal', 'confirm', 'dialog', 'action'],
      author: 'system'
    });
  }

  registerCustomModal() {
    this.patterns.set('custom-modal', {
      id: 'custom-modal',
      name: 'Custom Modal',
      icon: '📦',
      category: 'modals',
      codeReduction: '82%',
      description: 'Flexible modal for custom content with header, body, and footer',
      definition: {
        type: 'box',
        style: {
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        },
        children: [
          {
            type: 'flex',
            direction: 'column',
            gap: '0',
            style: {
              background: '#fff',
              borderRadius: '8px',
              maxWidth: '500px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
              overflow: 'hidden'
            },
            children: [
              {
                type: 'flex',
                direction: 'row',
                justifyContent: 'space-between',
                style: { alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e0e0e0', background: '#f5f5f5' },
                children: [
                  { type: 'heading', content: 'Modal Title', level: 3, style: { margin: 0, fontSize: '18px' } },
                  { type: 'button', label: '✕', variant: 'secondary', style: { padding: '4px 8px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#666' } }
                ]
              },
              {
                type: 'flex',
                direction: 'column',
                gap: '12px',
                style: { padding: '24px' },
                children: [
                  { type: 'paragraph', content: 'This is a custom modal dialog with flexible content area. You can add any content here including forms, text, images, or other components.', style: { margin: 0, fontSize: '14px', color: '#333', lineHeight: '1.6' } },
                  { type: 'input', placeholder: 'Example input field', style: { padding: '10px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', width: '100%', boxSizing: 'border-box' } }
                ]
              },
              {
                type: 'flex',
                direction: 'row',
                gap: '12px',
                justifyContent: 'flex-end',
                style: { padding: '20px 24px', borderTop: '1px solid #e0e0e0', background: '#f9f9f9' },
                children: [
                  { type: 'button', label: 'Close', variant: 'secondary', style: { padding: '10px 20px', background: '#e0e0e0', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' } },
                  { type: 'button', label: 'Submit', variant: 'primary', style: { padding: '10px 20px', background: '#0078d4', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' } }
                ]
              }
            ]
          }
        ]
      },
      tags: ['modal', 'dialog', 'custom', 'flexible'],
      author: 'system'
    });
  }

  registerToastNotification() {
    this.patterns.set('toast-notification', {
      id: 'toast-notification',
      name: 'Toast Notification',
      icon: '🔔',
      category: 'modals',
      codeReduction: '88%',
      description: 'Lightweight toast notifications for temporary messages',
      definition: {
        type: 'box',
        style: {
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1000
        },
        children: [
          {
            type: 'flex',
            direction: 'row',
            gap: '12px',
            style: {
              background: '#e8f5e9',
              border: '1px solid #81c784',
              borderRadius: '6px',
              padding: '14px 16px',
              maxWidth: '300px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              alignItems: 'center'
            },
            children: [
              { type: 'box', style: { fontSize: '18px', flexShrink: 0 }, children: [{ type: 'paragraph', content: '✓', style: { margin: 0, color: '#2e7d32', fontWeight: '700' } }] },
              {
                type: 'flex',
                direction: 'column',
                gap: '2px',
                style: { flex: 1 },
                children: [
                  { type: 'paragraph', content: 'Success', style: { margin: 0, fontSize: '14px', fontWeight: '600', color: '#2e7d32' } },
                  { type: 'paragraph', content: 'Your changes have been saved successfully.', style: { margin: 0, fontSize: '13px', color: '#558b2f' } }
                ]
              },
              { type: 'button', label: '✕', variant: 'secondary', style: { padding: '2px 6px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#558b2f', flexShrink: 0 } }
            ]
          },
          {
            type: 'box',
            style: {
              position: 'fixed',
              bottom: '88px',
              right: '24px',
              zIndex: 1000
            },
            children: [
              {
                type: 'flex',
                direction: 'row',
                gap: '12px',
                style: {
                  background: '#fff3e0',
                  border: '1px solid #ffb74d',
                  borderRadius: '6px',
                  padding: '14px 16px',
                  maxWidth: '300px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  alignItems: 'center'
                },
                children: [
                  { type: 'box', style: { fontSize: '18px', flexShrink: 0 }, children: [{ type: 'paragraph', content: '⚠️', style: { margin: 0 } }] },
                  {
                    type: 'flex',
                    direction: 'column',
                    gap: '2px',
                    style: { flex: 1 },
                    children: [
                      { type: 'paragraph', content: 'Warning', style: { margin: 0, fontSize: '14px', fontWeight: '600', color: '#e65100' } },
                      { type: 'paragraph', content: 'Please review this before proceeding.', style: { margin: 0, fontSize: '13px', color: '#f57c00' } }
                    ]
                  },
                  { type: 'button', label: '✕', variant: 'secondary', style: { padding: '2px 6px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#f57c00', flexShrink: 0 } }
                ]
              }
            ]
          }
        ]
      },
      tags: ['notification', 'toast', 'temporary', 'feedback'],
      author: 'system'
    });
  }

  registerDropdownMenu() {
    this.patterns.set('dropdown-menu', {
      id: 'dropdown-menu',
      name: 'Dropdown Menu',
      icon: '⬇️',
      category: 'modals',
      codeReduction: '81%',
      description: 'Dropdown menu with options and hover/click interactions',
      definition: {
        type: 'flex',
        direction: 'column',
        gap: '0',
        style: { position: 'relative', display: 'inline-block' },
        children: [
          {
            type: 'button',
            label: 'Actions ▼',
            variant: 'secondary',
            style: { padding: '10px 16px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }
          },
          {
            type: 'flex',
            direction: 'column',
            gap: '0',
            style: {
              position: 'absolute',
              top: '100%',
              left: 0,
              background: '#fff',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              minWidth: '200px',
              marginTop: '4px',
              zIndex: 100,
              overflow: 'hidden'
            },
            children: [
              { type: 'button', label: 'Edit', variant: 'secondary', style: { width: '100%', padding: '12px 16px', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px', borderBottom: '1px solid #f0f0f0' } },
              { type: 'button', label: 'Duplicate', variant: 'secondary', style: { width: '100%', padding: '12px 16px', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px', borderBottom: '1px solid #f0f0f0' } },
              { type: 'button', label: 'Archive', variant: 'secondary', style: { width: '100%', padding: '12px 16px', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px', borderBottom: '1px solid #f0f0f0' } },
              { type: 'button', label: 'Delete', variant: 'secondary', style: { width: '100%', padding: '12px 16px', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: '#d13438' } }
            ]
          }
        ]
      },
      tags: ['modal', 'dropdown', 'menu', 'actions'],
      author: 'system'
    });
  }

  registerSidePanel() {
    this.patterns.set('side-panel', {
      id: 'side-panel',
      name: 'Side Panel',
      icon: '📋',
      category: 'modals',
      codeReduction: '79%',
      description: 'Sliding side panel for details, forms, or navigation',
      definition: {
        type: 'box',
        style: {
          position: 'fixed',
          top: 0,
          right: 0,
          width: '350px',
          height: '100%',
          background: '#fff',
          boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column'
        },
        children: [
          {
            type: 'flex',
            direction: 'row',
            justifyContent: 'space-between',
            style: { alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e0e0e0' },
            children: [
              { type: 'heading', content: 'Panel Title', level: 3, style: { margin: 0, fontSize: '16px' } },
              { type: 'button', label: '✕', variant: 'secondary', style: { padding: '4px 8px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#666' } }
            ]
          },
          {
            type: 'flex',
            direction: 'column',
            gap: '16px',
            style: { padding: '20px', flex: 1, overflowY: 'auto' },
            children: [
              {
                type: 'flex',
                direction: 'column',
                gap: '8px',
                children: [
                  { type: 'paragraph', content: 'Settings Label', style: { margin: 0, fontSize: '13px', fontWeight: '600', color: '#333' } },
                  { type: 'input', placeholder: 'Enter value...', style: { padding: '10px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', width: '100%', boxSizing: 'border-box' } }
                ]
              },
              {
                type: 'flex',
                direction: 'column',
                gap: '8px',
                children: [
                  { type: 'paragraph', content: 'Another Setting', style: { margin: 0, fontSize: '13px', fontWeight: '600', color: '#333' } },
                  { type: 'select', style: { padding: '10px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', width: '100%', boxSizing: 'border-box' }, children: [{ type: 'paragraph', content: 'Select option', style: { margin: 0 } }] }
                ]
              },
              {
                type: 'flex',
                direction: 'column',
                gap: '8px',
                children: [
                  { type: 'paragraph', content: 'Description', style: { margin: 0, fontSize: '13px', fontWeight: '600', color: '#333' } },
                  { type: 'input', placeholder: 'Enter description...', style: { padding: '10px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', width: '100%', boxSizing: 'border-box', minHeight: '80px', verticalAlign: 'top' } }
                ]
              }
            ]
          },
          {
            type: 'flex',
            direction: 'row',
            gap: '12px',
            style: { padding: '16px 20px', borderTop: '1px solid #e0e0e0', background: '#f9f9f9' },
            children: [
              { type: 'button', label: 'Cancel', variant: 'secondary', style: { flex: 1, padding: '10px 16px', background: '#e0e0e0', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' } },
              { type: 'button', label: 'Save', variant: 'primary', style: { flex: 1, padding: '10px 16px', background: '#0078d4', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' } }
            ]
          }
        ]
      },
      tags: ['modal', 'panel', 'sidebar', 'details'],
      author: 'system'
    });
  }

}

function createModalPatternLibrary() {
  return new ModalPatternLibrary();
}

export { ModalPatternLibrary, createModalPatternLibrary };
