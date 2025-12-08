const DEV_TOOLS_SHARED = (() => {
  const shortcuts = {
    'ctrl+s': () => window.saveWork?.(),
    'ctrl+e': () => window.exportWork?.(),
    'ctrl+h': () => window.showHelp?.(),
    'ctrl+/': () => window.toggleConsole?.(),
    'f1': () => window.showDocumentation?.(),
    'f12': () => window.openDevTools?.()
  };

  const templates = {
    task: {
      'simple-sync': `export function myTask(input) {
  return { success: true, data: input };
}`,
      'async-fetch': `export async function myTask(input) {
  const response = await fetch('https://api.example.com/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  const data = await response.json();
  return { success: true, data };
}`,
      'with-error-handling': `export async function myTask(input) {
  try {
    if (!input.required) throw new Error('Missing required field');
    const result = await process(input);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}`
    },
    flow: {
      'simple': `{
  "initial": "start",
  "states": {
    "start": { "onDone": "process" },
    "process": { "onDone": "end" },
    "end": { "type": "final" }
  }
}`,
      'with-error': `{
  "initial": "start",
  "states": {
    "start": { "onDone": "process", "onError": "handleError" },
    "process": { "onDone": "end", "onError": "handleError" },
    "handleError": { "type": "final" },
    "end": { "type": "final" }
  }
}`
    },
    tool: {
      'basic': `export async function myTool(param1, param2) {
  return {
    input: { param1, param2 },
    output: { result: "computed" }
  };
}`
    }
  };

  const validators = {
    taskCode: (code) => {
      const errors = [];
      if (!code.includes('export')) errors.push('Missing export statement');
      if (!code.includes('function')) errors.push('Missing function declaration');
      if (!code.includes('return')) errors.push('Missing return statement');
      return errors;
    },
    flowJson: (json) => {
      const errors = [];
      try {
        const obj = typeof json === 'string' ? JSON.parse(json) : json;
        if (!obj.initial) errors.push('Missing "initial" state');
        if (!obj.states) errors.push('Missing "states" object');
        Object.entries(obj.states || {}).forEach(([name, state]) => {
          if (state.type !== 'final' && !state.onDone && !state.onError) {
            errors.push(`State "${name}" has no transitions`);
          }
        });
      } catch (e) {
        errors.push(`Invalid JSON: ${e.message}`);
      }
      return errors;
    }
  };

  function registerShortcuts(handlers = {}) {
    Object.assign(window, handlers);
    document.addEventListener('keydown', (e) => {
      const keyCombo = [
        e.ctrlKey && 'ctrl',
        e.metaKey && 'meta',
        e.shiftKey && 'shift',
        e.key.toLowerCase()
      ].filter(Boolean).join('+');

      const handler = shortcuts[keyCombo];
      if (handler) {
        e.preventDefault();
        handler();
      }
    });
  }

  function createAutoSaver(saveInterval = 3000) {
    let timer = null;
    let isDirty = false;

    return {
      mark() { isDirty = true; },
      start(callback) {
        timer = setInterval(() => {
          if (isDirty) {
            callback();
            isDirty = false;
          }
        }, saveInterval);
      },
      stop() { clearInterval(timer); },
      isDirty: () => isDirty
    };
  }

  function createToastSystem() {
    const container = document.getElementById('toastContainer') || (() => {
      const div = document.createElement('div');
      div.id = 'toastContainer';
      div.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:2000;';
      document.body.appendChild(div);
      return div;
    })();

    return {
      show(msg, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.style.cssText = `padding:12px 16px;margin-bottom:8px;border-radius:4px;font-size:13px;background:${
          type === 'success' ? '#4caf50' :
          type === 'error' ? '#f48771' :
          type === 'warning' ? '#ff9800' : '#2196F3'
        };color:white;box-shadow:0 2px 8px rgba(0,0,0,0.3);animation:slideIn 0.3s;`;
        toast.textContent = msg;
        container.appendChild(toast);
        setTimeout(() => {
          toast.style.animation = 'slideOut 0.3s forwards';
          setTimeout(() => toast.remove(), 300);
        }, duration);
      }
    };
  }

  function formatCode(code, language = 'javascript') {
    if (!window.hljs) return code;
    try {
      return window.hljs.highlight(code, { language }).value;
    } catch (e) {
      return code;
    }
  }

  return {
    templates,
    validators,
    registerShortcuts,
    createAutoSaver,
    createToastSystem,
    formatCode
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DEV_TOOLS_SHARED;
}
