export function createModal(onSearch, onSelect, onClose) {
  let modal = document.getElementById('snippetModal');
  if (modal) return modal;

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
  closeBtn.onclick = onClose;

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

  input.addEventListener('input', (e) => onSearch(e.target.value));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') onClose();
  });

  return modal;
}

export function closeModal() {
  const modal = document.getElementById('snippetModal');
  if (modal) {
    modal.remove();
  }
}
