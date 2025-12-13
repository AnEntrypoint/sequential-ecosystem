// Layout application and style generation
export class LayoutApplier {
  constructor(presets) {
    this.presets = presets;
  }

  applyLayout(componentDef, layoutName) {
    const layout = this.presets.getLayout(layoutName);
    if (!layout) return componentDef;

    const styled = JSON.parse(JSON.stringify(componentDef));

    if (!styled.style) {
      styled.style = {};
    }

    if (layout.type === 'grid') {
      Object.assign(styled.style, {
        display: 'grid',
        gridTemplateColumns: layout.columns,
        gridTemplateRows: layout.rows,
        gap: layout.gap,
        autoFlow: layout.autoFlow
      });

      if (layout.areas) {
        styled.style.gridTemplateAreas = layout.areas
          .map(area => `"${area.join(' ')}"`)
          .join(' ');
      }
    } else if (layout.type === 'flex') {
      Object.assign(styled.style, {
        display: 'flex',
        flexDirection: layout.direction,
        gap: layout.gap,
        alignItems: layout.alignItems,
        justifyContent: layout.justifyContent,
        flexWrap: layout.wrap ? 'wrap' : 'nowrap'
      });
    }

    if (layout.minHeight) {
      styled.style.minHeight = layout.minHeight;
    }

    if (layout.height) {
      styled.style.height = layout.height;
    }

    styled.layout = layoutName;
    return styled;
  }

  getLayoutStyle(layout) {
    const style = {};

    if (layout.type === 'grid') {
      style.display = 'grid';
      if (layout.columns) style.gridTemplateColumns = layout.columns;
      if (layout.rows) style.gridTemplateRows = layout.rows;
      if (layout.gap) style.gap = layout.gap;
    } else if (layout.type === 'flex') {
      style.display = 'flex';
      style.flexDirection = layout.direction || 'row';
      if (layout.gap) style.gap = layout.gap;
      if (layout.alignItems) style.alignItems = layout.alignItems;
      if (layout.justifyContent) style.justifyContent = layout.justifyContent;
    }

    return style;
  }
}
