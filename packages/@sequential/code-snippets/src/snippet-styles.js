/**
 * CSS styles for snippet UI menu, modal, and components
 */
export function createSnippetStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .snippet-button {
      background: #4ade80;
      color: #1a1a1a;
      border: none;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      margin: 0 4px;
      transition: background 0.2s;
    }
    .snippet-button:hover {
      background: #22c55e;
    }
    .snippet-menu {
      position: absolute;
      background: #2a2a2a;
      border: 1px solid #4ade80;
      border-radius: 4px;
      box-shadow: 0 8px 16px rgba(0,0,0,0.3);
      z-index: 10000;
      min-width: 300px;
      max-height: 500px;
      overflow-y: auto;
      display: none;
    }
    .snippet-menu.open {
      display: block;
    }
    .snippet-search-box {
      padding: 8px;
      border-bottom: 1px solid #4ade80;
      background: #1a1a1a;
    }
    .snippet-search-box input {
      width: 100%;
      background: #2a2a2a;
      color: #fff;
      border: 1px solid #4ade80;
      padding: 6px 8px;
      border-radius: 3px;
      font-size: 13px;
    }
    .snippet-search-box input::placeholder {
      color: #888;
    }
    .snippet-category {
      padding: 0;
    }
    .snippet-category-title {
      padding: 8px 12px;
      background: #1a1a1a;
      color: #4ade80;
      font-weight: 600;
      cursor: pointer;
      border-bottom: 1px solid #3a3a3a;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .snippet-category-title:hover {
      background: #2a2a2a;
    }
    .snippet-items {
      display: none;
      background: #2a2a2a;
    }
    .snippet-items.expanded {
      display: block;
    }
    .snippet-item {
      padding: 8px 12px;
      border-bottom: 1px solid #3a3a3a;
      cursor: pointer;
      font-size: 13px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .snippet-item:hover {
      background: #3a3a3a;
    }
    .snippet-item-name {
      color: #fff;
      font-weight: 500;
    }
    .snippet-item-desc {
      color: #888;
      font-size: 12px;
      margin-top: 2px;
    }
    .snippet-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 10001;
    }
    .snippet-modal.open {
      display: flex;
    }
    .snippet-modal-content {
      background: #2a2a2a;
      border: 1px solid #4ade80;
      border-radius: 4px;
      padding: 20px;
      max-width: 500px;
      max-height: 600px;
      overflow-y: auto;
      color: #fff;
    }
    .snippet-modal-title {
      color: #4ade80;
      font-weight: 600;
      margin-bottom: 16px;
      font-size: 16px;
    }
    .snippet-var-group {
      margin-bottom: 16px;
    }
    .snippet-var-label {
      display: block;
      color: #4ade80;
      font-weight: 500;
      font-size: 13px;
      margin-bottom: 4px;
    }
    .snippet-var-input {
      width: 100%;
      background: #1a1a1a;
      color: #fff;
      border: 1px solid #4ade80;
      padding: 8px;
      border-radius: 3px;
      font-size: 13px;
      box-sizing: border-box;
    }
    .snippet-var-input::placeholder {
      color: #666;
    }
    .snippet-var-input:focus {
      outline: none;
      border-color: #22c55e;
    }
    .snippet-modal-buttons {
      display: flex;
      gap: 8px;
      margin-top: 20px;
      justify-content: flex-end;
    }
    .snippet-modal-btn {
      padding: 8px 16px;
      border: none;
      border-radius: 3px;
      cursor: pointer;
      font-weight: 500;
      font-size: 13px;
    }
    .snippet-modal-btn-primary {
      background: #4ade80;
      color: #1a1a1a;
    }
    .snippet-modal-btn-primary:hover {
      background: #22c55e;
    }
    .snippet-modal-btn-secondary {
      background: #3a3a3a;
      color: #fff;
    }
    .snippet-modal-btn-secondary:hover {
      background: #4a4a4a;
    }
  `;

  return style;
}

/**
 * Inject styles if not already present
 */
export function injectSnippetStyles() {
  if (!document.querySelector(`style[data-snippet-css]`)) {
    const style = createSnippetStyles();
    style.setAttribute('data-snippet-css', 'true');
    document.head.appendChild(style);
  }
}
