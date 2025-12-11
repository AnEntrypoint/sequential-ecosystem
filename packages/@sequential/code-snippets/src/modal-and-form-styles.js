/**
 * modal-and-form-styles.js
 *
 * CSS styles for snippet modal, form inputs, and buttons
 */

export function getModalAndFormStyles() {
  return `
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
}
