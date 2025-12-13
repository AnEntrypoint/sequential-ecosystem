// Command palette facade - maintains 100% backward compatibility
import { PaletteState } from './palette-state.js';
import { PaletteKeyboardHandler } from './palette-keyboard.js';
import { PaletteUIBuilder } from './palette-ui-builder.js';
import { ComponentDOMRenderer } from './component-dom-renderer.js';

class CommandPalettePatterns {
  constructor(patternDiscovery) {
    this.state = new PaletteState(patternDiscovery);
    this.keyboardHandler = new PaletteKeyboardHandler(this.state);
    this.uiBuilder = new PaletteUIBuilder();
    this.renderer = new ComponentDOMRenderer();
    this.container = null;
  }

  init(onSelect) {
    this.state.onSelect = onSelect;
    this.keyboardHandler.setupKeyListener();
    this.keyboardHandler.onRender = () => this.render();
  }

  toggle() {
    this.state.toggle();
    this.render();
  }

  open() {
    this.state.open();
    this.render();
  }

  close() {
    this.state.close();
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  setSearchQuery(query) {
    this.state.setSearchQuery(query);
    this.render();
  }

  selectNext() {
    this.state.selectNext();
    this.render();
  }

  selectPrev() {
    this.state.selectPrev();
    this.render();
  }

  insertSelected() {
    this.state.insertSelected();
    this.render();
  }

  render() {
    if (!this.state.isOpen || !this.container) return;

    this.container.innerHTML = '';
    const modal = this.uiBuilder.buildPaletteUI(this.state);
    this.renderer.renderComponent(modal, this.container);
  }

  attachTo(containerElement) {
    this.container = containerElement;
  }
}

function createCommandPalettePatterns(patternDiscovery) {
  return new CommandPalettePatterns(patternDiscovery);
}

export { CommandPalettePatterns, createCommandPalettePatterns };
