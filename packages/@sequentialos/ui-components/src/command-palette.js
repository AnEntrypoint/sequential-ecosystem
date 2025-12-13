/**
 * command-palette.js
 *
 * Command palette modal with search and filtering
 */

export function createCommandPalette(commands) {
  return {
    open() {
      const modal = document.createElement('div');
      modal.id = 'command-palette';
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: flex-start;
        justify-content: center;
        z-index: 10002;
        padding-top: 100px;
      `;

      const box = document.createElement('div');
      box.style.cssText = `
        background: #2a2a2a;
        color: #e0e0e0;
        border-radius: 8px;
        width: 90%;
        max-width: 600px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.6);
      `;

      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Search commands...';
      input.style.cssText = `
        width: 100%;
        padding: 12px 16px;
        border: none;
        background: transparent;
        color: #e0e0e0;
        font-size: 16px;
        outline: none;
        border-bottom: 1px solid #3a3a3a;
      `;

      const list = document.createElement('div');
      list.style.cssText = `
        max-height: 400px;
        overflow-y: auto;
      `;

      let filtered = [...commands];
      input.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        filtered = commands.filter(c =>
          c.name.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query)
        );
        renderList();
      });

      const renderList = () => {
        list.innerHTML = filtered.map((cmd, idx) => `
          <div style="padding: 12px 16px; cursor: pointer; border-bottom: 1px solid #3a3a3a; transition: background 0.2s;"
               onmouseover="this.style.background='#3a3a3a'"
               onmouseout="this.style.background='transparent'"
               onclick="window.commandPaletteCallback('${cmd.id}')">
            <div style="font-weight: 600; color: #4ade80;">${cmd.name}</div>
            <div style="font-size: 12px; color: #999; margin-top: 4px;">${cmd.description}</div>
          </div>
        `).join('');
      };

      box.appendChild(input);
      box.appendChild(list);
      modal.appendChild(box);
      document.body.appendChild(modal);

      input.focus();
      renderList();

      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') modal.remove();
      });
    }
  };
}
