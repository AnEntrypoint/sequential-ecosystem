// Command palette keyboard event handling
export class PaletteKeyboardHandler {
  constructor(paletteState) {
    this.state = paletteState;
    this.onRender = null;
  }

  setupKeyListener() {
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p' && !e.shiftKey) {
        e.preventDefault();
        this.state.toggle();
        this.onRender?.();
      }

      if (this.state.isOpen) {
        if (e.key === 'Escape') {
          e.preventDefault();
          this.state.close();
          this.onRender?.();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          this.state.selectNext();
          this.onRender?.();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          this.state.selectPrev();
          this.onRender?.();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          this.state.insertSelected();
          this.onRender?.();
        }
      }
    });
  }
}
