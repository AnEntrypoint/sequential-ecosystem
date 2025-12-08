export const FLOW_TEMPLATES = [
  {
    id: 'sequential-simple',
    name: 'Sequential Flow',
    category: 'Basic',
    description: 'Simple linear flow with 3 states',
    states: {
      initial: 'fetchData',
      states: {
        fetchData: {
          onDone: 'processData',
          type: 'task'
        },
        processData: {
          onDone: 'complete',
          type: 'task'
        },
        complete: {
          type: 'final'
        }
      }
    }
  },
  {
    id: 'conditional-routing',
    name: 'Conditional Routing',
    category: 'Control Flow',
    description: 'Route based on condition result',
    states: {
      initial: 'checkInput',
      states: {
        checkInput: {
          onDone: 'validateInput',
          type: 'task'
        },
        validateInput: {
          onSuccess: 'processValid',
          onError: 'handleError',
          type: 'condition'
        },
        processValid: {
          onDone: 'complete',
          type: 'task'
        },
        handleError: {
          type: 'final'
        },
        complete: {
          type: 'final'
        }
      }
    }
  },
  {
    id: 'retry-pattern',
    name: 'Retry with Backoff',
    category: 'Resilience',
    description: 'Retry failed operations with exponential backoff',
    states: {
      initial: 'attemptTask',
      states: {
        attemptTask: {
          onSuccess: 'complete',
          onError: 'checkRetryCount',
          type: 'task'
        },
        checkRetryCount: {
          onRetry: 'waitBackoff',
          onFail: 'handleFailure',
          type: 'condition'
        },
        waitBackoff: {
          onDone: 'attemptTask',
          type: 'delay'
        },
        complete: {
          type: 'final'
        },
        handleFailure: {
          type: 'final'
        }
      }
    }
  },
  {
    id: 'parallel-merge',
    name: 'Parallel Execution',
    category: 'Concurrency',
    description: 'Execute multiple tasks in parallel and merge results',
    states: {
      initial: 'startParallel',
      states: {
        startParallel: {
          parallel: ['task1', 'task2', 'task3'],
          onAllDone: 'mergeResults',
          type: 'fork'
        },
        task1: {
          type: 'task'
        },
        task2: {
          type: 'task'
        },
        task3: {
          type: 'task'
        },
        mergeResults: {
          onDone: 'complete',
          type: 'task'
        },
        complete: {
          type: 'final'
        }
      }
    }
  },
  {
    id: 'error-handling',
    name: 'Error Handling',
    category: 'Resilience',
    description: 'Centralized error handling with fallback',
    states: {
      initial: 'primaryTask',
      states: {
        primaryTask: {
          onSuccess: 'complete',
          onError: 'fallbackTask',
          type: 'task'
        },
        fallbackTask: {
          onSuccess: 'complete',
          onError: 'handleError',
          type: 'task'
        },
        handleError: {
          type: 'final'
        },
        complete: {
          type: 'final'
        }
      }
    }
  },
  {
    id: 'loop-pattern',
    name: 'Loop Processing',
    category: 'Iteration',
    description: 'Process items in a loop with early exit',
    states: {
      initial: 'initLoop',
      states: {
        initLoop: {
          onDone: 'processItem',
          type: 'task'
        },
        processItem: {
          onSuccess: 'checkMore',
          onError: 'handleItemError',
          type: 'task'
        },
        checkMore: {
          onContinue: 'processItem',
          onDone: 'complete',
          type: 'condition'
        },
        handleItemError: {
          type: 'final'
        },
        complete: {
          type: 'final'
        }
      }
    }
  },
  {
    id: 'approval-workflow',
    name: 'Approval Workflow',
    category: 'Business Logic',
    description: 'Wait for approval with timeout',
    states: {
      initial: 'submitRequest',
      states: {
        submitRequest: {
          onDone: 'waitApproval',
          type: 'task'
        },
        waitApproval: {
          onApproved: 'processApproved',
          onRejected: 'processRejected',
          onTimeout: 'processTimeout',
          type: 'wait'
        },
        processApproved: {
          onDone: 'complete',
          type: 'task'
        },
        processRejected: {
          type: 'final'
        },
        processTimeout: {
          type: 'final'
        },
        complete: {
          type: 'final'
        }
      }
    }
  }
];

export class FlowTemplateGallery {
  constructor() {
    this.selectedTemplate = null;
  }

  show() {
    const modal = document.createElement('div');
    modal.id = 'flow-template-gallery-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10003;
      padding: 20px;
    `;

    const container = document.createElement('div');
    container.style.cssText = `
      background: #1a1a1a;
      border-radius: 12px;
      max-width: 1200px;
      width: 100%;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      border: 1px solid #3a3a3a;
      box-shadow: 0 25px 50px rgba(0,0,0,0.9);
      overflow: hidden;
    `;

    const header = document.createElement('div');
    header.style.cssText = `
      background: #2a2a2a;
      padding: 20px;
      border-bottom: 1px solid #3a3a3a;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    header.innerHTML = `
      <h2 style="color: #64b5f6; margin: 0; font-size: 18px;">Flow Templates</h2>
      <button id="flow-gallery-close" style="
        background: none;
        border: none;
        color: #e0e0e0;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">✕</button>
    `;

    const body = document.createElement('div');
    body.style.cssText = `
      display: flex;
      flex: 1;
      overflow: hidden;
      gap: 1px;
      background: #3a3a3a;
    `;

    const templateList = document.createElement('div');
    templateList.style.cssText = `
      width: 300px;
      overflow-y: auto;
      background: #2a2a2a;
    `;

    const categories = {};
    FLOW_TEMPLATES.forEach(t => {
      if (!categories[t.category]) categories[t.category] = [];
      categories[t.category].push(t);
    });

    Object.entries(categories).forEach(([cat, templates]) => {
      const catHeader = document.createElement('div');
      catHeader.style.cssText = `
        padding: 12px 16px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        color: #64b5f6;
        letter-spacing: 1px;
        border-bottom: 1px solid #3a3a3a;
        background: #1a1a1a;
      `;
      catHeader.textContent = cat;
      templateList.appendChild(catHeader);

      templates.forEach(template => {
        const item = document.createElement('div');
        item.style.cssText = `
          padding: 12px 16px;
          cursor: pointer;
          border-bottom: 1px solid #3a3a3a;
          transition: all 0.2s;
        `;
        item.className = 'flow-template-item';
        item.innerHTML = `
          <div style="font-weight: 600; color: #e0e0e0; font-size: 14px;">${template.name}</div>
          <div style="color: #999; font-size: 12px; margin-top: 4px;">${template.description}</div>
        `;

        item.addEventListener('mouseover', () => {
          item.style.background = '#3a3a3a';
        });
        item.addEventListener('mouseout', () => {
          item.style.background = 'transparent';
        });
        item.addEventListener('click', () => {
          this.selectTemplate(template, item);
        });

        templateList.appendChild(item);
      });
    });

    const preview = document.createElement('div');
    preview.style.cssText = `
      flex: 1;
      background: #1a1a1a;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    `;

    const previewHeader = document.createElement('div');
    previewHeader.style.cssText = `
      padding: 20px;
      border-bottom: 1px solid #3a3a3a;
      color: #999;
      font-size: 14px;
    `;
    previewHeader.textContent = 'Select a template to preview';

    const previewContent = document.createElement('div');
    previewContent.style.cssText = `
      flex: 1;
      padding: 20px;
      overflow: auto;
      background: #1a1a1a;
      color: #e0e0e0;
      font-size: 13px;
      line-height: 1.6;
    `;

    const footer = document.createElement('div');
    footer.style.cssText = `
      padding: 16px 20px;
      background: #2a2a2a;
      border-top: 1px solid #3a3a3a;
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    `;
    footer.innerHTML = `
      <button id="flow-gallery-insert" style="
        background: #64b5f6;
        color: #1a1a1a;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        display: none;
      ">Use Template</button>
      <button id="flow-gallery-cancel" style="
        background: #3a3a3a;
        color: #e0e0e0;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
      ">Cancel</button>
    `;

    preview.appendChild(previewHeader);
    preview.appendChild(previewContent);
    body.appendChild(templateList);
    body.appendChild(preview);
    container.appendChild(header);
    container.appendChild(body);
    container.appendChild(footer);
    modal.appendChild(container);
    document.body.appendChild(modal);

    this.selectedTemplate = null;
    this.previewHeader = previewHeader;
    this.previewContent = previewContent;
    this.insertBtn = document.getElementById('flow-gallery-insert');

    document.getElementById('flow-gallery-close').addEventListener('click', () => {
      modal.remove();
    });

    document.getElementById('flow-gallery-cancel').addEventListener('click', () => {
      modal.remove();
    });

    document.getElementById('flow-gallery-insert').addEventListener('click', () => {
      if (this.selectedTemplate) {
        window.applyFlowTemplate(this.selectedTemplate);
        modal.remove();
      }
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  selectTemplate(template, element) {
    this.selectedTemplate = template;
    document.querySelectorAll('.flow-template-item').forEach(item => {
      item.style.borderLeft = '3px solid transparent';
      item.style.paddingLeft = '13px';
    });
    element.style.borderLeft = '3px solid #64b5f6';
    element.style.paddingLeft = '13px';
    element.style.background = '#3a3a3a';

    const stateList = Object.entries(template.states.states)
      .map(([name, config]) => `<div style="margin: 8px 0;">
        <span style="color: #64b5f6; font-weight: 600;">${name}</span>
        <span style="color: #999;"> → ${config.type || 'task'}</span>
      </div>`)
      .join('');

    this.previewHeader.innerHTML = `
      <div style="color: #64b5f6; font-weight: 600; font-size: 16px; margin-bottom: 8px;">${template.name}</div>
      <div style="color: #999; font-size: 13px;">${template.description}</div>
    `;

    this.previewContent.innerHTML = `
      <div style="margin-bottom: 16px;">
        <div style="color: #4ade80; font-weight: 600; margin-bottom: 8px;">States:</div>
        ${stateList}
      </div>
      <div>
        <div style="color: #4ade80; font-weight: 600; margin-bottom: 8px;">Initial State:</div>
        <div style="color: #e0e0e0;">${template.states.initial}</div>
      </div>
    `;

    this.insertBtn.style.display = 'block';
  }
}

window.applyFlowTemplate = function(template) {
  const states = {};
  for (const [name, config] of Object.entries(template.states.states)) {
    states[name] = {
      name,
      ...config
    };
  }

  window.flowEditor = window.flowEditor || {};
  window.flowEditor.states = states;
  window.flowEditor.currentState = template.states.initial;

  if (window.renderFlow) {
    window.renderFlow();
  }

  if (window.showSuccess) {
    window.showSuccess(`✓ Applied ${template.name} template`);
  }
};

window.showFlowTemplateGallery = function() {
  const gallery = new FlowTemplateGallery();
  gallery.show();
};
