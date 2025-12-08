export class SnippetInsert {
  constructor(editorId = 'codeEditor') {
    this.editor = document.getElementById(editorId);
    this.snippets = this.initSnippets();
    this.isVisible = false;
  }

  initSnippets() {
    return [
      {
        id: 'try-catch',
        label: 'Try-Catch Block',
        trigger: 'try',
        category: 'Control Flow',
        code: `try {
  // Code here
} catch (error) {
  console.error('Error:', error);
  throw error;
}`
      },
      {
        id: 'if-else',
        label: 'If-Else Statement',
        trigger: 'if',
        category: 'Control Flow',
        code: `if (condition) {
  // True branch
} else {
  // False branch
}`
      },
      {
        id: 'async-await',
        label: 'Async-Await Pattern',
        trigger: 'async',
        category: 'Async',
        code: `async function myFunction(input) {
  try {
    const result = await someAsyncOperation(input);
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}`
      },
      {
        id: 'fetch-json',
        label: 'Fetch JSON',
        trigger: 'fetch',
        category: 'HTTP',
        code: `const response = await fetch(url);
if (!response.ok) {
  throw new Error(\`HTTP error! status: \${response.status}\`);
}
const data = await response.json();`
      },
      {
        id: 'tool-call',
        label: '__callHostTool__ Pattern',
        trigger: 'tool',
        category: 'Tools',
        code: `const result = await __callHostTool__('appId', 'toolName', input);
if (!result.success) {
  throw new Error(result.error);
}
return result.data;`
      },
      {
        id: 'for-loop',
        label: 'For Loop',
        trigger: 'for',
        category: 'Loops',
        code: `for (let i = 0; i < array.length; i++) {
  const item = array[i];
  // Process item
}`
      },
      {
        id: 'for-of-loop',
        label: 'For-Of Loop',
        trigger: 'forof',
        category: 'Loops',
        code: `for (const item of array) {
  // Process item
}`
      },
      {
        id: 'map-filter',
        label: 'Map-Filter Pattern',
        trigger: 'map',
        category: 'Array',
        code: `const result = array
  .filter(item => condition)
  .map(item => transform(item));`
      },
      {
        id: 'object-spread',
        label: 'Object Spread Pattern',
        trigger: 'spread',
        category: 'Objects',
        code: `const newObject = {
  ...existingObject,
  newKey: 'newValue'
};`
      },
      {
        id: 'object-destructure',
        label: 'Object Destructuring',
        trigger: 'destruct',
        category: 'Objects',
        code: `const { key1, key2, ...rest } = object;`
      },
      {
        id: 'arrow-function',
        label: 'Arrow Function',
        trigger: 'arrow',
        category: 'Functions',
        code: `const myFunction = (param) => {
  return result;
};`
      },
      {
        id: 'filter-map-reduce',
        label: 'Filter-Map-Reduce',
        trigger: 'reduce',
        category: 'Array',
        code: `const result = array
  .filter(item => condition)
  .map(item => transform(item))
  .reduce((acc, item) => acc + item, 0);`
      },
      {
        id: 'validator',
        label: 'Input Validation',
        trigger: 'validate',
        category: 'Validation',
        code: `if (!input || typeof input !== 'object') {
  throw new Error('Invalid input');
}
if (!input.requiredField) {
  throw new Error('requiredField is required');
}
return input;`
      },
      {
        id: 'error-handler',
        label: 'Error Handler Pattern',
        trigger: 'error',
        category: 'Error Handling',
        code: `function handleError(error) {
  console.error('Error occurred:', error);
  return {
    success: false,
    error: error.message,
    code: error.code || 'UNKNOWN_ERROR'
  };
}`
      },
      {
        id: 'retry-logic',
        label: 'Retry Pattern',
        trigger: 'retry',
        category: 'Resilience',
        code: `async function retryOperation(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
    }
  }
}`
      }
    ];
  }

  init() {
    if (!this.editor) return;
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "'") {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  toggle() {
    if (this.isVisible) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.createModal();
    this.isVisible = true;
    const input = document.getElementById('snippetSearchInput');
    if (input) {
      input.focus();
    }
  }

  close() {
    const modal = document.getElementById('snippetModal');
    if (modal) {
      modal.remove();
    }
    this.isVisible = false;
  }

  createModal() {
    let modal = document.getElementById('snippetModal');
    if (modal) return;

    modal = document.createElement('div');
    modal.id = 'snippetModal';
    modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #2a2a2a;
      border: 1px solid #3a3a3a;
      border-radius: 8px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.6);
      z-index: 10000;
      width: 90%;
      max-width: 700px;
      max-height: 70vh;
      display: flex;
      flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
    `;

    const header = document.createElement('div');
    header.style.cssText = `
      padding: 16px;
      border-bottom: 1px solid #3a3a3a;
      display: flex;
      gap: 12px;
      align-items: center;
    `;

    const input = document.createElement('input');
    input.id = 'snippetSearchInput';
    input.type = 'text';
    input.placeholder = 'Search snippets (e.g., "try", "fetch", "async")...';
    input.style.cssText = `
      flex: 1;
      background: #2a2a2a;
      border: 1px solid #3a3a3a;
      color: #e0e0e0;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 14px;
      outline: none;
    `;

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `
      background: transparent;
      border: none;
      color: #999;
      cursor: pointer;
      font-size: 18px;
      padding: 4px 8px;
    `;
    closeBtn.onclick = () => this.close();

    header.appendChild(input);
    header.appendChild(closeBtn);

    const list = document.createElement('div');
    list.id = 'snippetList';
    list.style.cssText = `
      overflow-y: auto;
      flex: 1;
    `;

    modal.appendChild(header);
    modal.appendChild(list);
    document.body.appendChild(modal);

    input.addEventListener('input', (e) => this.updateList(e.target.value));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.close();
      }
    });

    this.updateList('');
  }

  updateList(query) {
    const list = document.getElementById('snippetList');
    if (!list) return;

    const filtered = query
      ? this.snippets.filter(s =>
          s.label.toLowerCase().includes(query.toLowerCase()) ||
          s.trigger.toLowerCase().includes(query.toLowerCase()) ||
          s.category.toLowerCase().includes(query.toLowerCase())
        )
      : this.snippets;

    list.innerHTML = filtered.map(snippet => `
      <div class="snippet-item" data-id="${snippet.id}" style="
        padding: 16px;
        border-bottom: 1px solid #3a3a3a;
        cursor: pointer;
        transition: background 0.15s;
      ">
        <div style="display: flex; gap: 12px; align-items: flex-start;">
          <div style="flex: 1;">
            <div style="color: #e0e0e0; font-weight: 600; margin-bottom: 4px;">
              ${snippet.label}
            </div>
            <div style="color: #666; font-size: 12px; margin-bottom: 8px;">
              Trigger: <code style="background: #3a3a3a; padding: 2px 6px; border-radius: 3px;">${snippet.trigger}</code>
              · Category: ${snippet.category}
            </div>
            <pre style="
              background: #1a1a1a;
              color: #4ade80;
              padding: 8px;
              border-radius: 4px;
              font-size: 11px;
              overflow-x: auto;
              margin: 0;
            "><code>${this.escapeHtml(snippet.code)}</code></pre>
          </div>
        </div>
      </div>
    `).join('');

    list.querySelectorAll('.snippet-item').forEach(item => {
      item.addEventListener('click', () => {
        const snippetId = item.dataset.id;
        const snippet = this.snippets.find(s => s.id === snippetId);
        if (snippet) {
          this.insertSnippet(snippet);
        }
      });
      item.addEventListener('mouseover', () => {
        item.style.background = '#3a3a3a';
      });
      item.addEventListener('mouseout', () => {
        item.style.background = 'transparent';
      });
    });
  }

  insertSnippet(snippet) {
    if (!this.editor) return;

    const { selectionStart, selectionEnd, value } = this.editor;
    const before = value.substring(0, selectionStart);
    const after = value.substring(selectionEnd);

    const newCode = before + snippet.code + after;
    this.editor.value = newCode;

    const newPos = selectionStart + snippet.code.length;
    this.editor.setSelectionRange(newPos, newPos);
    this.editor.focus();
    this.editor.dispatchEvent(new Event('input', { bubbles: true }));

    this.close();

    if (window.showSuccess) {
      window.showSuccess(`✓ Inserted: ${snippet.label}`);
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

window.initSnippetInsert = function(editorId = 'codeEditor') {
  const snippets = new SnippetInsert(editorId);
  window.snippetInsert = snippets;
  snippets.init();
};
