import { asyncHandler } from '../middleware/error-handler.js';
import { formatResponse } from '@sequentialos/response-formatting';
import { throwNotFound } from '@sequentialos/error-handling';

const APP_TEMPLATES = {
  blank: '<html><head><title>{{ name }}</title></head><body><h1>Welcome to {{ name }}</h1></body></html>',
  dashboard: '<html><head><title>Dashboard</title><style>body{font-family:system-ui;padding:20px}.metric{background:#f0f0f0;padding:20px;margin:10px 0;border-radius:4px}</style></head><body><h1>Dashboard</h1><div class="metric"><h2>Metrics</h2><p>Add your metrics here</p></div></body></html>',
  'task-explorer': '<html><head><title>Task Explorer</title><style>body{font-family:system-ui;padding:20px;background:#f5f5f5}h1{color:#333}ul{list-style:none;padding:0}.task-item{background:white;padding:15px;margin:8px 0;border-radius:4px;border-left:4px solid #2196F3;box-shadow:0 2px 4px rgba(0,0,0,0.1)}.task-item h3{margin:0 0 8px 0;color:#333}.task-item p{margin:0;font-size:13px;color:#666}.empty{color:#999;font-style:italic}</style></head><body><h1>Tasks</h1><ul id="tasks"><li class="empty">Loading tasks...</li></ul><script>fetch("/api/tasks").then(r=>r.json()).then(d=>{const tasks=d.data?.tasks||[];const list=document.getElementById("tasks");list.innerHTML="";if(tasks.length===0){list.innerHTML=\'<li class="empty">No tasks found</li>\';return}tasks.forEach(t=>{const li=document.createElement("li");li.className="task-item";li.innerHTML=`<h3>${t.name}</h3><p>ID: ${t.id}</p><p>Runner: ${t.runner||"sequential-js"}</p>`;list.appendChild(li)})}).catch(e=>{document.getElementById("tasks").innerHTML=\'<li class="empty">Error loading tasks: \'+e.message+\'</li>\'})</script></body></html>',
  'flow-viz': '<html><head><title>Flow Visualizer</title><style>body{font-family:system-ui;padding:20px;background:#f5f5f5}h1{color:#333}ul{list-style:none;padding:0}.flow-item{background:white;padding:15px;margin:8px 0;border-radius:4px;border-left:4px solid #4CAF50;box-shadow:0 2px 4px rgba(0,0,0,0.1)}.flow-item h3{margin:0 0 8px 0;color:#333}.flow-item p{margin:0;font-size:13px;color:#666}.empty{color:#999;font-style:italic}</style></head><body><h1>Flows</h1><ul id="flows"><li class="empty">Loading flows...</li></ul><script>fetch("/api/flows").then(r=>r.json()).then(d=>{const flows=d.data||[];const list=document.getElementById("flows");list.innerHTML="";if(flows.length===0){list.innerHTML=\'<li class="empty">No flows found</li>\';return}flows.forEach(f=>{const li=document.createElement("li");li.className="flow-item";li.innerHTML=`<h3>${f.name||f.id}</h3><p>ID: ${f.id}</p>`;list.appendChild(li)})}).catch(e=>{document.getElementById("flows").innerHTML=\'<li class="empty">Error loading flows: \'+e.message+\'</li>\'})</script></body></html>'
};

export function registerUserAppRoutes(app, container) {
  app.get('/api/user-apps', asyncHandler(async (req, res) => {
    const appRepository = container.resolve('AppRepository');
    const apps = await appRepository.getAll();
    const userApps = apps.map(app => ({ ...app, builtin: false }));
    res.json(formatResponse(userApps));
  }));

  app.post('/api/user-apps', asyncHandler(async (req, res) => {
    const { id, name, description, icon, template } = req.body;
    if (!id || !name) {
      return res.status(400).json(formatResponse({ error: 'Missing id or name' }));
    }

    const appRepository = container.resolve('AppRepository');
    const manifest = {
      id,
      name,
      version: '1.0.0',
      description: description || '',
      icon: icon || '📦',
      entry: 'dist/index.html',
      capabilities: ['sequential-os'],
      window: {
        defaultWidth: 1000,
        defaultHeight: 700,
        minWidth: 600,
        minHeight: 400,
        resizable: true,
        maximizable: true
      }
    };

    const html = (APP_TEMPLATES[template] || APP_TEMPLATES.blank).replace('{{ name }}', name);
    const initialFiles = {
      'manifest.json': JSON.stringify(manifest, null, 2),
      'dist/index.html': html
    };

    await appRepository.create(id, manifest, initialFiles);
    res.json(formatResponse(manifest));
  }));

  app.get('/api/user-apps/:appId', asyncHandler(async (req, res) => {
    const { appId } = req.params;
    const appRepository = container.resolve('AppRepository');
    try {
      const manifest = await appRepository.getManifest(appId);
      res.json(formatResponse({ ...manifest, builtin: false }));
    } catch (e) {
      throwNotFound('App', appId);
    }
  }));

  app.get('/api/user-apps/:appId/files', asyncHandler(async (req, res) => {
    const { appId } = req.params;
    const appRepository = container.resolve('AppRepository');
    const files = await appRepository.listFiles(appId);
    res.json(formatResponse(files));
  }));

  app.get('/api/user-apps/:appId/files/*', asyncHandler(async (req, res) => {
    const { appId } = req.params;
    const filePath = req.params[0];
    const appRepository = container.resolve('AppRepository');
    try {
      const content = await appRepository.getFile(appId, filePath);
      res.set('Content-Type', 'text/plain');
      res.send(content);
    } catch (e) {
      if (e.statusCode === 404) {
        return res.status(404).json(formatResponse({ error: 'File not found' }));
      }
      return res.status(e.statusCode || 500).json(formatResponse({ error: e.message }));
    }
  }));

  app.post('/api/user-apps/:appId/files/*', asyncHandler(async (req, res) => {
    const { appId } = req.params;
    const filePath = req.params[0];
    const appRepository = container.resolve('AppRepository');
    let content = '';
    if (typeof req.body === 'string') {
      content = req.body;
    } else if (req.body && typeof req.body === 'object') {
      content = req.body.value || JSON.stringify(req.body);
    }
    await appRepository.saveFile(appId, filePath, content);
    res.json(formatResponse({ success: true, path: filePath }));
  }));

  app.delete('/api/user-apps/:appId/files/*', asyncHandler(async (req, res) => {
    const { appId } = req.params;
    const filePath = req.params[0];
    const appRepository = container.resolve('AppRepository');
    await appRepository.deleteFile(appId, filePath);
    res.json(formatResponse({ success: true }));
  }));

  app.delete('/api/user-apps/:appId', asyncHandler(async (req, res) => {
    const { appId } = req.params;
    const appRepository = container.resolve('AppRepository');
    await appRepository.deleteApp(appId);
    res.json(formatResponse({ success: true }));
  }));
}
