/**
 * Task Explorer App - Operations Module
 * Core task loading, filtering, and rendering operations
 */

export async function loadTasksFromApi() {
  try {
    const response = await fetch('/api/tasks');
    const json = await response.json();
    return json.data?.tasks || [];
  } catch (error) {
    throw new Error(`Failed to load tasks: ${error.message}`);
  }
}

export function renderTasks(tasks) {
  const list = document.getElementById('taskList');
  list.innerHTML = '';

  if (tasks.length === 0) {
    list.innerHTML = '<li class="task-item"><p class="task-description">No tasks found</p></li>';
    return;
  }

  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.innerHTML = `
      <div class="task-name">${task.name}</div>
      <div class="task-description">${task.description || 'No description'}</div>
      <div class="task-meta">
        <span class="badge">ID: ${task.id.substring(0, 8)}</span>
        <span>Created: ${new Date(task.created).toLocaleDateString()}</span>
      </div>
    `;
    list.appendChild(li);
  });
}

export function filterTasks(allTasks) {
  const query = document.getElementById('searchInput').value.toLowerCase();
  return allTasks.filter(t =>
    t.name.toLowerCase().includes(query) ||
    (t.description && t.description.toLowerCase().includes(query))
  );
}

export function refreshTasks(loadTasksCallback) {
  document.getElementById('loading').style.display = 'block';
  document.getElementById('taskList').innerHTML = '';
  loadTasksCallback();
}

export function showError(errorMsg) {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('errorDiv').style.display = 'block';
  document.getElementById('errorDiv').textContent = errorMsg;
}

export function hideError() {
  document.getElementById('errorDiv').style.display = 'none';
}

export function hideLoading() {
  document.getElementById('loading').style.display = 'none';
}
