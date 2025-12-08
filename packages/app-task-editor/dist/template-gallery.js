export const TASK_TEMPLATES = [
  {
    id: 'simple-async',
    name: 'Simple Async Task',
    category: 'Basic',
    description: 'Basic async function with fetch and JSON parsing',
    code: `export async function myTask(input) {
  const response = await fetch('https://api.example.com/data');
  const data = await response.json();
  return { success: true, data };
}`
  },
  {
    id: 'http-with-error',
    name: 'HTTP with Error Handling',
    category: 'HTTP',
    description: 'Fetch with error handling and retry logic',
    code: `export async function fetchWithRetry(input, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(input.url, {
        method: input.method || 'GET',
        headers: input.headers || {},
        body: input.body ? JSON.stringify(input.body) : undefined
      });
      if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
      return await response.json();
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}`
  },
  {
    id: 'tool-call',
    name: 'Tool Invocation',
    category: 'Tools',
    description: 'Call another tool using __callHostTool__',
    code: `export async function orchestrateTools(input) {
  const dbResult = await __callHostTool__('database', 'query', {
    sql: input.query
  });

  const processed = await __callHostTool__('transform', 'process', {
    data: dbResult
  });

  return {
    success: true,
    result: processed
  };
}`
  },
  {
    id: 'validation',
    name: 'Input Validation',
    category: 'Patterns',
    description: 'Validate inputs with error handling',
    code: `export async function validateAndProcess(input) {
  if (!input.email) {
    throw new Error('email is required');
  }
  if (!input.email.includes('@')) {
    throw new Error('invalid email format');
  }

  if (input.age !== undefined && (input.age < 0 || input.age > 150)) {
    throw new Error('age must be between 0 and 150');
  }

  return {
    success: true,
    message: 'Validation passed',
    data: input
  };
}`
  },
  {
    id: 'parallel-ops',
    name: 'Parallel Operations',
    category: 'Async',
    description: 'Execute multiple async operations in parallel',
    code: `export async function parallelFetch(input) {
  const urls = input.urls || [];

  const results = await Promise.all(
    urls.map(url =>
      fetch(url)
        .then(r => r.json())
        .catch(err => ({ error: err.message }))
    )
  );

  return {
    success: true,
    results
  };
}`
  },
  {
    id: 'conditional-logic',
    name: 'Conditional Processing',
    category: 'Patterns',
    description: 'Process data based on conditions',
    code: `export async function conditionalProcess(input) {
  if (!input || !input.type) {
    return { error: 'type is required' };
  }

  switch (input.type) {
    case 'fetch':
      const response = await fetch(input.url);
      return { data: await response.json() };

    case 'calculate':
      return { result: input.a + input.b };

    case 'transform':
      return { data: input.value.toUpperCase() };

    default:
      return { error: 'Unknown type' };
  }
}`
  },
  {
    id: 'data-transform',
    name: 'Data Transformation',
    category: 'Patterns',
    description: 'Transform and format data structures',
    code: `export async function transformData(input) {
  const { items = [] } = input;

  return {
    success: true,
    data: {
      count: items.length,
      formatted: items.map(item => ({
        id: item.id,
        name: item.name?.toUpperCase() || 'UNKNOWN',
        active: !!item.active,
        timestamp: new Date().toISOString()
      })),
      summary: items.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {})
    }
  };
}`
  }
];

export class TemplateGallery {
  constructor() {
    this.selectedTemplate = null;
  }

  show() {
    const modal = document.createElement('div');
    modal.id = 'template-gallery-modal';
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
      <h2 style="color: #4ade80; margin: 0; font-size: 18px;">Task Templates</h2>
      <button id="gallery-close" style="
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
    TASK_TEMPLATES.forEach(t => {
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
        color: #4ade80;
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
        item.className = 'template-item';
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

    const previewCode = document.createElement('pre');
    previewCode.style.cssText = `
      flex: 1;
      margin: 0;
      padding: 20px;
      overflow: auto;
      background: #1a1a1a;
      color: #4ade80;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.5;
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
      <button id="gallery-insert" style="
        background: #4ade80;
        color: #1a1a1a;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        display: none;
      ">Insert Template</button>
      <button id="gallery-cancel" style="
        background: #3a3a3a;
        color: #e0e0e0;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
      ">Cancel</button>
    `;

    preview.appendChild(previewHeader);
    preview.appendChild(previewCode);
    body.appendChild(templateList);
    body.appendChild(preview);
    container.appendChild(header);
    container.appendChild(body);
    container.appendChild(footer);
    modal.appendChild(container);
    document.body.appendChild(modal);

    this.selectedTemplate = null;
    this.previewCode = previewCode;
    this.previewHeader = previewHeader;
    this.insertBtn = document.getElementById('gallery-insert');

    document.getElementById('gallery-close').addEventListener('click', () => {
      modal.remove();
    });

    document.getElementById('gallery-cancel').addEventListener('click', () => {
      modal.remove();
    });

    document.getElementById('gallery-insert').addEventListener('click', () => {
      if (this.selectedTemplate) {
        window.insertTemplate(this.selectedTemplate.code);
        modal.remove();
      }
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  selectTemplate(template, element) {
    this.selectedTemplate = template;
    document.querySelectorAll('.template-item').forEach(item => {
      item.style.borderLeft = '3px solid transparent';
      item.style.paddingLeft = '13px';
    });
    element.style.borderLeft = '3px solid #4ade80';
    element.style.paddingLeft = '13px';
    element.style.background = '#3a3a3a';

    this.previewCode.textContent = template.code;
    this.previewHeader.innerHTML = `
      <div style="color: #4ade80; font-weight: 600; font-size: 16px; margin-bottom: 8px;">${template.name}</div>
      <div style="color: #999; font-size: 13px;">${template.description}</div>
    `;
    this.insertBtn.style.display = 'block';
  }
}

window.insertTemplate = function(code) {
  const editor = document.getElementById('codeEditor');
  if (!editor) return;

  const startPos = editor.selectionStart || editor.value.length;
  const endPos = editor.selectionEnd || editor.value.length;

  const newCode = editor.value.substring(0, startPos) +
                   code +
                   editor.value.substring(endPos);

  editor.value = newCode;
  editor.focus();

  const event = new Event('input', { bubbles: true });
  editor.dispatchEvent(event);

  if (window.showSuccess) {
    window.showSuccess('✓ Template inserted');
  }
};

window.showTemplateGallery = function() {
  const gallery = new TemplateGallery();
  gallery.show();
};
