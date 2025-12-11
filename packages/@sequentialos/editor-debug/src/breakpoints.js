export function createBreakpointManager(config) {
  const breakpoints = new Map();

  function renderGutter() {
    const gutter = document.getElementById(config.breakpointGutterId);
    if (!gutter) return;

    gutter.innerHTML = '';
    const codeElement = document.getElementById(config.editorId);
    if (!codeElement) return;

    const code = codeElement.value || codeElement.textContent;
    const lines = code.split('\n');

    lines.forEach((_, lineNum) => {
      const lineNumber = lineNum + 1;
      const lineElement = document.createElement('div');
      lineElement.className = 'gutter-line';
      lineElement.dataset.line = lineNumber;

      if (breakpoints.has(lineNumber)) {
        lineElement.classList.add('has-breakpoint');
      }

      lineElement.innerHTML = `
        <span class="gutter-line-number">${lineNumber}</span>
        <div class="breakpoint-indicator"></div>
      `;

      lineElement.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(lineNumber);
      });

      gutter.appendChild(lineElement);
    });
  }

  function toggle(lineNumber) {
    if (breakpoints.has(lineNumber)) {
      breakpoints.delete(lineNumber);
    } else {
      breakpoints.set(lineNumber, { lineNumber, enabled: true });
    }
    renderGutter();
    if (config.onConsoleLog) {
      config.onConsoleLog(`Breakpoint ${breakpoints.has(lineNumber) ? 'set' : 'cleared'} at line ${lineNumber}`, 'info');
    }
  }

  return {
    renderGutter,
    toggle,
    getBreakpoints: () => new Map(breakpoints),
    hasBreakpoint: (line) => breakpoints.has(line)
  };
}
