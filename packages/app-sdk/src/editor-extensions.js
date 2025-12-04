import { nowISO, createTimestamps, updateTimestamp } from '@sequential/timestamp-utilities';
export class TaskEditorExtension {
  constructor(appSDK) {
    this.appSDK = appSDK;
  }

  initializeUI() {
    this.attachPureLogicValidator();
    this.attachInputOutputSchema();
  }

  attachPureLogicValidator() {
    const codeEditor = document.querySelector('textarea');
    if (!codeEditor) return;

    const warningDiv = document.createElement('div');
    warningDiv.id = 'pure-logic-warning';
    warningDiv.style.cssText = 'background: #3a3a2a; color: #ffb366; padding: 12px; border-radius: 6px; margin-bottom: 16px; font-size: 13px; border: 1px solid #666633; display: none;';
    warningDiv.innerHTML = '⚠️ Tasks should be pure logic functions with no imports';

    codeEditor.parentElement.insertBefore(warningDiv, codeEditor);

    codeEditor.addEventListener('blur', () => {
      const code = codeEditor.value;
      const hasImports = /^\s*import\s+|^\s*require\s*\(/m.test(code);

      if (hasImports) {
        warningDiv.style.display = 'block';
      } else {
        warningDiv.style.display = 'none';
      }
    });
  }

  attachInputOutputSchema() {
    const schemaSection = document.createElement('div');
    schemaSection.className = 'form-group';
    schemaSection.innerHTML = `
      <label>Input Schema (JSON)</label>
      <textarea id="input-schema" placeholder='{"field": "description"}' style="font-family: 'Courier New', monospace; height: 100px;"></textarea>
      <label style="margin-top: 16px;">Output Schema (JSON)</label>
      <textarea id="output-schema" placeholder='{"field": "description"}' style="font-family: 'Courier New', monospace; height: 100px;"></textarea>
    `;

    const content = document.querySelector('.content');
    if (content) {
      content.appendChild(schemaSection);
    }
  }
}

export class FlowEditorExtension {
  constructor(appSDK) {
    this.appSDK = appSDK;
    this.nodeToolbox = null;
  }

  initializeUI() {
    this.createNodeToolbox();
    this.attachNodeValidation();
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

export function initializeTaskEditorExtension(appSDK) {
  const extension = new TaskEditorExtension(appSDK);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => extension.initializeUI());
  } else {
    extension.initializeUI();
  }
  return extension;
}

export function initializeFlowEditorExtension(appSDK) {
  const extension = new FlowEditorExtension(appSDK);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => extension.initializeUI());
  } else {
    extension.initializeUI();
  }
  return extension;
}
