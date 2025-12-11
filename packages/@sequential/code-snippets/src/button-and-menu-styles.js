/**
 * button-and-menu-styles.js
 *
 * CSS styles for snippet button, menu, search, categories, and items
 */

export function getButtonAndMenuStyles() {
  return `
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
  `;
}
