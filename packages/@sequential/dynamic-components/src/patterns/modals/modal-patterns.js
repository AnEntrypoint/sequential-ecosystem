export const alertModal = {
  id: 'alert-modal',
  name: 'Alert Modal',
  icon: '⚠️',
  category: 'modals',
  description: 'Simple alert dialog for displaying messages to users',
  tags: ['alert', 'dialog', 'notification']
};

export const confirmModal = {
  id: 'confirm-modal',
  name: 'Confirm Modal',
  icon: '❓',
  category: 'modals',
  description: 'Confirmation dialog for user actions',
  tags: ['confirm', 'dialog', 'action']
};

export const customModal = {
  id: 'custom-modal',
  name: 'Custom Modal',
  icon: '📦',
  category: 'modals',
  description: 'Customizable modal for any content',
  tags: ['custom', 'modal', 'flexible']
};

export const toastNotification = {
  id: 'toast-notification',
  name: 'Toast Notification',
  icon: '🔔',
  category: 'modals',
  description: 'Non-blocking notification that auto-dismisses',
  tags: ['toast', 'notification', 'temporary']
};

export const dropdownMenu = {
  id: 'dropdown-menu',
  name: 'Dropdown Menu',
  icon: '▼',
  category: 'modals',
  description: 'Context menu appearing below trigger element',
  tags: ['dropdown', 'menu', 'context']
};

export const sidePanel = {
  id: 'side-panel',
  name: 'Side Panel',
  icon: '📂',
  category: 'modals',
  description: 'Sliding panel from side of screen',
  tags: ['panel', 'slide', 'drawer']
};

export const modalPatterns = [
  alertModal,
  confirmModal,
  customModal,
  toastNotification,
  dropdownMenu,
  sidePanel
];
