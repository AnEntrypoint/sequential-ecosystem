// Layout configuration layer - managing flex and grid layouts
export class LayoutManager {
  constructor() {
    this.layoutMode = 'grid';
    this.layoutConfig = {
      columns: 2,
      gap: '16px',
      direction: 'row',
      alignItems: 'stretch',
      justifyContent: 'flex-start'
    };
    this.gridConfig = {
      columns: 'repeat(2, 1fr)',
      gap: '16px',
      autoFlow: 'row',
      templateAreas: null
    };
  }

  setLayoutMode(mode) {
    if (!['grid', 'flex', 'stack', 'carousel'].includes(mode)) {
      throw new Error(`Unknown layout mode: ${mode}`);
    }
    this.layoutMode = mode;
    return true;
  }

  updateLayoutConfig(config) {
    this.layoutConfig = { ...this.layoutConfig, ...config };
    return true;
  }

  updateGridConfig(config) {
    this.gridConfig = { ...this.gridConfig, ...config };
    return true;
  }

  getLayoutState() {
    return {
      layoutMode: this.layoutMode,
      layoutConfig: this.layoutConfig,
      gridConfig: this.gridConfig
    };
  }

  setLayoutState(layoutMode, layoutConfig, gridConfig) {
    this.layoutMode = layoutMode;
    this.layoutConfig = JSON.parse(JSON.stringify(layoutConfig));
    this.gridConfig = JSON.parse(JSON.stringify(gridConfig));
  }
}
