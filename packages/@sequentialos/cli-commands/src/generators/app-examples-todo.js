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
