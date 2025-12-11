// Facade maintaining 100% backward compatibility with composition UI builders
import { buildLayoutSelector } from './composition-layout-selector.js';
import { buildPatternList } from './composition-pattern-list.js';
import { buildLayoutControls } from './composition-layout-controls.js';

export class CompositionUI {
  constructor(core) {
    this.core = core;
  }

  buildCompositionUI() {
    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px',
        backgroundColor: '#f9fafb',
        borderRadius: '6px'
      },
      children: [
        this.buildLayoutSelector(),
        this.buildPatternList(),
        this.buildLayoutControls()
      ]
    };
  }

  buildLayoutSelector() {
    return buildLayoutSelector(this.core);
  }

  buildPatternList() {
    return buildPatternList(this.core);
  }

  buildLayoutControls() {
    return buildLayoutControls(this.core);
  }
}
