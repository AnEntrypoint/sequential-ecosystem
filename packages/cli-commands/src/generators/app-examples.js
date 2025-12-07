export function generateDataDashboardExample() {
  return {
    name: 'Data Dashboard',
    description: 'Real-time data visualization with updates',
    html: `<!DOCTYPE html>
<html>
<head>
  <title>Data Dashboard</title>
  <style>
    body { font-family: system-ui; padding: 20px; background: #f5f5f5; }
    .dashboard { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
    .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .metric { font-size: 28px; font-weight: bold; color: #007bff; }
    .label { font-size: 12px; color: #666; margin-top: 8px; }
    button { background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
    button:hover { background: #0056b3; }
  </style>
</head>
<body>
  <h1>📊 Data Dashboard</h1>
  <div class="dashboard">
    <div class="card">
      <div class="metric" id="users">0</div>
      <div class="label">Active Users</div>
    </div>
    <div class="card">
      <div class="metric" id="tasks">0</div>
      <div class="label">Tasks Completed</div>
    </div>
    <div class="card">
      <div class="metric" id="uptime">100%</div>
      <div class="label">System Uptime</div>
    </div>
  </div>
  <div style="margin-top: 20px;">
    <button onclick="refreshData()">Refresh Data</button>
  </div>

  <script type="module">
    let sdk = null;

    async function initSDK() {
      const module = await import('/api/app-sdk.js');
      const { AppSDK } = module;
      sdk = new AppSDK({ appId: 'data-dashboard' });
      await sdk.initStorage();
      refreshData();
    }

    async function refreshData() {
      if (!sdk) return;
      try {
        const data = await sdk.callTask('fetch-metrics', {});
        document.getElementById('users').textContent = data.users || 0;
        document.getElementById('tasks').textContent = data.tasks || 0;
        document.getElementById('uptime').textContent = (data.uptime || 100) + '%';
      } catch (e) {
        console.error('Error fetching data:', e);
      }
    }

    window.refreshData = refreshData;
    initSDK();
  </script>
</body>
</html>`
  };
}

export function generateTodoAppExample() {
  return {
    name: 'Todo App',
    description: 'Simple todo list with persistence',
    html: `<!DOCTYPE html>
<html>
<head>
  <title>Todo App</title>
  <style>
    body { font-family: system-ui; max-width: 600px; margin: 0 auto; padding: 20px; }
    .todo-input { display: flex; gap: 10px; margin-bottom: 20px; }
    input { flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
    button { background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
    .todo-list { list-style: none; padding: 0; }
    .todo-item { background: white; padding: 12px; margin-bottom: 8px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .todo-item.done { opacity: 0.6; text-decoration: line-through; }
    .todo-actions { display: flex; gap: 8px; }
    .btn-small { padding: 4px 8px; font-size: 12px; }
  </style>
</head>
<body>
  <h1>✅ Todo App</h1>
  <div class="todo-input">
    <input type="text" id="todoInput" placeholder="Add a new todo...">
    <button onclick="addTodo()">Add</button>
  </div>
  <ul class="todo-list" id="todoList"></ul>

  <script type="module">
    let sdk = null;
    let todos = [];

    async function initSDK() {
      const module = await import('/api/app-sdk.js');
      const { AppSDK } = module;
      sdk = new AppSDK({ appId: 'todo-app' });
      await sdk.initStorage();
      todos = await sdk.getData('todos') || [];
      renderTodos();
    }

    function renderTodos() {
      const list = document.getElementById('todoList');
      list.innerHTML = '';
      todos.forEach((todo, idx) => {
        const li = document.createElement('li');
        li.className = 'todo-item' + (todo.done ? ' done' : '');
        li.innerHTML = \`
          <span onclick="toggleTodo(\${idx})">\${todo.text}</span>
          <div class="todo-actions">
            <button class="btn-small" onclick="deleteTodo(\${idx})">Delete</button>
          </div>
        \`;
        list.appendChild(li);
      });
    }

    async function addTodo() {
      const input = document.getElementById('todoInput');
      if (!input.value.trim()) return;
      todos.push({ text: input.value, done: false });
      input.value = '';
      await saveTodos();
      renderTodos();
    }

    async function toggleTodo(idx) {
      todos[idx].done = !todos[idx].done;
      await saveTodos();
      renderTodos();
    }

    async function deleteTodo(idx) {
      todos.splice(idx, 1);
      await saveTodos();
      renderTodos();
    }

    async function saveTodos() {
      if (sdk) {
        await sdk.setData('todos', todos);
      }
    }

    window.addTodo = addTodo;
    window.toggleTodo = toggleTodo;
    window.deleteTodo = deleteTodo;
    initSDK();
  </script>
</body>
</html>`
  };
}

export function generateFormAppExample() {
  return {
    name: 'Form App',
    description: 'Form submission with validation and processing',
    html: `<!DOCTYPE html>
<html>
<head>
  <title>Form App</title>
  <style>
    body { font-family: system-ui; max-width: 500px; margin: 0 auto; padding: 20px; }
    .form-group { margin-bottom: 16px; }
    label { display: block; margin-bottom: 4px; font-weight: bold; }
    input, textarea, select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
    textarea { resize: vertical; min-height: 120px; }
    button { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; width: 100%; }
    button:hover { background: #0056b3; }
    .message { padding: 12px; border-radius: 4px; margin-top: 16px; }
    .success { background: #d4edda; color: #155724; }
    .error { background: #f8d7da; color: #721c24; }
  </style>
</head>
<body>
  <h1>📋 Feedback Form</h1>
  <form id="form">
    <div class="form-group">
      <label for="name">Name:</label>
      <input type="text" id="name" required>
    </div>
    <div class="form-group">
      <label for="email">Email:</label>
      <input type="email" id="email" required>
    </div>
    <div class="form-group">
      <label for="category">Category:</label>
      <select id="category" required>
        <option>Bug Report</option>
        <option>Feature Request</option>
        <option>General Feedback</option>
      </select>
    </div>
    <div class="form-group">
      <label for="message">Message:</label>
      <textarea id="message" required></textarea>
    </div>
    <button type="submit">Submit Feedback</button>
  </form>
  <div id="response"></div>

  <script type="module">
    let sdk = null;

    async function initSDK() {
      const module = await import('/api/app-sdk.js');
      const { AppSDK } = module;
      sdk = new AppSDK({ appId: 'form-app' });
      await sdk.initStorage();
    }

    document.getElementById('form').addEventListener('submit', async (e) => {
      e.preventDefault();

      const data = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        category: document.getElementById('category').value,
        message: document.getElementById('message').value
      };

      try {
        const result = await sdk.callTask('process-feedback', data);
        const response = document.getElementById('response');
        response.className = 'message success';
        response.textContent = 'Thank you! Your feedback has been submitted.';
        document.getElementById('form').reset();
      } catch (error) {
        const response = document.getElementById('response');
        response.className = 'message error';
        response.textContent = 'Error: ' + error.message;
      }
    });

    initSDK();
  </script>
</body>
</html>`
  };
}

export function generateExampleApps() {
  return [
    generateDataDashboardExample(),
    generateTodoAppExample(),
    generateFormAppExample()
  ];
}
