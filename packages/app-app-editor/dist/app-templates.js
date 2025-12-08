export const APP_TEMPLATES = [
  {
    id: 'dashboard',
    name: 'Dashboard App',
    category: 'Layouts',
    description: 'Responsive dashboard with cards and metrics',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <header class="header">
      <h1>Dashboard</h1>
    </header>
    <main class="grid">
      <div class="card">
        <h3>Metric 1</h3>
        <p class="value">1,234</p>
      </div>
      <div class="card">
        <h3>Metric 2</h3>
        <p class="value">5,678</p>
      </div>
      <div class="card">
        <h3>Metric 3</h3>
        <p class="value">9,012</p>
      </div>
      <div class="card">
        <h3>Metric 4</h3>
        <p class="value">3,456</p>
      </div>
    </main>
  </div>
  <script src="app.js"><\/script>
</body>
</html>`,
      'styles.css': `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: system-ui; background: #f5f5f5; }
.container { max-width: 1200px; margin: 0 auto; padding: 20px; }
.header { background: #2a2a2a; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
.header h1 { font-size: 28px; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
.card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.card h3 { color: #666; font-size: 14px; margin-bottom: 10px; }
.card .value { color: #2a2a2a; font-size: 28px; font-weight: bold; }`,
      'app.js': `console.log('Dashboard app loaded');`
    }
  },
  {
    id: 'form',
    name: 'Form App',
    category: 'Inputs',
    description: 'Contact form with validation',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact Form</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <h1>Contact Us</h1>
    <form id="contactForm">
      <div class="form-group">
        <label for="name">Name</label>
        <input type="text" id="name" name="name" required>
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" name="email" required>
      </div>
      <div class="form-group">
        <label for="message">Message</label>
        <textarea id="message" name="message" rows="5" required><\/textarea>
      </div>
      <button type="submit" class="btn-submit">Send</button>
    </form>
  </div>
  <script src="app.js"><\/script>
</body>
</html>`,
      'styles.css': `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: system-ui; background: #f5f5f5; }
.container { max-width: 600px; margin: 40px auto; padding: 40px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.container h1 { margin-bottom: 30px; color: #2a2a2a; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 8px; color: #666; font-weight: 600; }
.form-group input, .form-group textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-family: inherit; }
.form-group input:focus, .form-group textarea:focus { outline: none; border-color: #4ade80; box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.1); }
.btn-submit { background: #4ade80; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; }
.btn-submit:hover { background: #22c55e; }`,
      'app.js': `document.getElementById('contactForm').addEventListener('submit', (e) => {
  e.preventDefault();
  alert('Form submitted!');
});`
    }
  },
  {
    id: 'data-grid',
    name: 'Data Grid',
    category: 'Tables',
    description: 'Sortable data table',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Data Grid</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <h1>Data Table</h1>
    <table class="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Status</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>Item A</td>
          <td><span class="badge active">Active</span></td>
          <td>2025-01-01</td>
        </tr>
        <tr>
          <td>2</td>
          <td>Item B</td>
          <td><span class="badge inactive">Inactive</span></td>
          <td>2025-01-02</td>
        </tr>
        <tr>
          <td>3</td>
          <td>Item C</td>
          <td><span class="badge active">Active</span></td>
          <td>2025-01-03</td>
        </tr>
      </tbody>
    </table>
  </div>
  <script src="app.js"><\/script>
</body>
</html>`,
      'styles.css': `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: system-ui; background: #f5f5f5; }
.container { max-width: 1000px; margin: 20px auto; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.container h1 { margin-bottom: 20px; color: #2a2a2a; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table thead { background: #f9f9f9; }
.data-table th { padding: 12px; text-align: left; color: #666; font-weight: 600; border-bottom: 2px solid #e0e0e0; }
.data-table td { padding: 12px; border-bottom: 1px solid #e0e0e0; }
.data-table tbody tr:hover { background: #f9f9f9; }
.badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
.badge.active { background: #d1fae5; color: #065f46; }
.badge.inactive { background: #fee2e2; color: #991b1b; }`,
      'app.js': `console.log('Data grid app loaded');`
    }
  }
];

export class AppTemplateGallery {
  constructor() {
    this.selectedTemplate = null;
  }

  show() {
    const modal = document.createElement('div');
    modal.id = 'app-template-gallery-modal';
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
      max-width: 1000px;
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
      <h2 style="color: #f59e0b; margin: 0; font-size: 18px;">App Templates</h2>
      <button id="app-gallery-close" style="
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
      width: 280px;
      overflow-y: auto;
      background: #2a2a2a;
    `;

    const categories = {};
    APP_TEMPLATES.forEach(t => {
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
        color: #f59e0b;
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
        item.className = 'app-template-item';
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
      <button id="app-gallery-create" style="
        background: #f59e0b;
        color: #1a1a1a;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        display: none;
      ">Create App</button>
      <button id="app-gallery-cancel" style="
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
    this.createBtn = document.getElementById('app-gallery-create');

    document.getElementById('app-gallery-close').addEventListener('click', () => {
      modal.remove();
    });

    document.getElementById('app-gallery-cancel').addEventListener('click', () => {
      modal.remove();
    });

    document.getElementById('app-gallery-create').addEventListener('click', () => {
      if (this.selectedTemplate) {
        window.createAppFromTemplate(this.selectedTemplate);
        modal.remove();
      }
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  selectTemplate(template, element) {
    this.selectedTemplate = template;
    document.querySelectorAll('.app-template-item').forEach(item => {
      item.style.borderLeft = '3px solid transparent';
      item.style.paddingLeft = '13px';
    });
    element.style.borderLeft = '3px solid #f59e0b';
    element.style.paddingLeft = '13px';
    element.style.background = '#3a3a3a';

    const fileList = Object.keys(template.files)
      .map(name => `<div style="margin: 6px 0; padding: 6px; background: #2a2a2a; border-radius: 3px;">
        <span style="color: #f59e0b; font-weight: 600;">${name}</span>
      </div>`)
      .join('');

    this.previewHeader.innerHTML = `
      <div style="color: #f59e0b; font-weight: 600; font-size: 16px; margin-bottom: 8px;">${template.name}</div>
      <div style="color: #999; font-size: 13px;">${template.description}</div>
    `;

    this.previewContent.innerHTML = `
      <div style="margin-bottom: 16px;">
        <div style="color: #4ade80; font-weight: 600; margin-bottom: 8px;">Files:</div>
        ${fileList}
      </div>
    `;

    this.createBtn.style.display = 'block';
  }
}

window.createAppFromTemplate = function(template) {
  console.log('Creating app from template:', template.name);

  if (window.showSuccess) {
    window.showSuccess(`✓ Created from ${template.name} template`);
  }
};

window.showAppTemplateGallery = function() {
  const gallery = new AppTemplateGallery();
  gallery.show();
};
