/**
 * Flow Visualizer App - CSS Styles Module
 * All styling for the flow visualization interface
 */

export const flowVizStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    background: #f5f5f5;
    color: #333;
  }

  .app-container {
    width: 100%;
    height: 100vh;
    display: flex;
  }

  .sidebar {
    width: 300px;
    background: white;
    border-right: 1px solid #e0e0e0;
    padding: 16px;
    overflow-y: auto;
  }

  .sidebar h2 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
  }

  .flow-list {
    list-style: none;
  }

  .flow-item {
    padding: 10px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    margin-bottom: 8px;
    cursor: pointer;
    background: white;
    transition: all 0.2s ease;
  }

  .flow-item:hover {
    background: #f5f5f5;
    border-color: #0a66c2;
  }

  .flow-item.active {
    background: #e8f4f8;
    border-color: #0a66c2;
  }

  .flow-name {
    font-weight: 500;
    margin-bottom: 4px;
  }

  .flow-states-count {
    font-size: 12px;
    color: #999;
  }

  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .header {
    background: white;
    border-bottom: 1px solid #e0e0e0;
    padding: 16px 20px;
  }

  .header h1 {
    font-size: 24px;
    font-weight: 600;
  }

  .canvas {
    flex: 1;
    padding: 20px;
    overflow: auto;
    background: #f5f5f5;
  }

  .flow-diagram {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 20px;
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
  }

  .state-node {
    display: inline-block;
    padding: 12px 20px;
    background: white;
    border: 2px solid #0a66c2;
    border-radius: 6px;
    margin: 10px;
    font-weight: 500;
    text-align: center;
    min-width: 120px;
  }

  .state-node.initial {
    border-color: #31a24c;
    background: #f0fdf4;
  }

  .state-node.final {
    border-color: #ea580c;
    background: #fff7ed;
  }

  .state-node.error {
    border-color: #c41e3a;
    background: #fef2f2;
  }

  .arrow {
    display: inline-block;
    margin: 0 10px;
    color: #999;
    font-size: 20px;
  }

  .footer {
    background: white;
    border-top: 1px solid #e0e0e0;
    padding: 12px 20px;
    font-size: 12px;
    color: #999;
  }

  .loading {
    color: #999;
    text-align: center;
  }

  .error-msg {
    color: #c41e3a;
    padding: 16px;
    background: #fef2f2;
    border-radius: 4px;
    margin: 16px;
  }
`;
