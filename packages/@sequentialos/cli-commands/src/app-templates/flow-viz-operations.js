/**
 * Flow Visualizer App - Operations Module
 * Core flow loading and visualization operations
 */

export async function loadFlowsFromApi() {
  try {
    const response = await fetch('/api/flows');
    const json = await response.json();
    return json.data?.flows || [];
  } catch (error) {
    throw new Error(`Failed to load flows: ${error.message}`);
  }
}

export function renderFlowList(flows, onFlowSelect) {
  const list = document.getElementById('flowList');
  list.innerHTML = '';

  if (flows.length === 0) {
    list.innerHTML = '<li class="flow-item"><p style="color: #999">No flows found</p></li>';
    return;
  }

  flows.forEach((flow, index) => {
    const li = document.createElement('li');
    li.className = 'flow-item';
    if (index === 0) li.classList.add('active');

    const stateCount = flow.states ? Object.keys(flow.states).length : 0;

    li.innerHTML = `
      <div class="flow-name">${flow.name || flow.id}</div>
      <div class="flow-states-count">${stateCount} states</div>
    `;

    li.onclick = () => onFlowSelect(flow, li);
    list.appendChild(li);
  });

  if (flows.length > 0) {
    onFlowSelect(flows[0], list.querySelector('.flow-item'));
  }
}

export function selectFlow(flow, flowItem, visualizeCallback) {
  document.querySelectorAll('.flow-item').forEach(item => {
    item.classList.remove('active');
  });
  flowItem?.classList.add('active');
  visualizeCallback(flow);
}

export function visualizeFlow(flow) {
  const diagram = document.getElementById('diagram');
  const states = flow.states || {};
  const stateNames = Object.keys(states);

  if (stateNames.length === 0) {
    diagram.innerHTML = '<p class="loading">No states in this flow</p>';
    return;
  }

  let html = '';
  stateNames.forEach((stateName, index) => {
    const state = states[stateName];
    const stateType = state.type === 'final' ? 'final' : (stateName === flow.initial ? 'initial' : 'normal');

    html += `<div class="state-node ${stateType}">${stateName}</div>`;

    if (index < stateNames.length - 1) {
      html += '<div class="arrow">→</div>';
    }
  });

  diagram.innerHTML = html;
}

export function showError(errorMsg) {
  const errorElement = document.getElementById('errorMsg');
  errorElement.style.display = 'block';
  errorElement.textContent = errorMsg;
}

export function hideError() {
  const errorElement = document.getElementById('errorMsg');
  errorElement.style.display = 'none';
}
