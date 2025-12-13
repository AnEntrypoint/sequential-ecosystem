/**
 * help-modal.js
 *
 * Keyboard help modal rendering
 */

export function createHelpModal(keyboardShortcuts) {
  return {
    show() {
      const modal = document.createElement('div');
      modal.id = 'keyboard-help-modal';
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
      `;

      const content = document.createElement('div');
      content.style.cssText = `
        background: #2a2a2a;
        color: #e0e0e0;
        border-radius: 8px;
        padding: 24px;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
      `;

      content.innerHTML = `
        <h2 style="margin-bottom: 20px; color: #4ade80;">Keyboard Shortcuts</h2>
        <div style="display: grid; gap: 12px;">
          ${Array.from(keyboardShortcuts.getShortcuts().entries())
    .map(([key, { description }]) => `
              <div style="display: flex; gap: 20px; padding-bottom: 12px; border-bottom: 1px solid #3a3a3a;">
                <code style="background: #1a1a1a; padding: 4px 8px; border-radius: 3px; font-size: 12px;">${key}</code>
                <span style="flex: 1;">${description}</span>
              </div>
            `).join('')}
        </div>
      `;

      modal.appendChild(content);
      document.body.appendChild(modal);
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
      });
    }
  };
}
