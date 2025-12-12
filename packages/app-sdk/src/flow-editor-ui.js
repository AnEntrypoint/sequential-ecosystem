/**
 * flow-editor-ui.js - Flow editor UI components and validation
 *
 * Node toolbox and flow validation UI for flow editor
 */

import { nowISO } from '@sequentialos/timestamp-utilities';

export class FlowEditorUI {
  constructor(appSDK) {
    this.appSDK = appSDK;
    this.nodeToolbox = null;
  }

  createNodeToolbox() {
    const toolbox = document.createElement('div');
    toolbox.id = 'node-toolbox';
    toolbox.style.cssText = `
      background: #2a2a2a;
      border: 1px solid #3a3a3a;
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 16px;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    `;

    const nodeTypes = [
      { label: 'Task', icon: '📝', type: 'task' },
      { label: 'Tool', icon: '🔧', type: 'tool' },
      { label: 'Decision', icon: '🤔', type: 'decision' },
      { label: 'Parallel', icon: '⚡', type: 'parallel' },
      { label: 'Final', icon: '✓', type: 'final' }
    ];

    nodeTypes.forEach(nt => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.style.cssText = `
        padding: 8px 12px;
        background: #3a3a3a;
        border: 1px solid #4a4a4a;
        color: #e0e0e0;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      `;
      btn.innerHTML = `${nt.icon} ${nt.label}`;
      btn.addEventListener('click', () => this.addNode(nt.type));
      toolbox.appendChild(btn);
    });

    const content = document.querySelector('.content');
    if (content) {
      content.insertBefore(toolbox, content.firstChild);
    }

    this.nodeToolbox = toolbox;
  }

  addNode(nodeType) {
    this.appSDK.emit('flow:node-added', {
      type: nodeType,
      timestamp: nowISO()
    });
  }

  attachNodeValidation() {
    const canvas = document.querySelector('canvas') || document.querySelector('[role="canvas"]');
    if (!canvas) return;

    canvas.addEventListener('mouseup', () => {
      this.validateFlow();
    });
  }

  validateFlow() {
    const validation = {
      hasInitial: !!document.querySelector('[data-node-type="initial"]'),
      hasFinal: !!document.querySelector('[data-node-type="final"]'),
      nodeCount: document.querySelectorAll('[data-node-type]').length,
      timestamp: nowISO()
    };

    this.appSDK.emit('flow:validated', validation);
  }
}
